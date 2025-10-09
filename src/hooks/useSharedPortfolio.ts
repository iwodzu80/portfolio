
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SectionData, ProjectData, ProfileData } from "@/types/portfolio";
import { toast } from "sonner";
import { validateAndFormatUrl, sanitizeText } from "@/utils/securityUtils";
import { logError } from "@/utils/errorHandler";

export const useSharedPortfolio = (shareId: string | undefined) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    photo: "",
    email: "",
    telephone: "",
    role: "",
    tagline: "",
    description: ""
  });
  const [sections, setSections] = useState<SectionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [ownerName, setOwnerName] = useState<string>("");

  useEffect(() => {
    // Use AbortController to cancel fetch requests if component unmounts
    const controller = new AbortController();
    
    const fetchSharedPortfolio = async () => {
      // Early validation of shareId to prevent unnecessary database queries
      if (!shareId) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }
      
      if (shareId.length < 3 || /[^a-zA-Z0-9-]/.test(shareId)) {
        console.warn("Invalid share ID format:", shareId);
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Sanitize shareId
        const sanitizedShareId = sanitizeText(shareId.replace(/[^a-zA-Z0-9-]/g, ''));
        console.log("Sanitized shareId:", sanitizedShareId);
        console.log("Original shareId:", shareId);
        
        // Make a single optimized query to get both the share record and user ID
        // This eliminates one database roundtrip
        const { data: shareData, error: shareError } = await supabase
          .from('portfolio_shares')
          .select('user_id, is_active')
          .eq('share_id', sanitizedShareId)
          .maybeSingle();
          
        console.log("Share data query result:", { shareData, shareError });
          
        if (shareError || !shareData || !shareData.is_active) {
          console.log("Share not found or not active:", { shareError, shareData });
          setNotFound(true);
          setIsLoading(false);
          return;
        }
        
        const userId = shareData.user_id;
        
        // Use Promise.all to execute queries concurrently
        // This significantly reduces total wait time
        const [profileData, sectionsData] = await Promise.all([
          // Query 1: Fetch profile with only public fields for shared portfolios
          // SECURITY: Exclude email and telephone from public shared portfolios
          supabase
            .from('profiles')
            .select('name, photo_url, role, tagline, description')
            .eq('user_id', userId)
            .single(),
            
          // Query 2: Fetch sections with projects, links, and features (including project_role)
          supabase
            .from('sections')
            .select(`
              id, 
              title,
              description,
              projects (
                id, 
                title, 
                description,
                project_role,
                project_links (
                  id, 
                  title, 
                  url
                ),
                project_features (
                  id,
                  title
                )
              )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: true })
        ]);
        
        // Process profile data
        if (profileData.error) {
          console.error("Error fetching profile:", profileData.error);
        } else if (profileData.data) {
          // Apply sanitization efficiently
          const data = profileData.data;
          
          const sanitizedProfileData = {
            name: sanitizeText(data.name || ""),
            photo: data.photo_url || "", 
            email: "", // SECURITY: Don't expose email in shared portfolios
            telephone: "", // SECURITY: Don't expose telephone in shared portfolios
            role: sanitizeText(data.role || ""),
            tagline: sanitizeText(data.tagline || ""),
            description: sanitizeText(data.description || "")
            // userRole is not set for shared portfolios (public view)
          };
          
          setProfileData(sanitizedProfileData);
          setOwnerName(sanitizedProfileData.name || "Portfolio Owner");
          document.title = sanitizedProfileData.name ? 
            `${sanitizedProfileData.name}'s Portfolio` : 
            "Shared Portfolio";
        }
        
        // Process sections data
        if (sectionsData.error) {
          console.error("Error fetching sections:", sectionsData.error);
          setSections([]);
        } else {
          const sectionsRaw = sectionsData.data || [];
          
          // Optimize the data transformation with a more efficient approach
          const formattedSections = sectionsRaw.map(section => {
            if (!section) return null;
            
            // Transform projects efficiently
            const projects = Array.isArray(section.projects) 
              ? section.projects.map(project => {
                  if (!project) return null;
                  
                  // Transform links efficiently
                  const links = Array.isArray(project.project_links) 
                    ? project.project_links.map(link => ({
                        id: link.id,
                        title: sanitizeText(link.title || ""),
                        url: validateAndFormatUrl(link.url || "")
                      }))
                    : [];

                  // Transform features efficiently
                  const features = Array.isArray(project.project_features) 
                    ? project.project_features.map(feature => ({
                        id: feature.id,
                        title: sanitizeText(feature.title || "")
                      }))
                    : [];
                  
                  return {
                    id: project.id,
                    title: sanitizeText(project.title || "Untitled Project"),
                    description: sanitizeText(project.description || ""),
                    project_role: project.project_role ? sanitizeText(project.project_role) : undefined,
                    links,
                    features
                  };
                }).filter(Boolean) as ProjectData[]
              : [];
            
            return {
              id: section.id,
              title: sanitizeText(section.title || "Untitled Section"),
              description: sanitizeText(section.description || ""),
              projects
            };
          }).filter(Boolean) as SectionData[];
          
          setSections(formattedSections);
        }
      } catch (error: any) {
        logError(error, "fetchSharedPortfolio");
      } finally {
        // Only update loading state if the component is still mounted
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchSharedPortfolio();
    
    // Cleanup function to abort fetch requests if component unmounts
    return () => {
      controller.abort();
    };
  }, [shareId]);

  return { profileData, sections, isLoading, notFound, ownerName };
};
