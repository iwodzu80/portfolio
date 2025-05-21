
import { supabase } from "@/integrations/supabase/client";

export const useDefaultSectionCreator = () => {
  const createDefaultSection = async (userId: string) => {
    try {
      // Insert default section
      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .insert({
          user_id: userId,
          title: "My Projects"
        })
        .select('id')
        .single();
        
      if (sectionError) {
        console.error("Error creating default section:", sectionError);
        return false;
      }
      
      // Insert default project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          section_id: sectionData.id,
          title: "Personal Portfolio",
          description: "A responsive portfolio website built with React and TailwindCSS."
        })
        .select('id')
        .single();
        
      if (projectError) {
        console.error("Error creating default project:", projectError);
        return false;
      }
      
      // Insert default links
      const links = [
        { project_id: projectData.id, title: "GitHub", url: "https://github.com" },
        { project_id: projectData.id, title: "Live Site", url: "https://example.com" }
      ];
      
      const { error: linksError } = await supabase
        .from('links')
        .insert(links);
        
      if (linksError) {
        console.error("Error creating default links:", linksError);
        return false;
      }
      
      console.log("Default section created successfully");
      return true;
    } catch (error: any) {
      console.error("Error in createDefaultSection:", error);
      return false;
    }
  };

  return { createDefaultSection };
};
