
import { useState, useEffect } from "react";
import { ProjectData } from "@/types/portfolio";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeText, validateAndFormatUrl } from "@/utils/securityUtils";
import { useAuth } from "@/contexts/AuthContext";
import { executeUpdateOperation, executeOperation } from "@/utils/operationHandlers";

export const useProjectOperations = (
  sectionId: string,
  initialProjects: ProjectData[]
) => {
  const { user } = useAuth();
  const [localProjects, setLocalProjects] = useState<ProjectData[]>([]);
  
  // Update local state when props change
  useEffect(() => {
    if (Array.isArray(initialProjects)) {
      // Ensure features array exists on all projects
      const projectsWithFeatures = initialProjects.map(project => ({
        ...project,
        features: project.features || [],
        project_role: project.project_role || ""
      }));
      setLocalProjects(projectsWithFeatures);
    } else {
      setLocalProjects([]);
    }
  }, [initialProjects, sectionId]);
  
  const handleUpdateProject = async (updatedProject: ProjectData) => {
    await executeOperation(
      async () => {
        // Update project in Supabase
        const { error: projectError } = await supabase
          .from('projects')
          .update({ 
            title: updatedProject.title, 
            description: updatedProject.description,
            role: updatedProject.project_role || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', updatedProject.id)
          .eq('section_id', sectionId);
          
        if (projectError) {
          throw projectError;
        }
        
        // Delete existing links for this project
        const { error: deleteLinksError } = await supabase
          .from('project_links')
          .delete()
          .eq('project_id', updatedProject.id);
          
        if (deleteLinksError) {
          throw deleteLinksError;
        }
        
        // Add updated links
        if (updatedProject.links.length > 0) {
          const linksToInsert = updatedProject.links
            .map(link => ({
              project_id: updatedProject.id,
              title: sanitizeText(link.title),
              url: validateAndFormatUrl(link.url),
              user_id: user?.id || ''
            }))
            .filter(l => l.url !== "");
          
          const { error: insertLinksError } = await supabase
            .from('project_links')
            .insert(linksToInsert);
          
          if (insertLinksError) {
            throw insertLinksError;
          }
        }
        
        // Delete existing features for this project
        const { error: deleteFeaturesError } = await supabase
          .from('project_features')
          .delete()
          .eq('project_id', updatedProject.id);
          
        if (deleteFeaturesError) {
          throw deleteFeaturesError;
        }
        
        // Add updated features
        if (updatedProject.features.length > 0) {
          const featuresToInsert = updatedProject.features.map(feature => ({
            project_id: updatedProject.id,
            title: feature.title,
            user_id: user?.id || ''
          }));
          
          const { error: insertFeaturesError } = await supabase
            .from('project_features')
            .insert(featuresToInsert);
            
          if (insertFeaturesError) {
            throw insertFeaturesError;
          }
        }
        
        // Update local state immediately for responsive UI
        const updatedProjects = localProjects.map(project => 
          project.id === updatedProject.id ? updatedProject : project
        );
        setLocalProjects(updatedProjects);
        
        return updatedProject;
      },
      {
        successMessage: "Project updated",
        errorMessage: "Failed to update project"
      }
    );
  };

  const handleDeleteProject = async (id: string) => {
    await executeUpdateOperation(
      async () => {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id)
          .eq('section_id', sectionId);
          
        if (error) {
          throw error;
        }
      },
      () => {
        const updatedProjects = localProjects.filter(project => project.id !== id);
        setLocalProjects(updatedProjects);
      },
      {
        successMessage: "Project deleted",
        errorMessage: "Failed to delete project"
      }
    );
  };

  const handleAddProject = async (newProject: ProjectData) => {
    await executeOperation(
      async () => {
        // Insert new project in Supabase
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .insert({
            section_id: sectionId,
            title: newProject.title,
            description: newProject.description,
            role: newProject.project_role || null,
            user_id: user?.id || ''
          })
          .select()
          .single();
          
        if (projectError) {
          throw projectError;
        }
        
        // Insert links for the new project
        if (newProject.links.length > 0) {
          const linksToInsert = newProject.links
            .map(link => ({
              project_id: projectData.id,
              title: sanitizeText(link.title),
              url: validateAndFormatUrl(link.url),
              user_id: user?.id || ''
            }))
            .filter(l => l.url !== "");
          
          const { error: linksError } = await supabase
            .from('project_links')
            .insert(linksToInsert);
          
          if (linksError) {
            throw linksError;
          }
        }
        
        // Insert features for the new project
        if (newProject.features.length > 0) {
          const featuresToInsert = newProject.features.map(feature => ({
            project_id: projectData.id,
            title: feature.title,
            user_id: user?.id || ''
          }));
          
          const { error: featuresError } = await supabase
            .from('project_features')
            .insert(featuresToInsert);
            
          if (featuresError) {
            throw featuresError;
          }
        }
        
        // Create new project with proper ID from Supabase
        const insertedProject: ProjectData = {
          id: projectData.id,
          title: projectData.title,
          description: projectData.description || "",
          project_role: projectData.role || "",
          links: newProject.links.map((link, idx) => ({
            ...link,
            id: `${projectData.id}-link-${idx}`  // Temporary ID until we fetch from Supabase
          })),
          features: newProject.features.map((feature, idx) => ({
            ...feature,
            id: `${projectData.id}-feature-${idx}`  // Temporary ID until we fetch from Supabase
          }))
        };
        
        // Update local state immediately without calling onUpdate
        setLocalProjects(prevProjects => [...prevProjects, insertedProject]);
        
        return projectData;
      },
      {
        successMessage: "Project added",
        errorMessage: "Failed to add project"
      }
    );
  };

  const safeProjects = Array.isArray(localProjects) ? localProjects : [];
  
  return {
    projects: safeProjects,
    handleUpdateProject,
    handleDeleteProject,
    handleAddProject
  };
};
