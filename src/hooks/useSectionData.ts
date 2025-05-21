
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SectionData } from "@/types/portfolio";

export const useSectionData = (userId: string | undefined) => {
  const [sections, setSections] = useState<SectionData[]>([]);

  const fetchSections = async () => {
    if (!userId) return [];
    
    try {
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
        .eq('user_id', userId)
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
        return transformedSections;
      }
      
      return [];
    } catch (error: any) {
      console.error("Error in fetchSections:", error);
      return [];
    }
  };

  return {
    sections,
    setSections,
    fetchSections
  };
};
