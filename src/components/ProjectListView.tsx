
import React from "react";
import ProjectCard from "./ProjectCard";
import { ProjectData } from "../utils/localStorage";

interface ProjectListViewProps {
  sectionId: string;
  projects: ProjectData[];
  onUpdate: (updatedProject: ProjectData) => void;
  onDelete: (id: string) => void;
  isEditingMode: boolean;
}

const ProjectListView: React.FC<ProjectListViewProps> = ({ 
  sectionId, 
  projects, 
  onUpdate,
  onDelete,
  isEditingMode
}) => {
  console.log(`ProjectListView for section ${sectionId} rendering with projects:`, projects.length);
  
  if (projects.length > 0) {
    projects.forEach((project, index) => {
      console.log(`Project ${index + 1} in section ${sectionId}: ${project.title} with ${project.links?.length || 0} links`);
    });
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">No projects in this section</p>
      </div>
    );
  }

  return (
    <>
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id || `project-${sectionId}-${index}`}
          project={project}
          onUpdate={onUpdate}
          onDelete={onDelete}
          isEditingMode={isEditingMode}
        />
      ))}
    </>
  );
};

export default ProjectListView;
