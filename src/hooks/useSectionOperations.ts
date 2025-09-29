import { supabase } from "@/integrations/supabase/client";
import { SectionData } from "@/types/portfolio";
import { useAuth } from "@/contexts/AuthContext";
import { executeUpdateOperation, executeOperation } from "@/utils/operationHandlers";

export const useSectionOperations = (
  sections: SectionData[],
  setSections: (sections: SectionData[]) => void,
  onUpdate: () => void
) => {
  const { user } = useAuth();

  const handleUpdateSection = async (sectionId: string, title: string) => {
    await executeUpdateOperation(
      async () => {
        const { error } = await supabase
          .from('sections')
          .update({ title, updated_at: new Date().toISOString() })
          .eq('id', sectionId)
          .eq('user_id', user?.id);
        if (error) throw error;
      },
      () => {
        const updatedSections = sections.map(section => 
          section.id === sectionId ? { ...section, title } : section
        );
        setSections(updatedSections);
      },
      {
        successMessage: "Section updated",
        errorMessage: "Failed to update section"
      }
    );
  };
  
  const handleUpdateSectionDescription = async (sectionId: string, description: string) => {
    await executeUpdateOperation(
      async () => {
        const { error } = await supabase
          .from('sections')
          .update({ description, updated_at: new Date().toISOString() })
          .eq('id', sectionId)
          .eq('user_id', user?.id);
        if (error) throw error;
      },
      () => {
        const updatedSections = sections.map(section => 
          section.id === sectionId ? { ...section, description } : section
        );
        setSections(updatedSections);
      },
      {
        successMessage: "Section description updated",
        errorMessage: "Failed to update section description"
      }
    );
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (sections.length <= 1) {
      const { toast } = await import("sonner");
      toast.error("You must have at least one section");
      return;
    }
    
    await executeUpdateOperation(
      async () => {
        const { error } = await supabase
          .from('sections')
          .delete()
          .eq('id', sectionId)
          .eq('user_id', user?.id);
        if (error) throw error;
      },
      () => {
        const updatedSections = sections.filter(section => section.id !== sectionId);
        setSections(updatedSections);
      },
      {
        successMessage: "Section deleted",
        errorMessage: "Failed to delete section"
      }
    );
  };
  
  const handleAddSection = async () => {
    await executeOperation(
      async () => {
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
        
        const newSection: SectionData = {
          id: data.id,
          title: data.title,
          description: "",
          projects: []
        };
        
        const updatedSections = [...sections, newSection];
        setSections(updatedSections);
        
        return data;
      },
      {
        successMessage: "New section added",
        errorMessage: "Failed to add section"
      }
    );
  };

  const handleMoveSection = async (sectionId: string, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(section => section.id === sectionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' 
      ? Math.max(0, currentIndex - 1) 
      : Math.min(sections.length - 1, currentIndex + 1);

    if (newIndex === currentIndex) {
      return;
    }

    const newSections = [...sections];
    const [movedSection] = newSections.splice(currentIndex, 1);
    newSections.splice(newIndex, 0, movedSection);

    setSections(newSections);
    
    await executeOperation(
      async () => {
        const baseTime = new Date();
        
        const updatePromises = newSections.map((section, index) => {
          const newTimestamp = new Date(baseTime.getTime() + (index * 1000)).toISOString();
          
          return supabase
            .from('sections')
            .update({ 
              updated_at: newTimestamp,
              created_at: newTimestamp
            })
            .eq('id', section.id)
            .eq('user_id', user?.id);
        });
        
        const results = await Promise.all(updatePromises);
        
        const errors = results.filter(result => result.error);
        if (errors.length > 0) {
          throw new Error("Failed to update section order");
        }
        
        onUpdate();
        return results;
      },
      {
        successMessage: `Section moved ${direction}`,
        errorMessage: "Failed to save section order",
        onError: () => {
          setSections(sections);
        }
      }
    );
  };

  return {
    handleUpdateSection,
    handleUpdateSectionDescription,
    handleDeleteSection,
    handleAddSection,
    handleMoveSection
  };
};