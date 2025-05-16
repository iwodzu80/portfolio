
import React, { useState, useEffect } from "react";
import ProjectCard from "./ProjectCard";
import AddProjectButton from "./AddProjectButton";
import { ProjectData } from "../utils/localStorage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectListProps {
  sectionId: string;
  projects: ProjectData[];
  onUpdate: () => void;
  isEditingMode?: boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  sectionId, 
  projects, 
  onUpdate,
  isEditingMode = true
}) => {
  const [localProjects, setLocalProjects] = useState<ProjectData[]>(projects);
  
  // Update local state when props change
  useEffect(() => {
    setLocalProjects(projects);
  }, [projects]);

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
        }))
      };
      
      // Update local state immediately without calling onUpdate
      setLocalProjects(prevProjects => [...prevProjects, insertedProject]);
      toast.success("Project added");
    } catch (error: any) {
      console.error("Error adding project:", error.message);
      toast.error("Failed to add project");
    }
  };

  return (
    <section className="max-w-md mx-auto px-6">
      {localProjects.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          onUpdate={handleUpdateProject}
          onDelete={handleDeleteProject}
          isEditingMode={isEditingMode}
        />
      ))}
      
      {isEditingMode && (
        <div className="mt-6">
          <AddProjectButton onAdd={handleAddProject} />
        </div>
      )}
    </section>
  );
};

export default ProjectList;
