
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SectionData } from "@/utils/localStorage";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ProfileData {
  name: string;
  photo: string;
  email: string;
  telephone: string;
  role: string;
  tagline: string;
}

export const usePortfolioData = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    photo: "",
    email: "",
    telephone: "",
    role: "",
    tagline: ""
  });
  const [sections, setSections] = useState<SectionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
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
          role: profileData.role || "",
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
            role: "",
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

  // Load data when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  return {
    profileData,
    sections,
    isLoading,
    loadData
  };
};
