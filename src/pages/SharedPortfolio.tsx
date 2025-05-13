import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProfileSection from "@/components/ProfileSection";
import SectionContainer from "@/components/SectionContainer";
import { supabase } from "@/integrations/supabase/client";
import { SectionData, getPortfolioData } from "@/utils/localStorage";
import { toast } from "sonner";

interface ShareData {
  id?: string;
  user_id: string;
  share_id: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

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
          .maybeSingle() as unknown as {
            data: ShareData | null;
            error: any;
          };
          
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
        
        // For sections data, use localStorage for now since we don't have those tables in Supabase yet
        // We'll use the user's ID to request the data from the owner's perspective
        // This is temporary until we migrate sections/projects data to Supabase
        try {
          // In a real implementation, we would fetch this data from Supabase tables
          // For now, we'll use mock data that resembles what would come from localStorage
          // In a future update, this should be replaced with actual Supabase queries
          
          // Get data from localStorage (this will be empty or from the current user, not the shared portfolio)
          // In production, this would come from Supabase tables related to the userId
          const portfolioData = getPortfolioData();
          setSections(portfolioData.sections || []);
        } catch (error) {
          console.error("Error processing sections data:", error);
          setSections([]);
        }
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
