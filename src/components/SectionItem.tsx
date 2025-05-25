
import React from "react";
import ProjectList from "./ProjectList";
import EditableField from "./EditableField";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { SectionData } from "@/types/portfolio";

interface SectionItemProps {
  section: SectionData;
  index: number;
  totalSections: number;
  isEditingMode: boolean;
  isEditingSections: boolean;
  onUpdate: () => void;
  onUpdateSection: (sectionId: string, title: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onMoveSection: (sectionId: string, direction: 'up' | 'down') => void;
}

const SectionItem: React.FC<SectionItemProps> = ({
  section,
  index,
  totalSections,
  isEditingMode,
  isEditingSections,
  onUpdate,
  onUpdateSection,
  onDeleteSection,
  onMoveSection
}) => {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-center gap-2 mb-4">
        {isEditingMode ? (
          <>
            <EditableField
              value={section.title}
              onChange={(value) => onUpdateSection(section.id, value)}
              tag="h2"
              className="text-xl font-semibold text-center"
              placeholder="Section Title"
            />
            
            {isEditingSections && (
              <>
                <button
                  onClick={() => onMoveSection(section.id, 'up')}
                  className="text-portfolio-muted hover:text-portfolio-blue transition-colors"
                  aria-label="Move section up"
                  disabled={index === 0}
                >
                  <ArrowUp size={18} className={index === 0 ? "opacity-30" : ""} />
                </button>
                <button
                  onClick={() => onMoveSection(section.id, 'down')}
                  className="text-portfolio-muted hover:text-portfolio-blue transition-colors"
                  aria-label="Move section down"
                  disabled={index === totalSections - 1}
                >
                  <ArrowDown size={18} className={index === totalSections - 1 ? "opacity-30" : ""} />
                </button>
                <button
                  onClick={() => onDeleteSection(section.id)}
                  className="text-portfolio-muted hover:text-red-500 transition-colors"
                  aria-label="Delete section"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </>
        ) : (
          <h2 className="text-xl font-semibold text-center">{section.title || "Untitled Section"}</h2>
        )}
      </div>
      
      <ProjectList
        sectionId={section.id}
        projects={section.projects || []}
        onUpdate={onUpdate}
        isEditingMode={isEditingMode}
      />
    </div>
  );
};

export default SectionItem;
