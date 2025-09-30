
import React, { useMemo } from "react";
import ProjectCard from "./ProjectCard";
import { ProjectData } from "@/types/portfolio";

interface ProjectListViewProps {
  sectionId: string;
  projects: ProjectData[];
  onUpdate: (updatedProject: ProjectData) => void;
  onDelete: (id: string) => void;
  isEditingMode: boolean;
}

const ProjectListView: React.FC<ProjectListViewProps> = React.memo(({ 
  sectionId, 
  projects, 
  onUpdate,
  onDelete,
  isEditingMode
}) => {
  
  const memoizedProjects = useMemo(() => projects, [projects]);

  if (memoizedProjects.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">No projects in this section</p>
      </div>
    );
  }

  return (
    <>
      {memoizedProjects.map((project, index) => (
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
});

ProjectListView.displayName = "ProjectListView";

export default ProjectListView;
