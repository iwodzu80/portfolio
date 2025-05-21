
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
  const { user } = useAuth();
  const [localState, setLocalState] = useState({
    name,
    photo,
    email,
    telephone,
    role,
    tagline,
    description
  });
  
  // Update local state when props change (e.g., on initial load)
  useEffect(() => {
    setLocalState({
      name,
      photo,
      email,
      telephone,
      role,
      tagline,
      description
    });
  }, [name, photo, email, telephone, role, tagline, description]);
  
  // Set document title when name changes
  useEffect(() => {
    if (localState.name) {
      document.title = `${localState.name}'s Portfolio`;
    } else {
      document.title = "Portfolio";
    }
  }, [localState.name]);

  const handleProfileUpdate = async (field: string, value: string) => {
    if (!user) {
      toast.error("You must be logged in to update your profile");
      return;
    }
    
    // Update local state immediately for a responsive UI
    setLocalState(prevState => ({
      ...prevState,
      [field]: value
    }));
    
    try {
      console.log(`Updating profile field ${field} for user ${user.id} with value:`, value);
      
      // Create data object for update
      const updateData = {
        [field]: value,
        updated_at: new Date().toISOString()
      };
      
      // Check if profile exists first
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is fine
        console.error("Error checking profile existence:", checkError);
        throw checkError;
      }
      
      let error;
      
      if (!existingProfile) {
        // Create profile if it doesn't exist
        console.log("Profile doesn't exist, creating new profile");
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            [field]: value
          });
        error = insertError;
        
        if (!insertError) {
          console.log("Profile created successfully with field:", field);
        }
      } else {
        // Update existing profile
        console.log("Profile exists, updating field:", field);
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);
        error = updateError;
        
        if (!updateError) {
          console.log("Profile updated successfully with field:", field);
        }
      }
        
      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }
      
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
      
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(`Error updating profile: ${error.message}`);
      
      // Revert local state on error - FIX: Adding description to match state type
      setLocalState({
        name,
        photo,
        email,
        telephone,
        role,
        tagline,
        description
      });
    }
  };

  // Read-only mode
  if (!isEditingMode) {
    return (
      <section className="flex flex-col items-center max-w-xl mx-auto mb-8 p-6">
        {localState.photo && (
          <img
            src={localState.photo}
            alt={localState.name}
            className="w-32 h-32 md:w-40 md:h-40 shadow-md border-4 border-white rounded-full object-cover"
          />
        )}
        
        <div className="mt-6 w-full text-center">
          <h1 className="font-bold text-2xl md:text-3xl mb-2">{localState.name || "Your Name"}</h1>
          {localState.role && <p className="text-portfolio-blue text-lg mb-2">{localState.role}</p>}
          {localState.tagline && <p className="text-portfolio-muted mb-4">{localState.tagline}</p>}
          
          <div className="flex justify-center items-center gap-2 text-sm text-portfolio-muted mb-4">
            {localState.email && <span className="text-portfolio-blue">{localState.email}</span>}
            {localState.email && localState.telephone && <span className="mx-1">•</span>}
            {localState.telephone && <span>{localState.telephone}</span>}
          </div>
          
          {localState.description && (
            <p className="text-portfolio-muted mt-4 max-w-prose mx-auto text-justify">{localState.description}</p>
          )}
        </div>
      </section>
    );
  }

  // Edit mode
  return (
    <section className="flex flex-col items-center max-w-xl mx-auto mb-8 p-6">
      <EditableImage
        src={localState.photo}
        alt={localState.name}
        onChange={(value) => handleProfileUpdate("photo", value)}
        className="w-32 h-32 md:w-40 md:h-40 shadow-md border-4 border-white"
      />
      
      <div className="mt-6 w-full text-center">
        <EditableField
          value={localState.name}
          onChange={(value) => handleProfileUpdate("name", value)}
          tag="h1"
          className="font-bold text-2xl md:text-3xl mb-2"
          placeholder="Your Name"
        />
        
        <EditableField
          value={localState.role}
          onChange={(value) => handleProfileUpdate("role", value)}
          tag="p"
          className="text-portfolio-blue text-lg mb-2"
          placeholder="Your Role"
        />
        
        <EditableField
          value={localState.tagline}
          onChange={(value) => handleProfileUpdate("tagline", value)}
          tag="p"
          className="text-portfolio-muted mb-4"
          placeholder="Your tagline"
          multiline
        />
        
        <div className="flex justify-center items-center gap-2 text-sm text-portfolio-muted mb-4">
          <EditableField
            value={localState.email}
            onChange={(value) => handleProfileUpdate("email", value)}
            tag="span"
            placeholder="Email"
            className="text-portfolio-blue"
          />
          <span className="mx-1">•</span>
          <EditableField
            value={localState.telephone}
            onChange={(value) => handleProfileUpdate("telephone", value)}
            tag="span"
            placeholder="Telephone"
          />
        </div>
        
        <EditableField
          value={localState.description}
          onChange={(value) => handleProfileUpdate("description", value)}
          tag="p"
          className="text-portfolio-muted mt-4 max-w-prose mx-auto text-justify"
          placeholder="Add a brief description about yourself..."
          multiline
        />
      </div>
    </section>
  );
};

export default ProfileSection;
