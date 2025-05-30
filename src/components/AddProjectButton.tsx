
import React from "react";
import { Plus } from "lucide-react";
import { ProjectData } from "@/types/portfolio";

interface AddProjectButtonProps {
  onAdd: (project: ProjectData) => void;
}

const AddProjectButton: React.FC<AddProjectButtonProps> = ({ onAdd }) => {
  const handleAddProject = () => {
    const newProject: ProjectData = {
      id: `project-${Date.now()}`,
      title: "New Project",
      description: "A brief description of your project",
      links: [
        { id: `link-${Date.now()}`, title: "GitHub", url: "https://github.com" }
      ],
      features: []
    };
    
    onAdd(newProject);
  };

  return (
    <button
      onClick={handleAddProject}
      className="w-full py-3 px-4 border-2 border-dashed border-portfolio-light-blue rounded-lg 
        text-portfolio-blue hover:bg-portfolio-light-blue/10 transition-colors flex items-center justify-center"
    >
      <Plus size={18} className="mr-2" />
      Add Project
    </button>
  );
};

export default AddProjectButton;
