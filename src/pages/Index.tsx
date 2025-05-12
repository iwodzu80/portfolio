
import React, { useState, useEffect } from "react";
import ProfileSection from "@/components/ProfileSection";
import SectionContainer from "@/components/SectionContainer";
import { loadData, SectionData } from "@/utils/localStorage";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";

const Index = () => {
  const [profileData, setProfileData] = useState({
    name: "",
    photo: "",
    email: "",
    location: "",
    tagline: ""
  });
  const [sections, setSections] = useState<SectionData[]>([]);
  const [isEditingMode, setIsEditingMode] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = () => {
    const data = loadData();
    setProfileData(data.profile);
    // Ensure we always have an array for sections
    setSections(Array.isArray(data.sections) ? data.sections : []);
  };

  return (
    <div className="min-h-screen bg-portfolio-bg pb-12">
      <Toaster position="top-center" />
      
      <div className="container mx-auto pt-10">
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => setIsEditingMode(!isEditingMode)}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isEditingMode ? (
              <>
                <Eye size={18} />
                View Mode
              </>
            ) : (
              <>
                <Pencil size={18} />
                Edit Mode
              </>
            )}
          </Button>
        </div>

        <ProfileSection
          name={profileData.name}
          photo={profileData.photo}
          email={profileData.email}
          location={profileData.location}
          tagline={profileData.tagline}
          onUpdate={loadPortfolioData}
          isEditingMode={isEditingMode}
        />
        
        <div className="my-6 border-t border-gray-200 max-w-md mx-auto" />
        
        <SectionContainer
          sections={sections}
          onUpdate={loadPortfolioData}
          isEditingMode={isEditingMode}
        />
      </div>
    </div>
  );
};

export default Index;
