
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/types/portfolio";
import { toast } from "sonner";

export const useProfileData = (userId: string | undefined) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    photo: "",
    email: "",
    telephone: "",
    role: "",
    tagline: ""
  });

  const fetchProfileData = async () => {
    if (!userId) return null;
    
    try {
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Error fetching profile:", fetchError);
        throw fetchError;
      }
      
      if (profileData) {
        const formattedProfile = {
          name: profileData.name || "",
          photo: profileData.photo || "",
          email: profileData.email || "",
          telephone: profileData.telephone || "",
          role: profileData.role || "", 
          tagline: profileData.tagline || ""
        };
        setProfileData(formattedProfile);
        return formattedProfile;
      }
      
      return null;
    } catch (error: any) {
      console.error("Error in fetchProfileData:", error);
      return null;
    }
  };

  const createProfile = async (email: string | undefined) => {
    if (!userId || !email) return false;
    
    try {
      console.log("Creating profile for user:", userId);
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          role: "" // Add default empty role
        });
        
      if (insertError) {
        console.error("Error creating profile:", insertError);
        return false;
      } 
      
      console.log("Profile created successfully");
      const newProfile = {
        name: "",
        photo: "",
        email: email,
        telephone: "",
        role: "",
        tagline: ""
      };
      
      setProfileData(newProfile);
      return true;
    } catch (error: any) {
      console.error("Error in createProfile:", error);
      return false;
    }
  };

  return {
    profileData,
    setProfileData,
    fetchProfileData,
    createProfile
  };
};
