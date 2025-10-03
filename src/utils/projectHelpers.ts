import { supabase } from "@/integrations/supabase/client";
import { LinkData, FeatureData } from "@/types/portfolio";
import { sanitizeText, validateAndFormatUrl } from "@/utils/securityUtils";

/**
 * Updates links for a project (deletes old ones and inserts new ones)
 */
export async function updateProjectLinks(
  projectId: string,
  links: LinkData[],
  userId: string
): Promise<void> {
  // Delete existing links
  const { error: deleteError } = await supabase
    .from('project_links')
    .delete()
    .eq('project_id', projectId);
    
  if (deleteError) throw deleteError;
  
  // Insert new links
  if (links.length > 0) {
    const linksToInsert = links
      .map(link => ({
        project_id: projectId,
        title: sanitizeText(link.title),
        url: validateAndFormatUrl(link.url),
        user_id: userId
      }))
      .filter(l => l.url !== "");
    
    if (linksToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('project_links')
        .insert(linksToInsert);
      
      if (insertError) throw insertError;
    }
  }
}

/**
 * Updates features for a project (deletes old ones and inserts new ones)
 */
export async function updateProjectFeatures(
  projectId: string,
  features: FeatureData[],
  userId: string
): Promise<void> {
  // Delete existing features
  const { error: deleteError } = await supabase
    .from('project_features')
    .delete()
    .eq('project_id', projectId);
    
  if (deleteError) throw deleteError;
  
  // Insert new features
  if (features.length > 0) {
    const featuresToInsert = features.map(feature => ({
      project_id: projectId,
      title: sanitizeText(feature.title),
      user_id: userId
    }));
    
    const { error: insertError } = await supabase
      .from('project_features')
      .insert(featuresToInsert);
      
    if (insertError) throw insertError;
  }
}

/**
 * Updates both links and features for a project
 */
export async function updateProjectRelations(
  projectId: string,
  links: LinkData[],
  features: FeatureData[],
  userId: string
): Promise<void> {
  await updateProjectLinks(projectId, links, userId);
  await updateProjectFeatures(projectId, features, userId);
}
