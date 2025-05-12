
import React, { useState, useEffect } from "react";
import ProfileSection from "@/components/ProfileSection";
import SectionContainer from "@/components/SectionContainer";
import { loadData, SectionData } from "@/utils/localStorage";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [profileData, setProfileData] = useState({
    name: "",
    photo: "",
    email: "",
    location: "",
    tagline: ""
  });
  const [sections, setSections] = useState<SectionData[]>([]);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Load data from Supabase for the current user's profile
  const loadProfileData = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    try {
      // Fetch profile data from Supabase
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (profileData) {
        setProfileData({
          name: profileData.name || "",
          photo: profileData.photo || "",
          email: profileData.email || user.email || "",
          location: profileData.location || "",
          tagline: profileData.tagline || ""
        });
      }
      
      // Load sections from localStorage (not migrated to Supabase yet)
      const data = loadData();
      setSections(Array.isArray(data.sections) ? data.sections : []);
    } catch (error: any) {
      console.error("Error loading profile data:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts or user changes
  useEffect(() => {
    loadProfileData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-portfolio-bg pb-12">
      <Toaster position="top-center" />
      
      <div className="container mx-auto pt-10">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500">
            Logged in as: {user?.email}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsEditingMode(!isEditingMode)}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isEditingMode ? (
                <>
                  <Eye size={18} />
                  View Mode
                </>
              ) : (
                <>
                  <Pencil size={18} />
                  Edit Mode
                </>
              )}
            </Button>
            <Button 
              onClick={signOut}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut size={18} />
              Sign Out
            </Button>
          </div>
        </div>

        <ProfileSection
          name={profileData.name}
          photo={profileData.photo}
          email={profileData.email}
          location={profileData.location}
          tagline={profileData.tagline}
          onUpdate={loadProfileData}
          isEditingMode={isEditingMode}
        />
        
        <div className="my-6 border-t border-gray-200 max-w-md mx-auto" />
        
        <SectionContainer
          sections={sections}
          onUpdate={loadProfileData}
          isEditingMode={isEditingMode}
        />
      </div>
    </div>
  );
};

export default Index;
