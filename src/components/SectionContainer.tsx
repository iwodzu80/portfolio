
import React, { useState } from "react";
import ProjectList from "./ProjectList";
import { SectionData, saveSections } from "../utils/localStorage";
import EditableField from "./EditableField";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface SectionContainerProps {
  sections: SectionData[];
  onUpdate: () => void;
  isEditingMode?: boolean;
}

const SectionContainer: React.FC<SectionContainerProps> = ({ sections, onUpdate, isEditingMode = true }) => {
  const [isEditingSections, setIsEditingSections] = useState(false);
  
  // Ensure sections is never undefined
  const safeSections = Array.isArray(sections) ? sections : [];
  
  const handleUpdateSection = (sectionId: string, title: string) => {
    const updatedSections = safeSections.map(section => 
      section.id === sectionId ? { ...section, title } : section
    );
    saveSections(updatedSections);
    onUpdate();
    toast.success("Section updated");
  };
  
  const handleDeleteSection = (sectionId: string) => {
    if (safeSections.length <= 1) {
      toast.error("You must have at least one section");
      return;
    }
    
    const updatedSections = safeSections.filter(section => section.id !== sectionId);
    saveSections(updatedSections);
    onUpdate();
    toast.success("Section deleted");
  };
  
  const handleAddSection = () => {
    const newSection: SectionData = {
      id: `section-${Date.now()}`,
      title: "New Section",
      projects: []
    };
    
    const updatedSections = [...safeSections, newSection];
    saveSections(updatedSections);
    onUpdate();
    toast.success("New section added");
  };
  
  return (
    <div className="pb-20">
      {safeSections.map((section) => (
        <div key={section.id} className="mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            {isEditingMode ? (
              <>
                <EditableField
                  value={section.title}
                  onChange={(value) => handleUpdateSection(section.id, value)}
                  tag="h2"
                  className="text-xl font-semibold text-center"
                  placeholder="Section Title"
                />
                
                {isEditingSections && (
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    className="text-portfolio-muted hover:text-red-500 transition-colors"
                    aria-label="Delete section"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </>
            ) : (
              <h2 className="text-xl font-semibold text-center">{section.title}</h2>
            )}
          </div>
          
          <ProjectList
            sectionId={section.id}
            projects={section.projects}
            onUpdate={onUpdate}
            isEditingMode={isEditingMode}
          />
        </div>
      ))}
      
      {isEditingMode && (
        <div className="max-w-md mx-auto px-6 mt-8">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleAddSection}
              className="py-3 px-4 border-2 border-dashed border-portfolio-light-blue rounded-lg 
                text-portfolio-blue hover:bg-portfolio-light-blue/10 transition-colors flex items-center justify-center"
            >
              <Plus size={18} className="mr-2" />
              Add Section
            </button>
            
            <button 
              onClick={() => setIsEditingSections(!isEditingSections)}
              className={`py-3 px-4 rounded-lg flex items-center justify-center transition-colors ${
                isEditingSections 
                  ? 'bg-portfolio-blue text-white' 
                  : 'border border-portfolio-blue text-portfolio-blue'
              }`}
            >
              <Pencil size={18} className="mr-2" />
              {isEditingSections ? 'Done' : 'Edit Sections'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionContainer;
