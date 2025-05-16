
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProfileSection from "@/components/ProfileSection";
import SectionContainer from "@/components/SectionContainer";
import { supabase } from "@/integrations/supabase/client";
import { SectionData, ProjectData } from "@/utils/localStorage";
import { toast } from "sonner";

interface ShareData {
  id: string;
  user_id: string;
  share_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const SharedPortfolio = () => {
  const { shareId } = useParams();
  const [profileData, setProfileData] = useState({
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
        
        // Fetch each set of data separately to ensure correct nesting
        console.log(`Fetching sections for user ID: ${userId}`);
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('sections')
          .select('id, title')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });
          
        if (sectionsError) {
          console.error("Error fetching shared sections:", sectionsError);
          throw sectionsError;
        }
        
        console.log("Raw sections data:", sectionsData);
        
        if (!sectionsData || sectionsData.length === 0) {
          console.log("No sections found for user");
          setSections([]);
          setIsLoading(false);
          return;
        }
        
        // Process each section and get its projects
        const processedSections: SectionData[] = [];
        
        for (const section of sectionsData) {
          // Fetch projects for this section
          const { data: projectsData, error: projectsError } = await supabase
            .from('projects')
            .select('id, title, description')
            .eq('section_id', section.id);
            
          if (projectsError) {
            console.error(`Error fetching projects for section ${section.id}:`, projectsError);
            continue; // Skip this section if there's an error but continue with others
          }
          
          const projects: ProjectData[] = [];
          
          // For each project, fetch its links
          for (const project of (projectsData || [])) {
            const { data: linksData, error: linksError } = await supabase
              .from('links')
              .select('id, title, url')
              .eq('project_id', project.id);
              
            if (linksError) {
              console.error(`Error fetching links for project ${project.id}:`, linksError);
              continue;
            }
            
            projects.push({
              id: project.id,
              title: project.title,
              description: project.description || "",
              links: linksData || []
            });
          }
          
          processedSections.push({
            id: section.id,
            title: section.title,
            projects: projects
          });
        }
        
        console.log("Processed sections data:", processedSections);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Portfolio Not Found</h1>
        <p className="mb-6 text-muted-foreground">This shared portfolio doesn't exist or has been deactivated.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-portfolio-bg pb-12">
      <div className="container mx-auto pt-10">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500">
            Shared Portfolio - Read Only
          </div>
        </div>

        <ProfileSection
          name={profileData.name}
          photo={profileData.photo}
          email={profileData.email}
          telephone={profileData.telephone}
          tagline={profileData.tagline}
          onUpdate={() => {}}
          isEditingMode={false}
        />
        
        <div className="my-6 border-t border-gray-200 max-w-md mx-auto" />
        
        {sections.length > 0 ? (
          <SectionContainer
            sections={sections}
            onUpdate={() => {}}
            isEditingMode={false}
          />
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No projects to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedPortfolio;
