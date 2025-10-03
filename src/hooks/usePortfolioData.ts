
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileData } from "@/hooks/useProfileData";
import { useSectionData } from "@/hooks/useSectionData";
import { useDefaultSectionCreator } from "@/hooks/useDefaultSectionCreator";

export const usePortfolioData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { profileData, fetchProfileData, createProfile } = useProfileData(user?.id);
  const { sections, fetchSections } = useSectionData(user?.id);
  const { createDefaultSection } = useDefaultSectionCreator();

  const loadData = useCallback(async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    try {
      const profile = await fetchProfileData();
      
      if (!profile) {
        await createProfile(user.email);
      }
      
      const fetchedSections = await fetchSections();
      
      if (fetchedSections.length === 0) {
        const created = await createDefaultSection(user.id);
        if (created) {
          await fetchSections();
        }
      }
    } catch (error: any) {
      console.error("Error loading data:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user, navigate, fetchProfileData, createProfile, fetchSections, createDefaultSection]);

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
