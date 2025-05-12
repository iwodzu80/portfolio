
import React, { useState } from "react";
import { X, Plus, Pencil } from "lucide-react";
import EditableField from "./EditableField";
import { LinkData, ProjectData } from "../utils/localStorage";
import { toast } from "sonner";

interface ProjectCardProps {
  project: ProjectData;
  onUpdate: (updatedProject: ProjectData) => void;
  onDelete: (id: string) => void;
  isEditingMode?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onUpdate, onDelete, isEditingMode = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLastLinkDelete, setConfirmLastLinkDelete] = useState(false);
  
  const updateField = (field: keyof ProjectData, value: string | LinkData[]) => {
    onUpdate({ ...project, [field]: value });
  };
  
  const addLink = () => {
    const newLink: LinkData = {
      id: `${project.id}-${Date.now()}`,
      title: "New Link",
      url: "https://"
    };
    updateField("links", [...project.links, newLink]);
    toast.success("Link added");
  };
  
  const updateLink = (linkId: string, field: keyof LinkData, value: string) => {
    const updatedLinks = project.links.map(link => 
      link.id === linkId ? { ...link, [field]: value } : link
    );
    updateField("links", updatedLinks);
  };
  
  const deleteLink = (linkId: string) => {
    if (project.links.length <= 1) {
      // Instead of preventing deletion, ask for confirmation
      if (confirmLastLinkDelete) {
        const updatedLinks = project.links.filter(link => link.id !== linkId);
        updateField("links", updatedLinks);
        toast.success("Link removed");
        setConfirmLastLinkDelete(false);
      } else {
        setConfirmLastLinkDelete(true);
        // Reset confirmation after 3 seconds
        setTimeout(() => setConfirmLastLinkDelete(false), 3000);
        toast.warning("Click again to remove last link");
      }
      return;
    }
    
    const updatedLinks = project.links.filter(link => link.id !== linkId);
    updateField("links", updatedLinks);
    toast.success("Link removed");
  };

  const handleDeleteProject = () => {
    if (confirmDelete) {
      onDelete(project.id);
      toast.success("Project deleted");
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };
  
  // Read-only mode (view mode)
  if (!isEditingMode) {
    return (
      <div className="bg-portfolio-card rounded-lg shadow-md p-6 my-4 animate-fade-in card-transition">
        <h2 className="font-bold text-xl mb-3">{project.title}</h2>
        <p className="text-portfolio-muted mb-4 text-sm">{project.description}</p>
        
        <div className="links flex flex-wrap gap-2">
          {project.links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-portfolio-blue text-white py-1 px-4 rounded-full text-sm hover:bg-portfolio-light-blue transition-colors"
            >
              {link.title}
            </a>
          ))}
        </div>
      </div>
    );
  }
  
  // Edit mode
  return (
    <div className="bg-portfolio-card rounded-lg shadow-md p-6 my-4 animate-fade-in card-transition">
      <div className="flex justify-between items-start mb-3">
        <EditableField
          value={project.title}
          onChange={(value) => updateField("title", value)}
          tag="h2"
          className="font-bold text-xl"
          placeholder="Project Title"
        />
        
        <div className="flex gap-2">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="text-portfolio-muted hover:text-portfolio-blue transition-colors"
          >
            <Pencil size={18} />
          </button>
          <button 
            onClick={handleDeleteProject}
            className={`transition-colors ${confirmDelete ? 'text-red-500' : 'text-portfolio-muted hover:text-red-500'}`}
          >
            <X size={18} />
          </button>
        </div>
      </div>
      
      <EditableField
        value={project.description}
        onChange={(value) => updateField("description", value)}
        tag="p"
        className="text-portfolio-muted mb-4 text-sm"
        placeholder="Project Description"
        multiline
      />
      
      <div className="links">
        {project.links.map((link) => (
          <div 
            key={link.id} 
            className="flex items-center gap-2 mb-2"
          >
            <EditableField
              value={link.title}
              onChange={(value) => updateLink(link.id, "title", value)}
              tag="span"
              className={`text-sm ${isEditing ? "w-1/3" : "w-auto"}`}
              placeholder="Link Title"
            />
            
            {isEditing && (
              <>
                <EditableField
                  value={link.url}
                  onChange={(value) => updateLink(link.id, "url", value)}
                  tag="span"
                  className="text-sm text-portfolio-muted flex-1"
                  placeholder="https://"
                />
                <button
                  onClick={() => deleteLink(link.id)}
                  className={`transition-colors ${
                    confirmLastLinkDelete && project.links.length <= 1 ? 'text-red-500' : 'text-portfolio-muted hover:text-red-500'
                  }`}
                >
                  <X size={14} />
                </button>
              </>
            )}
            
            {!isEditing && (
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-portfolio-blue text-white py-1 px-4 rounded-full text-sm hover:bg-portfolio-light-blue transition-colors"
              >
                {link.title}
              </a>
            )}
          </div>
        ))}
        
        {isEditing && (
          <button
            onClick={addLink}
            className="flex items-center text-portfolio-blue text-sm mt-2 hover:text-portfolio-light-blue transition-colors"
          >
            <Plus size={14} className="mr-1" /> Add Link
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
