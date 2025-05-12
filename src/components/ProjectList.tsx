
import React from "react";
import ProjectCard from "./ProjectCard";
import AddProjectButton from "./AddProjectButton";
import { ProjectData, saveProjects } from "../utils/localStorage";

interface ProjectListProps {
  projects: ProjectData[];
  onUpdate: () => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onUpdate }) => {
  const handleUpdateProject = (updatedProject: ProjectData) => {
    const updatedProjects = projects.map(project => 
      project.id === updatedProject.id ? updatedProject : project
    );
    saveProjects(updatedProjects);
    onUpdate();
  };

  const handleDeleteProject = (id: string) => {
    const updatedProjects = projects.filter(project => project.id !== id);
    saveProjects(updatedProjects);
    onUpdate();
  };

  const handleAddProject = (newProject: ProjectData) => {
    const updatedProjects = [...projects, newProject];
    saveProjects(updatedProjects);
    onUpdate();
  };

  return (
    <section className="max-w-md mx-auto px-6 pb-20">
      <h2 className="text-xl font-semibold mb-4 text-center">My Projects</h2>
      
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          onUpdate={handleUpdateProject}
          onDelete={handleDeleteProject}
        />
      ))}
      
      <div className="mt-6">
        <AddProjectButton onAdd={handleAddProject} />
      </div>
    </section>
  );
};

export default ProjectList;
