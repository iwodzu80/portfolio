import React, { useState, useEffect } from "react";
import ProfileSection from "@/components/ProfileSection";
import SectionContainer from "@/components/SectionContainer";
import { SectionData } from "@/utils/localStorage";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, LogOut, Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import SharePortfolioDialog from "@/components/SharePortfolioDialog";

const Index = () => {
  const [profileData, setProfileData] = useState({
    name: "",
    photo: "",
    email: "",
    telephone: "",
    tagline: ""
  });
  const [sections, setSections] = useState<SectionData[]>([]);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Load data from Supabase for the current user's profile and sections
  const loadData = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Fetching data for user:", user.id);
      
      // Fetch profile data from Supabase
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Error fetching profile:", fetchError);
        throw fetchError;
      }
      
      // Check if profile exists
      if (profileData) {
        setProfileData({
          name: profileData.name || "",
          photo: profileData.photo || "",
          email: profileData.email || user.email || "",
          telephone: profileData.telephone || "",
          tagline: profileData.tagline || ""
        });
      } else {
        console.log("No profile found, creating one...");
        // Create a profile if one doesn't exist
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email
          });
          
        if (insertError) {
          console.error("Error creating profile:", insertError);
        } else {
          console.log("Profile created successfully");
          setProfileData({
            name: "",
            photo: "",
            email: user.email || "",
            telephone: "",
            tagline: ""
          });
        }
      }
      
      // Fetch sections from Supabase
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('sections')
        .select(`
          id,
          title,
          projects:projects(
            id,
            title,
            description,
            links:links(
              id,
              title,
              url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (sectionsError) {
        console.error("Error fetching sections:", sectionsError);
        throw sectionsError;
      }
      
      if (sectionsData && sectionsData.length > 0) {
        // Transform data to match the expected structure
        const transformedSections: SectionData[] = sectionsData.map(section => ({
          id: section.id,
          title: section.title,
          projects: section.projects.map(project => ({
            id: project.id,
            title: project.title,
            description: project.description || "",
            links: project.links.map(link => ({
              id: link.id,
              title: link.title,
              url: link.url
            }))
          }))
        }));
        
        setSections(transformedSections);
      } else {
        // If no sections found, create a default section
        await createDefaultSection(user.id);
      }
    } catch (error: any) {
      console.error("Error loading data:", error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a default section when a new user signs up
  const createDefaultSection = async (userId: string) => {
    try {
      // Insert default section
      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .insert({
          user_id: userId,
          title: "My Projects"
        })
        .select('id')
        .single();
        
      if (sectionError) {
        console.error("Error creating default section:", sectionError);
        return;
      }
      
      // Insert default project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          section_id: sectionData.id,
          title: "Personal Portfolio",
          description: "A responsive portfolio website built with React and TailwindCSS."
        })
        .select('id')
        .single();
        
      if (projectError) {
        console.error("Error creating default project:", projectError);
        return;
      }
      
      // Insert default links
      const links = [
        { project_id: projectData.id, title: "GitHub", url: "https://github.com" },
        { project_id: projectData.id, title: "Live Site", url: "https://example.com" }
      ];
      
      const { error: linksError } = await supabase
        .from('links')
        .insert(links);
        
      if (linksError) {
        console.error("Error creating default links:", linksError);
        return;
      }
      
      // Reload data after creating defaults
      loadData();
    } catch (error: any) {
      console.error("Error in createDefaultSection:", error.message);
    }
  };

  // This function is passed to child components
  const handleUpdate = () => {
    // Reload data from Supabase
    loadData();
  };

  // Load data when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadData();
    }
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
        <div className="flex justify-end mb-4">
          <div className="flex gap-2">
            <SharePortfolioDialog />
            <Button
              onClick={() => navigate("/settings")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <SettingsIcon size={18} />
              Settings
            </Button>
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
          telephone={profileData.telephone}
          tagline={profileData.tagline}
          onUpdate={handleUpdate}
          isEditingMode={isEditingMode}
        />
        
        <div className="my-6 border-t border-gray-200 max-w-md mx-auto" />
        
        <SectionContainer
          sections={sections}
          onUpdate={handleUpdate}
          isEditingMode={isEditingMode}
        />
      </div>
    </div>
  );
};

export default Index;
