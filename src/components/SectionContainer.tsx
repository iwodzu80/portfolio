
import React, { useState, useEffect } from "react";
import { SectionData } from "../utils/localStorage";
import SectionItem from "./SectionItem";
import SectionControls from "./SectionControls";
import { useSectionOperations } from "@/hooks/useSectionOperations";

interface SectionContainerProps {
  sections: SectionData[];
  onUpdate: () => void;
  isEditingMode?: boolean;
}

const SectionContainer: React.FC<SectionContainerProps> = ({ 
  sections, 
  onUpdate, 
  isEditingMode = true 
}) => {
  const [isEditingSections, setIsEditingSections] = useState(false);
  const [localSections, setLocalSections] = useState<SectionData[]>(sections);
  
  const {
    handleUpdateSection,
    handleDeleteSection,
    handleAddSection,
    handleMoveSection
  } = useSectionOperations(localSections, setLocalSections, onUpdate);
  
  useEffect(() => {
    console.log("SectionContainer received sections:", sections);
    console.log("Number of sections in SectionContainer:", sections?.length || 0);
    
    if (Array.isArray(sections)) {
      setLocalSections(sections);
    } else {
      console.error("Sections prop is not an array:", sections);
      setLocalSections([]);
    }
  }, [sections]);
  
  const safeSections = Array.isArray(localSections) ? localSections : [];
  
  console.log("SectionContainer rendering with safeSections:", safeSections.length);
  if (safeSections.length > 0) {
    safeSections.forEach((section, index) => {
      console.log(`Section ${index + 1}: ${section.title} with ${section.projects?.length || 0} projects`);
    });
  }
  
  return (
    <div className="pb-20">
      {safeSections.length > 0 ? (
        safeSections.map((section, index) => (
          <SectionItem
            key={section.id || `section-${index}`}
            section={section}
            index={index}
            totalSections={safeSections.length}
            isEditingMode={isEditingMode}
            isEditingSections={isEditingSections}
            onUpdate={onUpdate}
            onUpdateSection={handleUpdateSection}
            onDeleteSection={handleDeleteSection}
            onMoveSection={handleMoveSection}
          />
        ))
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No sections available</p>
        </div>
      )}
      
      {isEditingMode && (
        <SectionControls
          isEditingSections={isEditingSections}
          onToggleEditSections={() => setIsEditingSections(!isEditingSections)}
          onAddSection={handleAddSection}
        />
      )}
    </div>
  );
};

export default SectionContainer;
