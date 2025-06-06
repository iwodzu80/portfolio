
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
    description: "",
    custom_url: ""
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
          photo: data.photo || "",
          email: data.email || "",
          telephone: data.telephone || "",
          role: data.role || "",
          tagline: data.tagline || "",
          description: data.description || "",
          custom_url: data.custom_url || ""
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
          id: userId,
          email: email,
          name: "",
          photo: "",
          telephone: "",
          role: "",
          tagline: "",
          description: "",
          custom_url: null
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        const profile: ProfileData = {
          name: data.name || "",
          photo: data.photo || "",
          email: data.email || "",
          telephone: data.telephone || "",
          role: data.role || "",
          tagline: data.tagline || "",
          description: data.description || "",
          custom_url: data.custom_url || ""
        };
        
        setProfileData(profile);
        console.log("Profile created successfully:", profile);
      }
    } catch (error: any) {
      console.error("Error creating profile:", error.message);
    }
  };

  const checkCustomUrlAvailability = async (customUrl: string): Promise<boolean> => {
    if (!customUrl || customUrl.trim() === '') return true;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('custom_url', customUrl.toLowerCase().trim())
        .neq('id', userId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error checking custom URL:", error);
        return false;
      }
      
      return !data; // Returns true if URL is available (no data found)
    } catch (error: any) {
      console.error("Error checking custom URL availability:", error);
      return false;
    }
  };

  return {
    profileData,
    setProfileData,
    fetchProfileData,
    createProfile,
    checkCustomUrlAvailability
  };
};
