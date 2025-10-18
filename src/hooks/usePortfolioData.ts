
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileData } from "@/hooks/useProfileData";
import { useSectionData } from "@/hooks/useSectionData";
import { useDefaultSectionCreator } from "@/hooks/useDefaultSectionCreator";

export const usePortfolioData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { profileData, fetchProfileData, createProfile } = useProfileData(user?.id);
  const { sections, fetchSections } = useSectionData(user?.id);
  const { createDefaultSection } = useDefaultSectionCreator();

  const loadData = useCallback(async (force = false) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Only show loading on first load or forced refresh
    if (!hasLoadedOnce || force) {
      setIsLoading(true);
    }
    
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
      
      setHasLoadedOnce(true);
    } catch (error: any) {
      console.error("Error loading data:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user, navigate, fetchProfileData, createProfile, fetchSections, createDefaultSection, hasLoadedOnce]);

  useEffect(() => {
    if (user && !hasLoadedOnce) {
      loadData();
    }
  }, [user, hasLoadedOnce]);

  return {
    profileData,
    sections,
    isLoading,
    loadData
  };
};
