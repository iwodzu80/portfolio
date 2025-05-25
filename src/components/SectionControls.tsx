
import React from "react";
import { Plus, Pencil } from "lucide-react";

interface SectionControlsProps {
  isEditingSections: boolean;
  onToggleEditSections: () => void;
  onAddSection: () => void;
}

const SectionControls: React.FC<SectionControlsProps> = ({
  isEditingSections,
  onToggleEditSections,
  onAddSection
}) => {
  return (
    <div className="max-w-xl mx-auto px-6 mt-8">
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onAddSection}
          className="py-3 px-4 border-2 border-dashed border-portfolio-light-blue rounded-lg 
            text-portfolio-blue hover:bg-portfolio-light-blue/10 transition-colors flex items-center justify-center"
        >
          <Plus size={18} className="mr-2" />
          Add Section
        </button>
        
        <button 
          onClick={onToggleEditSections}
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
  );
};

export default SectionControls;
