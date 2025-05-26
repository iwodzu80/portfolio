
import React, { useCallback } from "react";
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

const SectionItem: React.FC<SectionItemProps> = React.memo(({
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
  const handleUpdateSection = useCallback((value: string) => {
    onUpdateSection(section.id, value);
  }, [section.id, onUpdateSection]);

  const handleMoveUp = useCallback(() => {
    onMoveSection(section.id, 'up');
  }, [section.id, onMoveSection]);

  const handleMoveDown = useCallback(() => {
    onMoveSection(section.id, 'down');
  }, [section.id, onMoveSection]);

  const handleDelete = useCallback(() => {
    onDeleteSection(section.id);
  }, [section.id, onDeleteSection]);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-center gap-2 mb-4">
        {isEditingMode ? (
          <>
            <EditableField
              value={section.title}
              onChange={handleUpdateSection}
              tag="h2"
              className="text-xl font-semibold text-center"
              placeholder="Section Title"
            />
            
            {isEditingSections && (
              <>
                <button
                  onClick={handleMoveUp}
                  className="text-portfolio-muted hover:text-portfolio-blue transition-colors"
                  aria-label="Move section up"
                  disabled={index === 0}
                >
                  <ArrowUp size={18} className={index === 0 ? "opacity-30" : ""} />
                </button>
                <button
                  onClick={handleMoveDown}
                  className="text-portfolio-muted hover:text-portfolio-blue transition-colors"
                  aria-label="Move section down"
                  disabled={index === totalSections - 1}
                >
                  <ArrowDown size={18} className={index === totalSections - 1 ? "opacity-30" : ""} />
                </button>
                <button
                  onClick={handleDelete}
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
});

SectionItem.displayName = "SectionItem";

export default SectionItem;
