
import React from "react";
import ProjectListView from "./ProjectListView";
import AddProjectButton from "./AddProjectButton";
import { ProjectData } from "../utils/localStorage";
import { useProjectOperations } from "@/hooks/useProjectOperations";

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
  const {
    projects: safeProjects,
    handleUpdateProject,
    handleDeleteProject,
    handleAddProject
  } = useProjectOperations(sectionId, projects);

  return (
    <section className="max-w-xl mx-auto px-6">
      <ProjectListView
        sectionId={sectionId}
        projects={safeProjects}
        onUpdate={handleUpdateProject}
        onDelete={handleDeleteProject}
        isEditingMode={isEditingMode}
      />
      
      {isEditingMode && (
        <div className="mt-6">
          <AddProjectButton onAdd={handleAddProject} />
        </div>
      )}
    </section>
  );
};

export default ProjectList;
