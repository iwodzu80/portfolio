import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useDefaultSectionCreator = () => {
  const createDefaultSection = async (userId: string) => {
    try {
      // Insert default section
      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .insert({
          user_id: userId,
          title: "My Projects (Example)",
          description: "This is an example section - feel free to edit or delete it"
        })
        .select('id')
        .single();
        
      if (sectionError) {
        console.error("Error creating default section:", sectionError);
        toast.error("Failed to create default section");
        return false;
      }
      
      // Insert default project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          section_id: sectionData.id,
          title: "Example Project - Portfolio Website",
          description: "This is an example project. Replace it with your own work! A responsive portfolio website built with React and TailwindCSS.",
          project_role: "Full Stack Developer",
          user_id: userId
        })
        .select('id')
        .single();
        
      if (projectError) {
        console.error("Error creating default project:", projectError);
        toast.error("Failed to create default project");
        return false;
      }
      
      // Insert default links
      const links = [
        { project_id: projectData.id, title: "GitHub (example)", url: "https://github.com/yourusername/project", user_id: userId },
        { project_id: projectData.id, title: "Live Demo (example)", url: "https://yourproject.com", user_id: userId }
      ];
      
      const { error: linksError } = await supabase
        .from('project_links')
        .insert(links);
        
      if (linksError) {
        console.error("Error creating default links:", linksError);
        toast.error("Failed to create default links");
        return false;
      }
      
      console.log("Default section created successfully");
      return true;
    } catch (error: any) {
      console.error("Error in createDefaultSection:", error);
      toast.error("Failed to initialize portfolio");
      return false;
    }
  };

  return { createDefaultSection };
};
