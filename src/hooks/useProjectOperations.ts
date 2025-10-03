import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ProjectData } from "@/types/portfolio";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { executeUpdateOperation, executeOperation } from "@/utils/operationHandlers";
import { updateProjectRelations } from "@/utils/projectHelpers";
import { withTimestamp } from "@/utils/supabaseHelpers";

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
        if (!user?.id) throw new Error("User not authenticated");
        
        // Update project in Supabase
        const { error: projectError } = await supabase
          .from('projects')
          .update(withTimestamp({ 
            title: updatedProject.title, 
            description: updatedProject.description,
            project_role: updatedProject.project_role || null,
          }))
          .eq('id', updatedProject.id)
          .eq('section_id', sectionId);
          
        if (projectError) throw projectError;
        
        // Update links and features using helper
        await updateProjectRelations(
          updatedProject.id,
          updatedProject.links,
          updatedProject.features,
          user.id
        );
        
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
        if (!user?.id) throw new Error("User not authenticated");
        
        // Insert new project in Supabase
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .insert({
            section_id: sectionId,
            title: newProject.title,
            description: newProject.description,
            project_role: newProject.project_role || null,
            user_id: user.id
          })
          .select()
          .single();
          
        if (projectError) throw projectError;
        
        // Insert links and features using helper
        await updateProjectRelations(
          projectData.id,
          newProject.links,
          newProject.features,
          user.id
        );
        
        // Create new project with proper ID from Supabase
        const insertedProject: ProjectData = {
          id: projectData.id,
          title: projectData.title,
          description: projectData.description || "",
          project_role: projectData.project_role || "",
          links: newProject.links.map((link, idx) => ({
            ...link,
            id: `${projectData.id}-link-${idx}`
          })),
          features: newProject.features.map((feature, idx) => ({
            ...feature,
            id: `${projectData.id}-feature-${idx}`
          }))
        };
        
        // Update local state immediately
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
