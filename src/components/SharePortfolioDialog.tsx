
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Share2, Copy, RotateCw } from "lucide-react";

interface ShareData {
  id: string;
  user_id: string;
  share_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const SharePortfolioDialog = () => {
  const { user } = useAuth();
  const [shareLink, setShareLink] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [shareId, setShareId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Dynamic base URL detection
  const getBaseUrl = () => {
    const hostname = window.location.hostname;
    
    // Check if we're on the custom domain
    if (hostname === 'clickly.it' || hostname === 'www.clickly.it') {
      return 'https://clickly.it';
    }
    
    // Default to current origin for preview/dev environments
    return window.location.origin;
  };
  
  const loadShareData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log("Loading share data for user:", user.id);
      const { data, error } = await supabase
        .from('portfolio_shares')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      console.log("Share data result:", { data, error });
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error loading share data:", error);
        throw error;
      }
      
      if (data) {
        setShareId(data.share_id);
        setIsActive(data.is_active);
        const baseUrl = getBaseUrl();
        setShareLink(`${baseUrl}/shared/${data.share_id}`);
      }
    } catch (error: any) {
      console.error("Error fetching share data:", error);
      toast.error("Failed to load sharing settings");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (open) {
      loadShareData();
    }
  }, [user, open]);
  
  const generateNewShareId = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const MAX_RETRIES = 5;
      let attempts = 0;
      let success = false;
      let newShareId = '';
      
      while (attempts < MAX_RETRIES && !success) {
        attempts++;
        
        // Generate a new random share ID
        newShareId = crypto.randomUUID();
        
        try {
          // Check if a share record already exists for this user
          const { data: existingShare } = await supabase
            .from('portfolio_shares')
            .select('share_id')
            .eq('user_id', user.id)
            .maybeSingle();
          
          let error;
          
          if (existingShare) {
            // Update existing record
            const { error: updateError } = await supabase
              .from('portfolio_shares')
              .update({ 
                share_id: newShareId,
                is_active: true,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id);
              
            error = updateError;
          } else {
            // Create new record
            const { error: insertError } = await supabase
              .from('portfolio_shares')
              .insert({
                user_id: user.id,
                share_id: newShareId,
                is_active: true
              });
              
            error = insertError;
          }
          
          if (error) {
            // Check if this is a unique constraint violation on share_id
            if (error.code === '23505' && error.message.includes('portfolio_shares_share_id_unique')) {
              console.log(`Share ID collision detected on attempt ${attempts}, retrying...`);
              continue; // Try again with a new UUID
            } else {
              throw error; // Other errors should not be retried
            }
          }
          
          success = true;
        } catch (retryError: any) {
          if (retryError.code === '23505' && retryError.message.includes('portfolio_shares_share_id_unique')) {
            console.log(`Share ID collision detected on attempt ${attempts}, retrying...`);
            continue; // Try again with a new UUID
          } else {
            throw retryError; // Other errors should not be retried
          }
        }
      }
      
      if (!success) {
        throw new Error(`Failed to generate unique share ID after ${MAX_RETRIES} attempts`);
      }
      
      setShareId(newShareId);
      const baseUrl = getBaseUrl();
      setShareLink(`${baseUrl}/shared/${newShareId}`);
      setIsActive(true);
      toast.success("New share link generated");
    } catch (error: any) {
      console.error("Error generating share ID:", error);
      toast.error("Failed to generate share link");
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleShareActive = async (active: boolean) => {
    if (!user || !shareId) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('portfolio_shares')
        .update({ 
          is_active: active,
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', user.id);
        
      if (error) {
        console.error("Error updating share status:", error);
        throw error;
      }
      
      setIsActive(active);
      toast.success(active ? "Share link activated" : "Share link deactivated");
    } catch (error: any) {
      console.error("Error toggling share status:", error);
      toast.error("Failed to update sharing status");
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success("Share link copied to clipboard");
    } catch (error) {
      console.error("Failed to copy:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success("Share link copied to clipboard");
      } catch (fallbackError) {
        toast.error("Failed to copy link");
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Share2 size={18} />
          Share Portfolio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Portfolio</DialogTitle>
          <DialogDescription>
            Create a public link to share your portfolio in read-only mode.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="share-active">Active</Label>
                  <p className="text-sm text-muted-foreground">
                    {isActive ? "Your portfolio is publicly accessible" : "Share link is disabled"}
                  </p>
                </div>
                <Switch
                  id="share-active"
                  checked={isActive}
                  onCheckedChange={toggleShareActive}
                  disabled={!shareId || isLoading}
                />
              </div>
              
              {shareId && (
                <div className="space-y-2">
                  <Label htmlFor="share-link">Current Share Link</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="share-link"
                      value={shareLink}
                      readOnly
                      className="flex-1"
                    />
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={copyToClipboard} 
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This is your active portfolio share link. Generating a new link will replace this one.
                  </p>
                </div>
              )}
              
              <div className="pt-2">
                <Button 
                  variant="secondary" 
                  onClick={generateNewShareId} 
                  disabled={isLoading}
                  className="w-full flex items-center justify-center"
                >
                  <RotateCw size={16} className="mr-2" />
                  {shareId ? "Generate New Link" : "Create Share Link"}
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  This will invalidate any previous share links.
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SharePortfolioDialog;
