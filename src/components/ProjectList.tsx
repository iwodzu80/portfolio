
import React, { useState, useEffect } from "react";
import ProjectCard from "./ProjectCard";
import AddProjectButton from "./AddProjectButton";
import { ProjectData, saveProjects } from "../utils/localStorage";

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

  const handleUpdateProject = (updatedProject: ProjectData) => {
    // Update local state immediately for responsive UI
    const updatedProjects = localProjects.map(project => 
      project.id === updatedProject.id ? updatedProject : project
    );
    setLocalProjects(updatedProjects);
    
    // Update localStorage in the background
    saveProjects(sectionId, updatedProjects);
    
    // Don't call onUpdate() to avoid page refreshes
  };

  const handleDeleteProject = (id: string) => {
    const updatedProjects = localProjects.filter(project => project.id !== id);
    setLocalProjects(updatedProjects);
    saveProjects(sectionId, updatedProjects);
    
    // Don't call onUpdate() to avoid page refreshes
  };

  const handleAddProject = (newProject: ProjectData) => {
    const updatedProjects = [...localProjects, newProject];
    setLocalProjects(updatedProjects);
    saveProjects(sectionId, updatedProjects);
    
    // Don't call onUpdate() to avoid page refreshes
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
