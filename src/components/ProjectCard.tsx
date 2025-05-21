
import React, { useState, useEffect } from "react";
import { X, Plus, Pencil, ExternalLink } from "lucide-react";
import EditableField from "./EditableField";
import { LinkData, ProjectData } from "../utils/localStorage";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { validateAndFormatUrl } from "@/utils/securityUtils";

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
  const [localProject, setLocalProject] = useState<ProjectData>(project);
  
  // Update local state when props change
  useEffect(() => {
    setLocalProject(project);
  }, [project]);
  
  const updateField = (field: keyof ProjectData, value: string | LinkData[]) => {
    const updatedProject = { ...localProject, [field]: value };
    setLocalProject(updatedProject);
    onUpdate(updatedProject);
  };
  
  const addLink = () => {
    const newLink: LinkData = {
      id: `${localProject.id}-${Date.now()}`,
      title: "New Link",
      url: "https://"
    };
    
    const updatedLinks = [...localProject.links, newLink];
    setLocalProject(prev => ({ ...prev, links: updatedLinks }));
    updateField("links", updatedLinks);
    toast.success("Link added");
  };
  
  const updateLink = (linkId: string, field: keyof LinkData, value: string) => {
    // If updating URL field, ensure it has a protocol and is validated
    if (field === "url") {
      value = validateAndFormatUrl(value);
    }
    
    const updatedLinks = localProject.links.map(link => 
      link.id === linkId ? { ...link, [field]: value } : link
    );
    setLocalProject(prev => ({ ...prev, links: updatedLinks }));
    updateField("links", updatedLinks);
  };
  
  const deleteLink = (linkId: string) => {
    if (localProject.links.length <= 1) {
      // Instead of preventing deletion, ask for confirmation
      if (confirmLastLinkDelete) {
        const updatedLinks = localProject.links.filter(link => link.id !== linkId);
        setLocalProject(prev => ({ ...prev, links: updatedLinks }));
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
    
    const updatedLinks = localProject.links.filter(link => link.id !== linkId);
    setLocalProject(prev => ({ ...prev, links: updatedLinks }));
    updateField("links", updatedLinks);
    toast.success("Link removed");
  };

  const handleDeleteProject = () => {
    if (confirmDelete) {
      onDelete(localProject.id);
      toast.success("Project deleted");
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };
  
  // Process description to render bullet points
  const renderDescription = (text: string) => {
    // Split the text by newlines
    const lines = text.split('\n');
    
    return (
      <>
        {lines.map((line, index) => {
          // Check if line starts with "- " or "* " for bullet points
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return (
              <div key={index} className="flex items-start mb-1">
                <div className="text-portfolio-blue mr-2">•</div>
                <div>{line.trim().substring(2)}</div>
              </div>
            );
          }
          // Return regular paragraph for non-bullet lines
          return line.trim() ? <p key={index} className="mb-1">{line}</p> : <br key={index} />;
        })}
      </>
    );
  };
  
  // Read-only mode (view mode)
  if (!isEditingMode) {
    return (
      <div className="bg-portfolio-card rounded-lg shadow-md p-6 my-4 animate-fade-in card-transition">
        <h2 className="font-bold text-xl mb-3">{localProject.title}</h2>
        <div className="text-portfolio-muted mb-4 text-sm">
          {renderDescription(localProject.description)}
        </div>
        
        <div className="links flex flex-wrap gap-2">
          {localProject.links.map((link) => (
            <a
              key={link.id}
              href={validateAndFormatUrl(link.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-portfolio-blue text-white py-1 px-4 rounded-full text-sm hover:bg-portfolio-light-blue transition-colors inline-flex items-center gap-1"
            >
              {link.title}
              <ExternalLink size={14} />
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
          value={localProject.title}
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
        value={localProject.description}
        onChange={(value) => updateField("description", value)}
        tag="p"
        className="text-portfolio-muted mb-4 text-sm"
        placeholder="Project Description (Use '- ' or '* ' at the start of a line for bullet points)"
        multiline
      />
      
      {isEditing && (
        <div className="text-xs text-gray-500 mb-3 italic">
          Tip: Use "- " or "* " at the start of a line to create bullet points
        </div>
      )}
      
      <div className="links">
        {localProject.links.map((link) => (
          <div 
            key={link.id} 
            className="flex items-center gap-2 mb-2"
          >
            {isEditing ? (
              <>
                <EditableField
                  value={link.title}
                  onChange={(value) => updateLink(link.id, "title", value)}
                  tag="span"
                  className="text-sm w-1/3"
                  placeholder="Link Title"
                />
                
                <EditableField
                  value={link.url}
                  onChange={(value) => updateLink(link.id, "url", value)}
                  tag="span"
                  className="text-sm text-portfolio-muted flex-1"
                  placeholder="website.com"
                />
                <button
                  onClick={() => deleteLink(link.id)}
                  className={`transition-colors ${
                    confirmLastLinkDelete && localProject.links.length <= 1 ? 'text-red-500' : 'text-portfolio-muted hover:text-red-500'
                  }`}
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                className="bg-portfolio-blue hover:bg-portfolio-light-blue text-white rounded-full px-4 py-1 h-auto text-sm inline-flex items-center gap-1 w-auto"
                asChild
              >
                <a
                  href={validateAndFormatUrl(link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.title}
                  <ExternalLink size={14} />
                </a>
              </Button>
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
