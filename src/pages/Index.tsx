
import React, { useState } from "react";
import ProfileSection from "@/components/ProfileSection";
import SectionContainer from "@/components/SectionContainer";
import PortfolioHeader from "@/components/PortfolioHeader";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import LoadingSpinner from "@/components/LoadingSpinner";

const Index = () => {
  const [isEditingMode, setIsEditingMode] = useState(false);
  const { profileData, sections, isLoading, loadData } = usePortfolioData();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-portfolio-bg pb-12">
      <div className="container mx-auto pt-10">
        <div className="px-4">
          <PortfolioHeader 
            isEditingMode={isEditingMode} 
            setIsEditingMode={setIsEditingMode} 
          />
        </div>

        <ProfileSection
          name={profileData.name}
          photo={profileData.photo}
          email={profileData.email}
          telephone={profileData.telephone}
          role={profileData.role}
          tagline={profileData.tagline}
          description={profileData.description}
          onUpdate={loadData}
          isEditingMode={isEditingMode}
        />
        
        <div className="my-4 border-t border-gray-200 max-w-xl mx-auto" />
        
        <SectionContainer
          sections={sections}
          onUpdate={loadData}
          isEditingMode={isEditingMode}
        />
      </div>
    </div>
  );
};

export default Index;
