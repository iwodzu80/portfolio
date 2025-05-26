
import { useState, useEffect } from "react";
import { ProjectData } from "../utils/localStorage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProjectOperations = (
  sectionId: string,
  initialProjects: ProjectData[]
) => {
  const [localProjects, setLocalProjects] = useState<ProjectData[]>([]);
  
  // Update local state when props change
  useEffect(() => {
    console.log(`ProjectList for section ${sectionId} received projects:`, initialProjects);
    console.log(`Number of projects in section ${sectionId}:`, initialProjects?.length || 0);
    
    if (Array.isArray(initialProjects)) {
      // Ensure features array exists on all projects
      const projectsWithFeatures = initialProjects.map(project => ({
        ...project,
        features: project.features || []
      }));
      setLocalProjects(projectsWithFeatures);
    } else {
      console.error(`Projects prop for section ${sectionId} is not an array:`, initialProjects);
      setLocalProjects([]);
    }
  }, [initialProjects, sectionId]);
  
  const handleUpdateProject = async (updatedProject: ProjectData) => {
    try {
      // Update project in Supabase
      const { error: projectError } = await supabase
        .from('projects')
        .update({ 
          title: updatedProject.title, 
          description: updatedProject.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedProject.id)
        .eq('section_id', sectionId);
        
      if (projectError) {
        throw projectError;
      }
      
      // Delete existing links for this project
      const { error: deleteLinksError } = await supabase
        .from('links')
        .delete()
        .eq('project_id', updatedProject.id);
        
      if (deleteLinksError) {
        throw deleteLinksError;
      }
      
      // Add updated links
      if (updatedProject.links.length > 0) {
        const linksToInsert = updatedProject.links.map(link => ({
          project_id: updatedProject.id,
          title: link.title,
          url: link.url
        }));
        
        const { error: insertLinksError } = await supabase
          .from('links')
          .insert(linksToInsert);
          
        if (insertLinksError) {
          throw insertLinksError;
        }
      }
      
      // Update local state immediately for responsive UI
      const updatedProjects = localProjects.map(project => 
        project.id === updatedProject.id ? updatedProject : project
      );
      setLocalProjects(updatedProjects);
      
      toast.success("Project updated");
    } catch (error: any) {
      console.error("Error updating project:", error.message);
      toast.error("Failed to update project");
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      // Delete project from Supabase (cascade will handle links)
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('section_id', sectionId);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedProjects = localProjects.filter(project => project.id !== id);
      setLocalProjects(updatedProjects);
      toast.success("Project deleted");
    } catch (error: any) {
      console.error("Error deleting project:", error.message);
      toast.error("Failed to delete project");
    }
  };

  const handleAddProject = async (newProject: ProjectData) => {
    try {
      // Insert new project in Supabase
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          section_id: sectionId,
          title: newProject.title,
          description: newProject.description
        })
        .select()
        .single();
        
      if (projectError) {
        throw projectError;
      }
      
      // Insert links for the new project
      if (newProject.links.length > 0) {
        const linksToInsert = newProject.links.map(link => ({
          project_id: projectData.id,
          title: link.title,
          url: link.url
        }));
        
        const { error: linksError } = await supabase
          .from('links')
          .insert(linksToInsert);
          
        if (linksError) {
          throw linksError;
        }
      }
      
      // Create new project with proper ID from Supabase
      const insertedProject: ProjectData = {
        id: projectData.id,
        title: projectData.title,
        description: projectData.description || "",
        links: newProject.links.map((link, idx) => ({
          ...link,
          id: `${projectData.id}-link-${idx}`  // Temporary ID until we fetch from Supabase
        })),
        features: newProject.features || []
      };
      
      // Update local state immediately without calling onUpdate
      setLocalProjects(prevProjects => [...prevProjects, insertedProject]);
      toast.success("Project added");
    } catch (error: any) {
      console.error("Error adding project:", error.message);
      toast.error("Failed to add project");
    }
  };

  const safeProjects = Array.isArray(localProjects) ? localProjects : [];
  
  return {
    projects: safeProjects,
    handleUpdateProject,
    handleDeleteProject,
    handleAddProject
  };
};
