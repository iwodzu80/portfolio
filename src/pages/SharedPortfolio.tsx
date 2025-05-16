
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SectionData } from "@/utils/localStorage";
import SharedPortfolioHeader from "@/components/shared/SharedPortfolioHeader";
import SharedPortfolioLoading from "@/components/shared/SharedPortfolioLoading";
import SharedPortfolioNotFound from "@/components/shared/SharedPortfolioNotFound";
import ProfileSection from "@/components/ProfileSection";
import SectionContainer from "@/components/SectionContainer";

type ProfileData = {
  name: string;
  photo: string;
  email: string;
  telephone: string;
  tagline: string;
};

const SharedPortfolio = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
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
        // First, verify the share link is valid
        const { data: shareData, error: shareError } = await supabase
          .from('portfolio_shares')
          .select('user_id')
          .eq('share_id', shareId)
          .eq('active', true)
          .maybeSingle();

        if (shareError || !shareData) {
          console.error("Error fetching share:", shareError);
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        const userId = shareData.user_id;

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else if (profileData) {
          setProfileData({
            name: profileData.name || "",
            photo: profileData.photo || "",
            email: profileData.email || "",
            telephone: profileData.telephone || "",
            tagline: profileData.tagline || ""
          });
        }

        // Fetch sections data
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
          console.error("Error fetching sections:", sectionsError);
        } else if (sectionsData) {
          const transformedSections: SectionData[] = sectionsData.map(section => ({
            id: section.id,
            title: section.title,
            projects: section.projects.map(project => ({
              id: project.id,
              title: project.title,
              description: project.description || "",
              links: project.links.map(link => ({
                id: link.id,
                title: link.title,
                url: link.url
              }))
            }))
          }));
          
          setSections(transformedSections);
        }

      } catch (error: any) {
        console.error("Error loading shared portfolio data:", error.message);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedPortfolio();
  }, [shareId]);

  if (isLoading) {
    return <SharedPortfolioLoading />;
  }

  if (notFound || !profileData) {
    return <SharedPortfolioNotFound />;
  }

  return (
    <div className="min-h-screen bg-portfolio-bg pb-12">
      <SharedPortfolioHeader />
      
      <div className="container mx-auto pt-10">
        <ProfileSection
          name={profileData.name}
          photo={profileData.photo}
          email={profileData.email}
          telephone={profileData.telephone}
          tagline={profileData.tagline}
          onUpdate={() => {}}
          isEditingMode={false}
          isReadOnly={true}
        />
        
        <div className="my-6 border-t border-gray-200 max-w-md mx-auto" />
        
        <SectionContainer
          sections={sections}
          onUpdate={() => {}}
          isEditingMode={false}
          isReadOnly={true}
        />
      </div>
    </div>
  );
};

export default SharedPortfolio;
