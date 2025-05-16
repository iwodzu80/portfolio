
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SectionData, ProjectData } from "@/utils/localStorage";
import { toast } from "sonner";

export interface ProfileData {
  name: string;
  photo: string;
  email: string;
  telephone: string;
  tagline: string;
}

export const useSharedPortfolio = (shareId: string | undefined) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    photo: "",
    email: "",
    telephone: "",
    tagline: ""
  });
  const [sections, setSections] = useState<SectionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchSharedPortfolio = async () => {
      if (!shareId) {
        setNotFound(true);
        setIsLoading(false);
        console.error("No shareId provided in URL params");
        return;
      }

      try {
        setIsLoading(true);
        console.log(`Fetching shared portfolio with ID: ${shareId}`);
        
        // Fetch the share record
        const { data: shareData, error: shareError } = await supabase
          .from('portfolio_shares')
          .select('user_id, active')
          .eq('share_id', shareId)
          .maybeSingle();
          
        if (shareError) {
          console.error("Error fetching share data:", shareError);
          throw shareError;
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
          .maybeSingle();
          
        if (profileError) {
          console.error("Error fetching shared profile:", profileError);
          throw profileError;
        }
        
        if (profileData) {
          console.log("Profile data retrieved:", profileData);
          setProfileData({
            name: profileData.name || "",
            photo: profileData.photo || "",
            email: profileData.email || "",
            telephone: profileData.telephone || "",
            tagline: profileData.tagline || ""
          });
          
          // Set document title
          if (profileData.name) {
            document.title = `${profileData.name}'s Portfolio`;
          }
        }
        
        // Fetch sections with their projects and links in a single query
        console.log(`Fetching sections for user ID: ${userId}`);
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('sections')
          .select(`
            id, 
            title,
            projects:projects(
              id, 
              title, 
              description,
              links:links(
                id, 
                title, 
                url
              )
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: true });
          
        if (sectionsError) {
          console.error("Error fetching shared sections:", sectionsError);
          throw sectionsError;
        }
        
        console.log("Raw sections data from nested query:", sectionsData);
        console.log("Number of sections found:", sectionsData?.length || 0);
        
        if (!sectionsData || sectionsData.length === 0) {
          console.log("No sections found for user");
          setSections([]);
          setIsLoading(false);
          return;
        }
        
        // Transform the nested data into the expected format
        const processedSections: SectionData[] = sectionsData.map((section: any) => {
          console.log(`Processing section: ${section.id} - ${section.title}`);
          console.log(`Projects in section ${section.id}:`, section.projects);
          
          // Map projects
          const processedProjects: ProjectData[] = section.projects.map((project: any) => {
            console.log(`Processing project: ${project.id} - ${project.title}`);
            console.log(`Links in project ${project.id}:`, project.links);
            
            return {
              id: project.id,
              title: project.title,
              description: project.description || "",
              links: project.links || []
            };
          });
          
          return {
            id: section.id,
            title: section.title,
            projects: processedProjects
          };
        });
        
        console.log("Processed sections data:", processedSections);
        console.log("Final number of sections with projects:", processedSections.length);
        setSections(processedSections);
        
      } catch (error: any) {
        console.error("Error fetching shared portfolio:", error);
        toast.error("Failed to load shared portfolio");
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedPortfolio();
  }, [shareId]);

  return { profileData, sections, isLoading, notFound };
};
