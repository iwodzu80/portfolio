
import React, { useState, useEffect } from "react";
import ProfileSection from "../components/ProfileSection";
import SectionContainer from "../components/SectionContainer";
import { SectionData } from "../utils/localStorage";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Share2 } from "lucide-react";
import SharePortfolioDialog from "@/components/SharePortfolioDialog";

const Index = () => {
  const [profile, setProfile] = useState({
    name: "",
    photo: "",
    email: "",
    telephone: "",
    tagline: "",
  });
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { user } = useAuth();
  
  const fetchPortfolioData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        toast.error("Failed to load your profile data");
        return;
      }
      
      // Get sections with projects and links
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .eq('user_id', user.id);
        
      if (sectionsError) {
        console.error("Error fetching sections:", sectionsError);
        toast.error("Failed to load your sections");
        return;
      }
      
      // If no sections exist yet, create a default one
      if (sectionsData.length === 0) {
        const { data: newSection, error: newSectionError } = await supabase
          .from('sections')
          .insert({
            title: "My Projects",
            user_id: user.id
          })
          .select()
          .single();
          
        if (newSectionError) {
          console.error("Error creating default section:", newSectionError);
          toast.error("Failed to create default section");
          return;
        }
        
        sectionsData.push(newSection);
      }
      
      // Get all projects for these sections
      const allSectionIds = sectionsData.map(section => section.id);
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .in('section_id', allSectionIds);
        
      if (projectsError) {
        console.error("Error fetching projects:", projectsError);
        toast.error("Failed to load your projects");
        return;
      }
      
      // Get all links for these projects
      const allProjectIds = projectsData.map(project => project.id);
      const { data: linksData, error: linksError } = await supabase
        .from('links')
        .select('*')
        .in('project_id', allProjectIds.length ? allProjectIds : ['no_projects']);
        
      if (linksError && allProjectIds.length > 0) {
        console.error("Error fetching links:", linksError);
        toast.error("Failed to load your project links");
        return;
      }
      
      // Build the sections data structure with projects and links
      const formattedSections: SectionData[] = sectionsData.map(section => {
        const sectionProjects = projectsData
          .filter(project => project.section_id === section.id)
          .map(project => {
            const projectLinks = linksData
              ? linksData
                  .filter(link => link.project_id === project.id)
                  .map(link => ({
                    id: link.id,
                    title: link.title,
                    url: link.url
                  }))
              : [];
              
            return {
              id: project.id,
              title: project.title,
              description: project.description || "",
              links: projectLinks
            };
          });
          
        return {
          id: section.id,
          title: section.title,
          projects: sectionProjects
        };
      });
      
      // Update state with fetched data
      setProfile({
        name: profileData?.name || "",
        photo: profileData?.photo || "",
        email: profileData?.email || "",
        telephone: profileData?.telephone || "",
        tagline: profileData?.tagline || ""
      });
      
      setSections(formattedSections);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      toast.error("Failed to load your portfolio data");
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchPortfolioData();
    }
  }, [user]);
  
  const handleProfileUpdate = async (updatedProfile: any) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updatedProfile.name,
          photo: updatedProfile.photo,
          email: updatedProfile.email,
          telephone: updatedProfile.telephone,
          tagline: updatedProfile.tagline,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setProfile(updatedProfile);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };
  
  const handleSectionsUpdate = () => {
    fetchPortfolioData();
  };
  
  if (loading && !user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="relative">
      <div className="flex justify-end px-4 py-2">
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => setShareDialogOpen(true)}
        >
          <Share2 className="h-4 w-4" />
          Share Portfolio
        </Button>
      </div>
      
      <ProfileSection
        name={profile.name}
        photo={profile.photo}
        email={profile.email}
        telephone={profile.telephone}
        tagline={profile.tagline}
        onUpdate={handleProfileUpdate}
      />
      
      <SectionContainer
        sections={sections}
        onUpdate={handleSectionsUpdate}
      />
      
      <SharePortfolioDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
    </div>
  );
};

export default Index;
