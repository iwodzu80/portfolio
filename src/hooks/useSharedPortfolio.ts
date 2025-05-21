
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SectionData, ProjectData } from "@/utils/localStorage";
import { toast } from "sonner";
import { validateAndFormatUrl, sanitizeText } from "@/utils/securityUtils";

export interface ProfileData {
  name: string;
  photo: string;
  email: string;
  telephone: string;
  role: string;
  tagline: string;
}

export const useSharedPortfolio = (shareId: string | undefined) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    photo: "",
    email: "",
    telephone: "",
    role: "",
    tagline: ""
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
        
        // Fetch the share record
        const { data: shareData, error: shareError } = await supabase
          .from('portfolio_shares')
          .select('user_id, active')
          .eq('share_id', sanitizedShareId)
          .single();
          
        if (shareError) {
          console.error("Error fetching share data:", shareError);
          setNotFound(true);
          setIsLoading(false);
          return;
        }
        
        if (!shareData || !shareData.active) {
          console.error("Share not found or inactive");
          setNotFound(true);
          setIsLoading(false);
          return;
        }
        
        const userId = shareData.user_id;
        console.log(`Found share for user ID: ${userId}`);
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (profileError) {
          console.error("Error fetching shared profile:", profileError);
          throw profileError;
        }
        
        if (profileData) {
          console.log("Profile data retrieved:", profileData);
          
          // Sanitize all text data for security
          const sanitizedProfileData = {
            name: sanitizeText(profileData.name || ""),
            photo: profileData.photo || "", // URLs handled separately
            email: sanitizeText(profileData.email || ""),
            telephone: sanitizeText(profileData.telephone || ""),
            role: sanitizeText(profileData.role || ""),
            tagline: sanitizeText(profileData.tagline || "")
          };
          
          setProfileData(sanitizedProfileData);
          
          setOwnerName(sanitizedProfileData.name || "Portfolio Owner");
          
          // Set document title
          if (sanitizedProfileData.name) {
            document.title = `${sanitizedProfileData.name}'s Portfolio`;
          }
        }
        
        // Direct fetch of sections with projects and links in a single query
        const { data: sectionsRaw, error: sectionsError } = await supabase
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
          .order('created_at', { ascending: true });
          
        if (sectionsError) {
          console.error("Error fetching sections:", sectionsError);
          throw sectionsError;
        }
        
        console.log("Raw sections data from database:", sectionsRaw);
        
        // Process and validate the sections data
        if (!sectionsRaw || !Array.isArray(sectionsRaw) || sectionsRaw.length === 0) {
          console.log("No sections found or invalid sections format", sectionsRaw);
          setSections([]);
          setIsLoading(false);
          return;
        }
        
        // Transform the raw data to match our expected format
        const formattedSections: SectionData[] = sectionsRaw.map(section => {
          // Ensure section has the expected structure
          if (!section || typeof section !== 'object') {
            console.error("Invalid section object:", section);
            return {
              id: "invalid-section",
              title: "Invalid Section",
              projects: []
            };
          }
          
          // Process projects if they exist and sanitize data
          const projects = Array.isArray(section.projects) 
            ? section.projects.map(project => {
                if (!project) return null;
                
                // Process links if they exist and sanitize URLs
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
        });
        
        console.log("Formatted sections after processing:", formattedSections);
        setSections(formattedSections);
        
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
