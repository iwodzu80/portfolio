import React, { useState, useEffect } from "react";
import ProjectList from "./ProjectList";
import { SectionData } from "../utils/localStorage";
import EditableField from "./EditableField";
import { Pencil, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SectionContainerProps {
  sections: SectionData[];
  onUpdate: () => void;
  isEditingMode?: boolean;
}

const SectionContainer: React.FC<SectionContainerProps> = ({ sections, onUpdate, isEditingMode = true }) => {
  const [isEditingSections, setIsEditingSections] = useState(false);
  const [localSections, setLocalSections] = useState<SectionData[]>(sections);
  const { user } = useAuth();
  
  // Update localSections when props change (e.g., on initial load)
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
  
  // Ensure sections is never undefined
  const safeSections = Array.isArray(localSections) ? localSections : [];
  
  console.log("SectionContainer rendering with safeSections:", safeSections.length);
  if (safeSections.length > 0) {
    safeSections.forEach((section, index) => {
      console.log(`Section ${index + 1}: ${section.title} with ${section.projects?.length || 0} projects`);
    });
  }
  
  const handleUpdateSection = async (sectionId: string, title: string) => {
    try {
      // Update section in Supabase
      const { error } = await supabase
        .from('sections')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', sectionId)
        .eq('user_id', user?.id);
        
      if (error) {
        throw error;
      }
      
      // Update local state immediately for responsive UI
      const updatedSections = safeSections.map(section => 
        section.id === sectionId ? { ...section, title } : section
      );
      
      setLocalSections(updatedSections);
      toast.success("Section updated");
    } catch (error: any) {
      console.error("Error updating section:", error.message);
      toast.error("Failed to update section");
    }
  };
  
  const handleDeleteSection = async (sectionId: string) => {
    if (safeSections.length <= 1) {
      toast.error("You must have at least one section");
      return;
    }
    
    try {
      // Delete section in Supabase (cascade will handle related projects and links)
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', sectionId)
        .eq('user_id', user?.id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedSections = safeSections.filter(section => section.id !== sectionId);
      setLocalSections(updatedSections);
      toast.success("Section deleted");
    } catch (error: any) {
      console.error("Error deleting section:", error.message);
      toast.error("Failed to delete section");
    }
  };
  
  const handleAddSection = async () => {
    try {
      // Insert new section in Supabase
      const { data, error } = await supabase
        .from('sections')
        .insert({
          user_id: user?.id,
          title: "New Section"
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Create new section with empty projects array
      const newSection: SectionData = {
        id: data.id,
        title: data.title,
        projects: []
      };
      
      // Update local state
      const updatedSections = [...safeSections, newSection];
      setLocalSections(updatedSections);
      toast.success("New section added");
    } catch (error: any) {
      console.error("Error adding section:", error.message);
      toast.error("Failed to add section");
    }
  };

  const handleMoveSection = async (sectionId: string, direction: 'up' | 'down') => {
    const currentIndex = safeSections.findIndex(section => section.id === sectionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' 
      ? Math.max(0, currentIndex - 1) 
      : Math.min(safeSections.length - 1, currentIndex + 1);

    // If section is already at the top/bottom, do nothing
    if (newIndex === currentIndex) {
      return;
    }

    const newSections = [...safeSections];
    const [movedSection] = newSections.splice(currentIndex, 1);
    newSections.splice(newIndex, 0, movedSection);

    // Update local state immediately for responsive UI
    setLocalSections(newSections);
    
    try {
      // In a future implementation, we could add a position column 
      // For now, we're just ordering by created_at (timestamp)
      // So we will update the timestamps to reflect the new order

      // Get the current timestamp as baseline
      const baseTime = new Date();
      
      // Create an array of promises to update each section's timestamp
      // We'll use timestamps spaced 1 second apart to maintain order
      const updatePromises = newSections.map((section, index) => {
        // Calculate a new timestamp for each section based on its position
        // Earlier positions get more recent timestamps (for descending sort)
        // or older timestamps (for ascending sort)
        const newTimestamp = new Date(baseTime.getTime() + (index * 1000)).toISOString();
        
        return supabase
          .from('sections')
          .update({ 
            updated_at: newTimestamp,
            created_at: newTimestamp // Update created_at since we're sorting by it
          })
          .eq('id', section.id)
          .eq('user_id', user?.id);
      });
      
      // Execute all updates
      const results = await Promise.all(updatePromises);
      
      // Check if any updates had errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error("Errors updating section order:", errors);
        throw new Error("Failed to update section order");
      }
      
      toast.success(`Section moved ${direction}`);
      
      // Trigger the parent component to reload data from the database
      onUpdate();
    } catch (error: any) {
      console.error("Error saving section order:", error);
      toast.error("Failed to save section order");
      
      // Revert the local state if there was an error
      setLocalSections(safeSections);
    }
  };
  
  return (
    <div className="pb-20">
      {safeSections.length > 0 ? (
        safeSections.map((section, index) => (
          <div key={section.id || `section-${index}`} className="mb-12">
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
                    <>
                      <button
                        onClick={() => handleMoveSection(section.id, 'up')}
                        className="text-portfolio-muted hover:text-portfolio-blue transition-colors"
                        aria-label="Move section up"
                        disabled={index === 0}
                      >
                        <ArrowUp size={18} className={index === 0 ? "opacity-30" : ""} />
                      </button>
                      <button
                        onClick={() => handleMoveSection(section.id, 'down')}
                        className="text-portfolio-muted hover:text-portfolio-blue transition-colors"
                        aria-label="Move section down"
                        disabled={index === safeSections.length - 1}
                      >
                        <ArrowDown size={18} className={index === safeSections.length - 1 ? "opacity-30" : ""} />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
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
        ))
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No sections available</p>
        </div>
      )}
      
      {isEditingMode && (
        <div className="max-w-xl mx-auto px-6 mt-8">
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
