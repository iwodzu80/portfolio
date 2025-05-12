
import React, { useState } from "react";
import ProjectList from "./ProjectList";
import { SectionData, saveSections } from "../utils/localStorage";
import EditableField from "./EditableField";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface SectionContainerProps {
  sections: SectionData[];
  onUpdate: () => void;
}

const SectionContainer: React.FC<SectionContainerProps> = ({ sections, onUpdate }) => {
  const [isEditingMode, setIsEditingMode] = useState(false);
  
  const handleUpdateSection = (sectionId: string, title: string) => {
    const updatedSections = sections.map(section => 
      section.id === sectionId ? { ...section, title } : section
    );
    saveSections(updatedSections);
    onUpdate();
    toast.success("Section updated");
  };
  
  const handleDeleteSection = (sectionId: string) => {
    if (sections.length <= 1) {
      toast.error("You must have at least one section");
      return;
    }
    
    const updatedSections = sections.filter(section => section.id !== sectionId);
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
    
    const updatedSections = [...sections, newSection];
    saveSections(updatedSections);
    onUpdate();
    toast.success("New section added");
  };
  
  return (
    <div className="pb-20">
      {sections.map((section) => (
        <div key={section.id} className="mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <EditableField
              value={section.title}
              onChange={(value) => handleUpdateSection(section.id, value)}
              tag="h2"
              className="text-xl font-semibold text-center"
              placeholder="Section Title"
            />
            
            {isEditingMode && (
              <button
                onClick={() => handleDeleteSection(section.id)}
                className="text-portfolio-muted hover:text-red-500 transition-colors"
                aria-label="Delete section"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
          
          <ProjectList
            sectionId={section.id}
            projects={section.projects}
            onUpdate={onUpdate}
          />
        </div>
      ))}
      
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
            onClick={() => setIsEditingMode(!isEditingMode)}
            className={`py-3 px-4 rounded-lg flex items-center justify-center transition-colors ${
              isEditingMode 
                ? 'bg-portfolio-blue text-white' 
                : 'border border-portfolio-blue text-portfolio-blue'
            }`}
          >
            <Pencil size={18} className="mr-2" />
            {isEditingMode ? 'Done' : 'Edit Sections'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionContainer;
