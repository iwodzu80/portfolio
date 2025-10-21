
import React, { useMemo } from "react";
import ProjectListView from "./ProjectListView";
import AddProjectButton from "./AddProjectButton";
import { ProjectData } from "@/types/portfolio";
import { useProjectOperations } from "@/hooks/useProjectOperations";

interface ProjectListProps {
  sectionId: string;
  projects: ProjectData[];
  onUpdate: () => void;
  isEditingMode?: boolean;
}

const ProjectList: React.FC<ProjectListProps> = React.memo(({ 
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

  const memoizedProjects = useMemo(() => safeProjects, [safeProjects]);

  return (
    <section className="max-w-2xl mx-auto px-6">
      <ProjectListView
        sectionId={sectionId}
        projects={memoizedProjects}
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
});

ProjectList.displayName = "ProjectList";

export default ProjectList;
