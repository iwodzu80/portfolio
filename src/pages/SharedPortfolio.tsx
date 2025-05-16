
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProfileSection from "@/components/ProfileSection";
import SectionContainer from "@/components/SectionContainer";
import { SectionData } from "@/utils/localStorage";
import { Loader2 } from "lucide-react";

const SharedPortfolio = () => {
  const { shareId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [sections, setSections] = useState<SectionData[]>([]);

  useEffect(() => {
    const fetchSharedPortfolio = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!shareId) {
          setError("Invalid share link");
          setLoading(false);
          return;
        }

        // 1. Find the share by share_id
        const { data: shareData, error: shareError } = await supabase
          .from('portfolio_shares')
          .select('user_id')
          .eq('share_id', shareId)
          .eq('active', true)
          .single();

        if (shareError || !shareData) {
          console.error("Error fetching share:", shareError);
          setError("This shared portfolio link is invalid or has been disabled");
          setLoading(false);
          return;
        }

        // 2. Get the user's profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', shareData.user_id)
          .single();

        if (profileError || !profileData) {
          console.error("Error fetching profile:", profileError);
          setError("Could not load portfolio data");
          setLoading(false);
          return;
        }

        // 3. Get the user's sections with projects and links
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('sections')
          .select('*')
          .eq('user_id', shareData.user_id);

        if (sectionsError) {
          console.error("Error fetching sections:", sectionsError);
          setError("Could not load portfolio data");
          setLoading(false);
          return;
        }

        // 4. Get all projects for these sections
        const allSectionIds = sectionsData.map(section => section.id);
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .in('section_id', allSectionIds);

        if (projectsError) {
          console.error("Error fetching projects:", projectsError);
          setError("Could not load portfolio data");
          setLoading(false);
          return;
        }

        // 5. Get all links for these projects
        const allProjectIds = projectsData.map(project => project.id);
        const { data: linksData, error: linksError } = await supabase
          .from('links')
          .select('*')
          .in('project_id', allProjectIds);

        if (linksError) {
          console.error("Error fetching links:", linksError);
          setError("Could not load portfolio data");
          setLoading(false);
          return;
        }

        // 6. Build the sections data structure with projects and links
        const formattedSections: SectionData[] = sectionsData.map(section => {
          const sectionProjects = projectsData
            .filter(project => project.section_id === section.id)
            .map(project => {
              const projectLinks = linksData
                .filter(link => link.project_id === project.id)
                .map(link => ({
                  id: link.id,
                  title: link.title,
                  url: link.url
                }));

              return {
                id: project.id,
                title: project.title,
                description: project.description || "",
                links: projectLinks
              };
            });

          return {
            id: section.id,
            title: section.title,
            projects: sectionProjects
          };
        });

        setProfile(profileData);
        setSections(formattedSections);
        setLoading(false);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
        setLoading(false);
      }
    };

    fetchSharedPortfolio();
  }, [shareId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-portfolio-blue" />
        <span className="ml-2">Loading shared portfolio...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-gray-700 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      {profile && (
        <>
          <ProfileSection
            name={profile.name || ""}
            photo={profile.photo || ""}
            email={profile.email || ""}
            telephone={profile.telephone || ""}
            tagline={profile.tagline || ""}
            onUpdate={() => {}}
            isEditingMode={false}
            isReadOnly={true}
          />
          
          <SectionContainer
            sections={sections}
            onUpdate={() => {}}
            isEditingMode={false}
            isReadOnly={true}
          />
        </>
      )}
    </div>
  );
};

export default SharedPortfolio;
