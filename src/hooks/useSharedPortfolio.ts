import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SectionData, ProjectData, ProfileData } from "@/types/portfolio";
import { toast } from "sonner";
import { validateAndFormatUrl, sanitizeText } from "@/utils/securityUtils";

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
      if (!shareId || shareId.length < 8 || /[^a-zA-Z0-9-]/.test(shareId)) {
        console.error("Invalid share ID format detected");
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Sanitize shareId
        const sanitizedShareId = sanitizeText(shareId.replace(/[^a-zA-Z0-9-]/g, ''));
        
        // Make a single optimized query to get both the share record and user ID
        // This eliminates one database roundtrip
        const { data: shareData, error: shareError } = await supabase
          .from('portfolio_shares')
          .select('user_id, active')
          .eq('share_id', sanitizedShareId)
          .single();
          
        if (shareError || !shareData || !shareData.active) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }
        
        const userId = shareData.user_id;
        
        // Use Promise.all to execute both queries concurrently
        // This significantly reduces total wait time
        const [profileData, sectionsData] = await Promise.all([
          // Query 1: Fetch profile with minimal fields needed for display
          supabase
            .from('profiles')
            .select('name, photo, email, telephone, role, tagline, description')
            .eq('id', userId)
            .single(),
            
          // Query 2: Fetch sections with projects and links
          supabase
            .from('sections')
            .select(`
              id, 
              title,
              projects (
                id, 
                title, 
                description,
                links (
                  id, 
                  title, 
                  url
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
            photo: data.photo || "", 
            email: sanitizeText(data.email || ""),
            telephone: sanitizeText(data.telephone || ""),
            role: sanitizeText(data.role || ""),
            tagline: sanitizeText(data.tagline || ""),
            description: sanitizeText(data.description || "")
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
                  const links = Array.isArray(project.links) 
                    ? project.links.map(link => ({
                        id: link.id,
                        title: sanitizeText(link.title || ""),
                        url: validateAndFormatUrl(link.url || "")
                      }))
                    : [];
                  
                  return {
                    id: project.id,
                    title: sanitizeText(project.title || "Untitled Project"),
                    description: sanitizeText(project.description || ""),
                    links
                  };
                }).filter(Boolean) as ProjectData[]
              : [];
            
            return {
              id: section.id,
              title: sanitizeText(section.title || "Untitled Section"),
              projects
            };
          }).filter(Boolean) as SectionData[];
          
          setSections(formattedSections);
        }
      } catch (error: any) {
        console.error("Error in fetchSharedPortfolio:", error);
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
