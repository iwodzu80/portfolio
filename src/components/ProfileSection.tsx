import React, { useState, useEffect } from "react";
import EditableField from "./EditableField";
import { ProfileData } from "@/types/portfolio";
import { toast } from "sonner";

interface ProfileSectionProps {
  name: string;
  photo: string;
  email: string;
  telephone: string;
  role: string;
  tagline: string;
  description: string;
  onUpdate: () => void;
  isEditingMode?: boolean;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  name,
  photo,
  email,
  telephone,
  role,
  tagline,
  description,
  onUpdate,
  isEditingMode = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localProfile, setLocalProfile] = useState({
    name: name || "",
    photo: photo || "",
    email: email || "",
    telephone: telephone || "",
    role: role || "",
    tagline: tagline || "",
    description: description || ""
  });

  useEffect(() => {
    setLocalProfile({
      name: name || "",
      photo: photo || "",
      email: email || "",
      telephone: telephone || "",
      role: role || "",
      tagline: tagline || "",
      description: description || ""
    });
  }, [name, photo, email, telephone, role, tagline, description]);

  const updateField = (field: keyof ProfileData, value: string) => {
    setLocalProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileUpdate = async () => {
    setIsEditing(false);
    
    const updatedProfile: ProfileData = {
      name: localProfile.name,
      photo: localProfile.photo,
      email: localProfile.email,
      telephone: localProfile.telephone,
      role: localProfile.role,
      tagline: localProfile.tagline,
      description: localProfile.description
    };

    setLocalProfile({
      name: updatedProfile.name,
      photo: updatedProfile.photo,
      email: updatedProfile.email,
      telephone: updatedProfile.telephone,
      role: updatedProfile.role,
      tagline: updatedProfile.tagline,
      description: updatedProfile.description
    });

    toast.success("Profile updated");
    onUpdate();
  };

  return (
    <div className="max-w-2xl mx-auto px-6">
      <div className="flex justify-center">
        <div className="relative w-32 h-32 rounded-full overflow-hidden">
          <img
            src={localProfile.photo}
            alt="Profile"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
      
      <div className="mt-4 text-center">
        {isEditingMode ? (
          <EditableField
            value={localProfile.name}
            onChange={(value) => updateField("name", value)}
            tag="h1"
            className="text-2xl font-bold"
            placeholder="Your Name"
          />
        ) : (
          <h1 className="text-2xl font-bold">{localProfile.name}</h1>
        )}
        
        {isEditingMode ? (
          <EditableField
            value={localProfile.role}
            onChange={(value) => updateField("role", value)}
            tag="h2"
            className="text-xl text-muted-foreground"
            placeholder="Your Role"
          />
        ) : (
          <h2 className="text-xl text-muted-foreground">{localProfile.role}</h2>
        )}
        
        {isEditingMode ? (
          <EditableField
            value={localProfile.tagline}
            onChange={(value) => updateField("tagline", value)}
            tag="h3"
            className="text-lg text-portfolio-muted"
            placeholder="Your Tagline"
          />
        ) : (
          <h3 className="text-lg text-portfolio-muted">{localProfile.tagline}</h3>
        )}
      </div>
      
      <div className="mt-6 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            {isEditingMode ? (
              <EditableField
                value={localProfile.email}
                onChange={(value) => updateField("email", value)}
                className="text-sm text-muted-foreground"
                label="Email"
                placeholder="Your email address"
              />
            ) : (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Email</div>
                <div className="text-sm">{localProfile.email}</div>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            {isEditingMode ? (
              <EditableField
                value={localProfile.telephone}
                onChange={(value) => updateField("telephone", value)}
                className="text-sm text-muted-foreground"
                label="Telephone"
                placeholder="Your telephone number"
              />
            ) : (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Telephone</div>
                <div className="text-sm">{localProfile.telephone}</div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          {isEditingMode ? (
            <EditableField
              value={localProfile.description}
              onChange={(value) => updateField("description", value)}
              className="text-sm text-muted-foreground"
              label="Description"
              placeholder="Add a brief description about yourself"
              multiline
            />
          ) : (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Description</div>
              <div className="text-sm">{localProfile.description}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
