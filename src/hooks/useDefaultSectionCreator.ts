import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useDefaultSectionCreator = () => {
  const createDefaultSection = async (userId: string) => {
    try {
      // Check if default content has already been created
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('default_content_created')
        .eq('user_id', userId)
        .single();
        
      if (profileError) {
        console.error("Error checking profile:", profileError);
        return false;
      }
      
      // Skip if default content already created
      if (profile?.default_content_created) {
        console.log("Default content already created for this user");
        return true;
      }
      
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
        toast.error("Failed to create default section");
        return false;
      }
      
      // Insert default project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          section_id: sectionData.id,
          title: "Personal Portfolio",
          description: "A responsive portfolio website built with React and TailwindCSS.",
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
        { project_id: projectData.id, title: "GitHub", url: "https://github.com", user_id: userId },
        { project_id: projectData.id, title: "Live Site", url: "https://example.com", user_id: userId }
      ];
      
      const { error: linksError } = await supabase
        .from('project_links')
        .insert(links);
        
      if (linksError) {
        console.error("Error creating default links:", linksError);
        toast.error("Failed to create default links");
        return false;
      }
      
      // Mark default content as created
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ default_content_created: true })
        .eq('user_id', userId);
        
      if (updateError) {
        console.error("Error updating profile flag:", updateError);
        // Don't return false here - the content was created successfully
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
