
import React, { useState } from "react";
import ProfileSection from "@/components/ProfileSection";
import SectionContainer from "@/components/SectionContainer";
import { Toaster } from "sonner";
import PortfolioHeader from "@/components/PortfolioHeader";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";

const Index = () => {
  const [isEditingMode, setIsEditingMode] = useState(false);
  const { profileData, sections, isLoading, loadData } = usePortfolioData();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-portfolio-bg pb-12">
      <Toaster position="top-center" />
      
      <div className="container mx-auto pt-10">
        <div className="flex justify-between items-center mb-6 px-4">
          <PortfolioHeader 
            isEditingMode={isEditingMode} 
            setIsEditingMode={setIsEditingMode} 
          />
          
          <Link 
            to="/analytics" 
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 bg-white rounded-md px-3 py-2 shadow-sm transition-colors"
          >
            <BarChart3 size={18} />
            <span>View Analytics</span>
          </Link>
        </div>

        <ProfileSection
          name={profileData.name}
          photo={profileData.photo}
          email={profileData.email}
          telephone={profileData.telephone}
          tagline={profileData.tagline}
          onUpdate={loadData}
          isEditingMode={isEditingMode}
        />
        
        <div className="my-6 border-t border-gray-200 max-w-md mx-auto" />
        
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
