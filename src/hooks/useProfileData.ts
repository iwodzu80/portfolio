
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/types/portfolio";

export const useProfileData = (userId: string | undefined) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    photo: "",
    email: "",
    telephone: "",
    role: "",
    tagline: "",
    description: ""
  });

  const fetchProfileData = async () => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, this is ok
          console.log("No profile found for user:", userId);
          return null;
        }
        throw error;
      }
      
      if (data) {
        const profile: ProfileData = {
          name: data.name || "",
          photo: data.photo_url || "",
          email: data.email || "",
          telephone: data.phone || "",
          role: data.role || "",
          tagline: data.tagline || "",
          description: data.description || ""
        };
        
        setProfileData(profile);
        return profile;
      }
      
      return null;
    } catch (error: any) {
      console.error("Error fetching profile data:", error.message);
      return null;
    }
  };

  const createProfile = async (email: string | undefined) => {
    if (!userId || !email) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          email: email,
          name: "",
          photo_url: "",
          phone: "",
          role: "",
          tagline: "",
          description: ""
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        const profile: ProfileData = {
          name: data.name || "",
          photo: data.photo_url || "",
          email: data.email || "",
          telephone: data.phone || "",
          role: data.role || "",
          tagline: data.tagline || "",
          description: data.description || ""
        };
        
        setProfileData(profile);
        console.log("Profile created successfully:", profile);
      }
    } catch (error: any) {
      console.error("Error creating profile:", error.message);
    }
  };

  return {
    profileData,
    setProfileData,
    fetchProfileData,
    createProfile
  };
};
