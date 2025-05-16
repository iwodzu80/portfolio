
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSharePortfolio = (userId: string | undefined) => {
  const [isLoading, setIsLoading] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);

  const fetchShareId = async () => {
    if (!userId) return null;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('portfolio_shares')
        .select('share_id')
        .eq('user_id', userId)
        .eq('active', true)
        .maybeSingle();
      
      if (error) throw error;
      
      setShareId(data?.share_id || null);
      return data?.share_id || null;
    } catch (error: any) {
      console.error("Error fetching share ID:", error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createShareLink = async (): Promise<string | null> => {
    if (!userId) return null;
    
    setIsLoading(true);
    try {
      // Check if a share already exists
      const { data: existingShare } = await supabase
        .from('portfolio_shares')
        .select('id')
        .eq('user_id', userId)
        .eq('active', true)
        .maybeSingle();
      
      const newShareId = crypto.randomUUID();
      
      if (existingShare) {
        // Update existing share with new share_id
        const { error } = await supabase
          .from('portfolio_shares')
          .update({ 
            share_id: newShareId,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingShare.id);
        
        if (error) throw error;
      } else {
        // Create new share
        const { error } = await supabase
          .from('portfolio_shares')
          .insert({ 
            user_id: userId,
            share_id: newShareId
          });
        
        if (error) throw error;
      }
      
      setShareId(newShareId);
      return newShareId;
    } catch (error: any) {
      console.error("Error creating/updating share link:", error.message);
      toast.error("Could not create share link");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { shareId, isLoading, fetchShareId, createShareLink };
};
