
import React from "react";
import { useParams } from "react-router-dom";
import ProfileSection from "@/components/ProfileSection";
import SectionContainer from "@/components/SectionContainer";
import { useSharedPortfolio } from "@/hooks/useSharedPortfolio";
import SharedPortfolioHeader from "@/components/SharedPortfolioHeader";
import SharedPortfolioNotFound from "@/components/SharedPortfolioNotFound";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Toaster } from "sonner";

const SharedPortfolio = () => {
  const { shareId } = useParams();
  const { profileData, sections, isLoading, notFound } = useSharedPortfolio(shareId);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (notFound) {
    return <SharedPortfolioNotFound />;
  }

  return (
    <div className="min-h-screen bg-portfolio-bg pb-12">
      <Toaster position="top-center" />
      <div className="container mx-auto pt-10 px-4">
        <SharedPortfolioHeader />

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
