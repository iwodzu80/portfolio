
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileData, SectionData } from "@/types/portfolio";
import { useProfileData } from "@/hooks/useProfileData";
import { useSectionData } from "@/hooks/useSectionData";
import { useDefaultSectionCreator } from "@/hooks/useDefaultSectionCreator";

export const usePortfolioData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { profileData, setProfileData, fetchProfileData, createProfile } = useProfileData(user?.id);
  const { sections, setSections, fetchSections } = useSectionData(user?.id);
  const { createDefaultSection } = useDefaultSectionCreator();

  // Load data from Supabase for the current user's profile and sections
  const loadData = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Fetching data for user:", user.id);
      
      // Fetch profile data
      const profile = await fetchProfileData();
      
      // If no profile exists, create one
      if (!profile) {
        console.log("No profile found, creating one...");
        await createProfile(user.email);
      }
      
      // Fetch sections
      const fetchedSections = await fetchSections();
      
      // If no sections found, create a default section
      if (fetchedSections.length === 0) {
        const created = await createDefaultSection(user.id);
        if (created) {
          // Reload sections if we created a default one
          await fetchSections();
        }
      }
    } catch (error: any) {
      console.error("Error loading data:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  return {
    profileData,
    sections,
    isLoading,
    loadData
  };
};
