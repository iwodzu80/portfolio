
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import EditableImage from "./EditableImage";
import EditableField from "./EditableField";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../contexts/AuthContext";

interface ProfileSectionProps {
  name: string;
  photo: string;
  email: string;
  location: string;
  tagline: string;
  onUpdate: () => void;
  isEditingMode?: boolean;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  name,
  photo,
  email,
  location,
  tagline,
  onUpdate,
  isEditingMode = true
}) => {
  const { user } = useAuth();
  
  // Set document title when name changes
  useEffect(() => {
    if (name) {
      document.title = `${name}'s Portfolio`;
    } else {
      document.title = "Portfolio";
    }
  }, [name]);

  const handleProfileUpdate = async (field: string, value: string) => {
    if (!user) {
      toast.error("You must be logged in to update your profile");
      return;
    }
    
    try {
      const updateData = {
        [field]: value,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
      onUpdate();
    } catch (error: any) {
      toast.error(`Error updating profile: ${error.message}`);
    }
  };

  if (!isEditingMode) {
    // Read-only mode
    return (
      <section className="flex flex-col items-center max-w-md mx-auto mb-8 p-6">
        {photo && (
          <img
            src={photo}
            alt={name}
            className="w-32 h-32 md:w-40 md:h-40 shadow-md border-4 border-white rounded-full object-cover"
          />
        )}
        
        <div className="mt-6 w-full text-center">
          <h1 className="font-bold text-2xl md:text-3xl mb-2">{name || "Your Name"}</h1>
          <p className="text-portfolio-muted mb-4">{tagline || "Your tagline"}</p>
          
          <div className="flex justify-center items-center gap-2 text-sm text-portfolio-muted">
            {email && <span className="text-portfolio-blue">{email}</span>}
            {email && location && <span className="mx-1">•</span>}
            {location && <span>{location}</span>}
          </div>
        </div>
      </section>
    );
  }

  // Edit mode
  return (
    <section className="flex flex-col items-center max-w-md mx-auto mb-8 p-6">
      <EditableImage
        src={photo}
        alt={name}
        onChange={(value) => handleProfileUpdate("photo", value)}
        className="w-32 h-32 md:w-40 md:h-40 shadow-md border-4 border-white"
      />
      
      <div className="mt-6 w-full text-center">
        <EditableField
          value={name}
          onChange={(value) => handleProfileUpdate("name", value)}
          tag="h1"
          className="font-bold text-2xl md:text-3xl mb-2"
          placeholder="Your Name"
        />
        
        <EditableField
          value={tagline}
          onChange={(value) => handleProfileUpdate("tagline", value)}
          tag="p"
          className="text-portfolio-muted mb-4"
          placeholder="Your tagline"
          multiline
        />
        
        <div className="flex justify-center items-center gap-2 text-sm text-portfolio-muted">
          <EditableField
            value={email}
            onChange={(value) => handleProfileUpdate("email", value)}
            tag="span"
            placeholder="Email"
            className="text-portfolio-blue"
          />
          <span className="mx-1">•</span>
          <EditableField
            value={location}
            onChange={(value) => handleProfileUpdate("location", value)}
            tag="span"
            placeholder="Location"
          />
        </div>
      </div>
    </section>
  );
};

export default ProfileSection;
