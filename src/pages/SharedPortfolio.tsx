
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProfileSection from "@/components/ProfileSection";
import SectionContainer from "@/components/SectionContainer";
import { supabase } from "@/integrations/supabase/client";
import { SectionData } from "@/utils/localStorage";
import { toast } from "sonner";

const SharedPortfolio = () => {
  const { shareId } = useParams();
  const [profileData, setProfileData] = useState({
    name: "",
    photo: "",
    email: "",
    location: "",
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
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch the share record
        const { data: shareData, error: shareError } = await supabase
          .from('portfolio_shares')
          .select('user_id, active')
          .eq('share_id', shareId)
          .maybeSingle();
          
        if (shareError || !shareData || !shareData.active) {
          console.error("Share not found or inactive:", shareError || "No data");
          setNotFound(true);
          setIsLoading(false);
          return;
        }
        
        const userId = shareData.user_id;
        
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
          setProfileData({
            name: profileData.name || "",
            photo: profileData.photo || "",
            email: profileData.email || "",
            location: profileData.location || "",
            tagline: profileData.tagline || ""
          });
          
          // Set document title
          if (profileData.name) {
            document.title = `${profileData.name}'s Portfolio`;
          }
        }
        
        // Fetch sections and related data
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('sections')
          .select('id, title')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });
          
        if (sectionsError) {
          console.error("Error fetching sections:", sectionsError);
          throw sectionsError;
        }
        
        // Transform sections data and fetch projects for each section
        const transformedSections = await Promise.all(sectionsData.map(async (section) => {
          // Fetch projects for this section
          const { data: projectsData, error: projectsError } = await supabase
            .from('projects')
            .select('id, title, description')
            .eq('section_id', section.id)
            .order('created_at', { ascending: true });
            
          if (projectsError) {
            console.error(`Error fetching projects for section ${section.id}:`, projectsError);
            return {
              id: section.id,
              title: section.title,
              projects: []
            };
          }
          
          // Fetch links for each project
          const projectsWithLinks = await Promise.all(projectsData.map(async (project) => {
            const { data: linksData, error: linksError } = await supabase
              .from('project_links')
              .select('id, title, url')
              .eq('project_id', project.id)
              .order('created_at', { ascending: true });
              
            if (linksError) {
              console.error(`Error fetching links for project ${project.id}:`, linksError);
              return {
                id: project.id,
                title: project.title,
                description: project.description || "",
                links: []
              };
            }
            
            return {
              id: project.id,
              title: project.title,
              description: project.description || "",
              links: linksData
            };
          }));
          
          return {
            id: section.id,
            title: section.title,
            projects: projectsWithLinks
          };
        }));
        
        setSections(transformedSections);
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
          location={profileData.location}
          tagline={profileData.tagline}
          onUpdate={() => {}}
          isEditingMode={false}
        />
        
        <div className="my-6 border-t border-gray-200 max-w-md mx-auto" />
        
        <SectionContainer
          sections={sections}
          onUpdate={() => {}}
          isEditingMode={false}
        />
      </div>
    </div>
  );
};

export default SharedPortfolio;
