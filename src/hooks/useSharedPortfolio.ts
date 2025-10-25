
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
        console.log("[useSharedPortfolio] Starting fetch for shareId:", sanitizedShareId);
        console.log("[useSharedPortfolio] User authenticated:", !!(await supabase.auth.getSession()).data.session);
        
        // Use the secure SECURITY DEFINER function to get user_id without exposing enumeration
        const { data: userId, error: userError } = await supabase
          .rpc('get_user_from_share', { share_id_param: sanitizedShareId });
          
        console.log("[useSharedPortfolio] get_user_from_share result:", { userId, userError });
          
        if (userError || !userId) {
          console.error("[useSharedPortfolio] Share not found or not active:", { userError, userId });
          setNotFound(true);
          setIsLoading(false);
          return;
        }
        
        // Use Promise.all to execute queries concurrently
        // This significantly reduces total wait time
        const [profileData, sectionsData] = await Promise.all([
          // Query 1: Fetch profile using the secure public_profiles view
          // This view automatically filters email/phone based on privacy settings
          supabase
            .from('public_profiles')
            .select('name, photo_url, email, phone, role, tagline, description, social_links, show_email, show_phone')
            .eq('user_id', userId)
            .single(),
            
          // Query 2: Fetch sections with projects, links, and features (including project_role and key_learnings)
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
                key_learnings,
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
          // Note: email and phone are already filtered by the public_profiles view based on privacy settings
          const data = profileData.data;
          
          const sanitizedProfileData = {
            name: sanitizeText(data.name || ""),
            photo: data.photo_url || "", 
            email: sanitizeText(data.email || ""),
            telephone: sanitizeText(data.phone || ""),
            role: sanitizeText(data.role || ""),
            tagline: sanitizeText(data.tagline || ""),
            description: data.description || "", // Keep HTML for sanitizeHtml rendering
            social_links: (Array.isArray(data.social_links) ? data.social_links : []).map((link: any) => ({
              id: sanitizeText(link.id || ""),
              platform: sanitizeText(link.platform || ""),
              url: validateAndFormatUrl(link.url || ""),
              customName: link.customName ? sanitizeText(link.customName) : undefined,
            })),
            show_email: data.show_email,
            show_phone: data.show_phone
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
                    description: project.description || "", // Keep HTML for sanitizeHtml rendering
                    project_role: project.project_role ? sanitizeText(project.project_role) : undefined,
                    key_learnings: Array.isArray(project.key_learnings) 
                      ? project.key_learnings.map(learning => sanitizeText(learning))
                      : [],
                    links,
                    features
                  };
                }).filter(Boolean) as ProjectData[]
              : [];
            
            return {
              id: section.id,
              title: sanitizeText(section.title || "Untitled Section"),
              description: section.description || "", // Keep HTML for sanitizeHtml rendering
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
