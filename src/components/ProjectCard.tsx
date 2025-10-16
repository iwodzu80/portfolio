
import React, { useState, useEffect } from "react";
import { X, Plus, Pencil, ExternalLink } from "lucide-react";
import EditableField from "./EditableField";
import EditableImage from "./EditableImage";
import { LinkData, ProjectData, FeatureData } from "@/types/portfolio";
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
const [localProject, setLocalProject] = useState<ProjectData>({
  ...project,
  features: project.features || [],
  project_role: project.project_role || "",
  key_learnings: project.key_learnings || []
});
const [lastAddedFeatureId, setLastAddedFeatureId] = useState<string | null>(null);
const [lastAddedLearningIndex, setLastAddedLearningIndex] = useState<number | null>(null);
  
  // Update local state when props change
  useEffect(() => {
    setLocalProject({
      ...project,
      features: project.features || [],
      project_role: project.project_role || "",
      key_learnings: project.key_learnings || []
    });
  }, [project]);
  
  const updateField = (field: keyof ProjectData, value: string | LinkData[] | FeatureData[] | string[]) => {
    const updatedProject = { ...localProject, [field]: value };
    setLocalProject(updatedProject);
    onUpdate(updatedProject);
  };
  
  const addLink = () => {
    const newLink: LinkData = {
      id: `${localProject.id}-link-${Date.now()}`,
      title: "New Link",
      url: "https://"
    };
    
    const updatedLinks = [...localProject.links, newLink];
    setLocalProject(prev => ({ ...prev, links: updatedLinks }));
    updateField("links", updatedLinks);
    toast.success("Link added");
  };

