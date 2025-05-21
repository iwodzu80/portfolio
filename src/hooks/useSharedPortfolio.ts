
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
    const fetchSharedPortfolio = async () => {
      if (!shareId) {
        setNotFound(true);
        setIsLoading(false);
        console.error("No shareId provided in URL params");
        return;
      }

      // Security check - sanitize and validate the shareId
      const sanitizedShareId = sanitizeText(shareId.replace(/[^a-zA-Z0-9-]/g, ''));
      if (sanitizedShareId !== shareId || shareId.length < 8) {
        console.error("Invalid share ID format detected");
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log(`Fetching shared portfolio with ID: ${sanitizedShareId}`);
        
        // Fetch the share record and user profile in a single query with eager loading
        const { data: shareData, error: shareError } = await supabase
          .from('portfolio_shares')
          .select('user_id, active')
          .eq('share_id', sanitizedShareId)
          .single();
          
        if (shareError || !shareData || !shareData.active) {
          console.error("Share not found, inactive, or error:", shareError);
          setNotFound(true);
          setIsLoading(false);
          return;
        }
        
        const userId = shareData.user_id;
        
        // Fetch profile and sections in parallel for better performance
        const [profileResponse, sectionsResponse] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single(),
            
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
        
        // Handle profile data
        if (profileResponse.error) {
          console.error("Error fetching profile:", profileResponse.error);
          toast.error("Failed to load profile data");
        } else if (profileResponse.data) {
          // Sanitize profile data
          const sanitizedProfileData = {
            name: sanitizeText(profileResponse.data.name || ""),
            photo: profileResponse.data.photo || "", 
            email: sanitizeText(profileResponse.data.email || ""),
            telephone: sanitizeText(profileResponse.data.telephone || ""),
            role: sanitizeText(profileResponse.data.role || ""),
            tagline: sanitizeText(profileResponse.data.tagline || ""),
            description: sanitizeText(profileResponse.data.description || "")
          };
          
          setProfileData(sanitizedProfileData);
          setOwnerName(sanitizedProfileData.name || "Portfolio Owner");
          
          // Set document title
          if (sanitizedProfileData.name) {
            document.title = `${sanitizedProfileData.name}'s Portfolio`;
          }
        }
        
        // Handle sections data
        if (sectionsResponse.error) {
          console.error("Error fetching sections:", sectionsResponse.error);
          toast.error("Failed to load portfolio sections");
          setSections([]);
        } else {
          const sectionsRaw = sectionsResponse.data;
          
          // Process sections data
          if (!Array.isArray(sectionsRaw) || sectionsRaw.length === 0) {
            console.log("No sections found");
            setSections([]);
          } else {
            // Transform raw data to match expected format
            const formattedSections: SectionData[] = sectionsRaw.map(section => {
              if (!section) return null;
              
              // Process projects
              const projects = Array.isArray(section.projects) 
                ? section.projects.map(project => {
                    if (!project) return null;
                    
                    // Process links
                    const links = Array.isArray(project.links) 
                      ? project.links.map(link => ({
                          id: link.id || `temp-${Math.random().toString(36)}`,
                          title: sanitizeText(link.title || ""),
                          url: validateAndFormatUrl(link.url || "")
                        }))
                      : [];
                    
                    return {
                      id: project.id || `temp-${Math.random().toString(36)}`,
                      title: sanitizeText(project.title || "Untitled Project"),
                      description: sanitizeText(project.description || ""),
                      links
                    };
                  }).filter(Boolean) as ProjectData[]
                : [];
              
              return {
                id: section.id || `temp-${Math.random().toString(36)}`,
                title: sanitizeText(section.title || "Untitled Section"),
                projects
              };
            }).filter(Boolean) as SectionData[];
            
            setSections(formattedSections);
          }
        }
      } catch (error: any) {
        console.error("Error in fetchSharedPortfolio:", error);
        toast.error("Failed to load shared portfolio");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedPortfolio();
  }, [shareId]);

  return { profileData, sections, isLoading, notFound, ownerName };
};
