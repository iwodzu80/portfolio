

import { supabase } from "@/integrations/supabase/client";
import { SectionData } from "@/types/portfolio";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const useSectionOperations = (
  sections: SectionData[],
  setSections: (sections: SectionData[]) => void,
  onUpdate: () => void
) => {
  const { user } = useAuth();

  const handleUpdateSection = async (sectionId: string, title: string) => {
    try {
      const { error } = await supabase
        .from('sections')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', sectionId)
        .eq('user_id', user?.id);
        
      if (error) {
        throw error;
      }
      
      const updatedSections = sections.map(section => 
        section.id === sectionId ? { ...section, title } : section
      );
      
      setSections(updatedSections);
      toast.success("Section updated");
    } catch (error: any) {
      console.error("Error updating section:", error.message);
      toast.error("Failed to update section");
    }
  };
  
  const handleUpdateSectionDescription = async (sectionId: string, description: string) => {
    try {
      const { error } = await supabase
        .from('sections')
        .update({ description, updated_at: new Date().toISOString() })
        .eq('id', sectionId)
        .eq('user_id', user?.id);
        
      if (error) {
        throw error;
      }
      
      const updatedSections = sections.map(section => 
        section.id === sectionId ? { ...section, description } : section
      );
      
      setSections(updatedSections);
      toast.success("Section description updated");
    } catch (error: any) {
      console.error("Error updating section description:", error.message);
      toast.error("Failed to update section description");
    }
  };
  const handleDeleteSection = async (sectionId: string) => {
    if (sections.length <= 1) {
      toast.error("You must have at least one section");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', sectionId)
        .eq('user_id', user?.id);
        
      if (error) {
        throw error;
      }
      
      const updatedSections = sections.filter(section => section.id !== sectionId);
      setSections(updatedSections);
      toast.success("Section deleted");
    } catch (error: any) {
      console.error("Error deleting section:", error.message);
      toast.error("Failed to delete section");
    }
  };
  
  const handleAddSection = async () => {
    try {
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
      toast.success("New section added");
    } catch (error: any) {
      console.error("Error adding section:", error.message);
      toast.error("Failed to add section");
    }
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
    
    try {
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
        console.error("Errors updating section order:", errors);
        throw new Error("Failed to update section order");
      }
      
      toast.success(`Section moved ${direction}`);
      onUpdate();
    } catch (error: any) {
      console.error("Error saving section order:", error);
      toast.error("Failed to save section order");
      setSections(sections);
    }
  };

  return {
    handleUpdateSection,
    handleUpdateSectionDescription,
    handleDeleteSection,
    handleAddSection,
    handleMoveSection
  };
};