const addFeature = () => {
  const newFeature: FeatureData = {
    id: `${localProject.id}-feature-${Date.now()}`,
    title: "New Feature"
  };
  
  const updatedFeatures = [...localProject.features, newFeature];
  setLocalProject(prev => ({ ...prev, features: updatedFeatures }));
  updateField("features", updatedFeatures);
  setLastAddedFeatureId(newFeature.id);
  toast.success("Feature added");
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

  const updateFeature = (featureId: string, field: keyof FeatureData, value: string) => {
    const updatedFeatures = localProject.features.map(feature => 
      feature.id === featureId ? { ...feature, [field]: value } : feature
    );
    setLocalProject(prev => ({ ...prev, features: updatedFeatures }));
    updateField("features", updatedFeatures);
  };
  
  const deleteLink = (linkId: string) => {
    const updatedLinks = localProject.links.filter(link => link.id !== linkId);
    setLocalProject(prev => ({ ...prev, links: updatedLinks }));
    updateField("links", updatedLinks);
    toast.success("Link removed");
  };

  const deleteFeature = (featureId: string) => {
    const updatedFeatures = localProject.features.filter(feature => feature.id !== featureId);
    setLocalProject(prev => ({ ...prev, features: updatedFeatures }));
    updateField("features", updatedFeatures);
    toast.success("Feature removed");
  };

  const addKeyLearning = () => {
    const newLearning = "New tech";
    const updatedLearnings = [...(localProject.key_learnings || []), newLearning];
    setLocalProject(prev => ({ ...prev, key_learnings: updatedLearnings }));
    updateField("key_learnings", updatedLearnings);
    setLastAddedLearningIndex(updatedLearnings.length - 1);
    toast.success("Tech added");
  };

  const updateKeyLearning = (index: number, value: string) => {
    const updatedLearnings = [...(localProject.key_learnings || [])];
    updatedLearnings[index] = value;
    setLocalProject(prev => ({ ...prev, key_learnings: updatedLearnings }));
    updateField("key_learnings", updatedLearnings);
  };

  const deleteKeyLearning = (index: number) => {
    const updatedLearnings = (localProject.key_learnings || []).filter((_, i) => i !== index);
    setLocalProject(prev => ({ ...prev, key_learnings: updatedLearnings }));
    updateField("key_learnings", updatedLearnings);
    toast.success("Tech removed");
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
      <div className="bg-portfolio-card rounded-lg shadow-md overflow-hidden my-4 animate-fade-in card-transition">
        {/* Image Section - Fixed aspect ratio */}
        {localProject.image_url && (
          <div className="w-full aspect-[16/9] overflow-hidden bg-gray-100">
            <img 
              src={localProject.image_url} 
              alt={localProject.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6">
          <div className="mb-3">
            <h2 className="font-bold text-xl mb-1">{localProject.title}</h2>
            {localProject.project_role && (
              <p className="text-sm text-portfolio-muted italic">{localProject.project_role}</p>
            )}
          </div>
          {localProject.description && localProject.description.trim().length > 0 && (
            <div className="text-portfolio-muted mb-4 text-sm text-justify">
              {renderDescription(localProject.description)}
            </div>
          )}
          
          {/* Tech Used */}
          {localProject.key_learnings && localProject.key_learnings.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-sm mb-2 text-portfolio-blue">Tech Used</h3>
              <ul className="list-disc list-inside space-y-1 text-left">
                {localProject.key_learnings.map((learning, index) => (
                  <li key={index} className="text-sm text-portfolio-muted">{learning}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Features */}
          {localProject.features.length > 0 && (
            <div className="features flex flex-wrap gap-2 mb-4">
              {localProject.features.map((feature) => (
                <span
                  key={feature.id}
                  className="bg-gray-100 text-gray-700 py-1 px-3 rounded-full text-sm border"
                >
                  {feature.title}
                </span>
              ))}
            </div>
          )}

          {/* Links */}
          {localProject.links.length > 0 && (
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
          )}
        </div>
      </div>
    );
  }
  
  // Edit mode
  return (
    <div className="bg-portfolio-card rounded-lg shadow-md overflow-hidden my-4 animate-fade-in card-transition">
      {/* Image Section - Fixed aspect ratio */}
      {(localProject.image_url || isEditing) && (
        <div className="w-full aspect-[16/9] overflow-hidden bg-gray-100 relative group">
          {localProject.image_url ? (
            <EditableImage
              src={localProject.image_url}
              alt={localProject.title}
              onChange={(newImageUrl) => updateField("image_url", newImageUrl)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div 
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      updateField("image_url", event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                };
                input.click();
              }}
              className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <Plus size={40} className="text-gray-400" />
            </div>
          )}
        </div>
      )}
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <EditableField
            value={localProject.title}
            onChange={(value) => updateField("title", value)}
            tag="h2"
            className="font-bold text-xl mb-1"
            placeholder="Project Title"
          />
          <EditableField
            value={localProject.project_role || ""}
            onChange={(value) => updateField("project_role", value)}
            tag="p"
            className="text-sm text-portfolio-muted italic"
            placeholder="Project Role (optional)"
          />
        </div>
        
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
        className="text-portfolio-muted mb-4 text-sm text-justify"
        placeholder="Project Description (Use '- ' or '* ' at the start of a line for bullet points)"
        multiline
      />
      
      {isEditing && (
        <div className="text-xs text-gray-500 mb-3 italic">
          Tip: Use "- " or "* " at the start of a line to create bullet points
        </div>
      )}
      
      {/* Tech Used Section */}
      <div className="key-learnings mb-4">
        {localProject.key_learnings && localProject.key_learnings.length > 0 && (
          <div className="mb-3">
            <h3 className="font-semibold text-sm mb-2 text-portfolio-blue">Tech Used</h3>
            <div className="space-y-2 text-left">
              {localProject.key_learnings.map((learning, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-portfolio-muted mt-0.5">•</span>
                  {isEditing ? (
                    <>
                      <EditableField
                        value={learning}
                        onChange={(value) => updateKeyLearning(index, value)}
                        tag="span"
                        className="text-sm text-portfolio-muted flex-1"
                        placeholder="Technology"
                        autoEdit={lastAddedLearningIndex === index}
                        onEditingChange={(editing) => {
                          if (!editing && lastAddedLearningIndex === index) {
                            setLastAddedLearningIndex(null);
                          }
                        }}
                      />
                      <button
                        onClick={() => deleteKeyLearning(index)}
                        className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-portfolio-muted">{learning}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {isEditing && (
          <button
            onClick={addKeyLearning}
            className="flex items-center text-gray-600 text-sm hover:text-gray-800 transition-colors"
          >
            <Plus size={14} className="mr-1" /> Add Tech
          </button>
        )}
      </div>
      
      {/* Features Section */}
      <div className="features mb-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {localProject.features.map((feature) => (
            <div 
              key={feature.id} 
              className="flex items-center gap-1"
            >
              {isEditing ? (
                <>
<EditableField
  value={feature.title}
  onChange={(value) => updateFeature(feature.id, "title", value)}
  tag="span"
  className="text-sm bg-gray-100 text-gray-700 py-1 px-3 rounded-full border"
  placeholder="Feature name"
  autoEdit={feature.id === lastAddedFeatureId}
  onEditingChange={(editing) => {
    if (!editing && lastAddedFeatureId === feature.id) {
      setLastAddedFeatureId(null);
    }
  }}
/>
                  <button
                    onClick={() => deleteFeature(feature.id)}
                    className="text-red-500 hover:text-red-700 transition-colors ml-1"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <span className="bg-gray-100 text-gray-700 py-1 px-3 rounded-full text-sm border">
                  {feature.title}
                </span>
              )}
            </div>
          ))}
        </div>
        
        {isEditing && (
          <button
            onClick={addFeature}
            className="flex items-center text-gray-600 text-sm hover:text-gray-800 transition-colors"
          >
            <Plus size={14} className="mr-1" /> Add Feature
          </button>
        )}
      </div>

      {/* Links Section */}
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
                  className="text-portfolio-muted hover:text-red-500 transition-colors"
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
    </div>
  );
};

export default ProjectCard;
