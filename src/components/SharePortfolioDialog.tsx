
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Copy, RefreshCw, Check } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";

const SharePortfolioDialog = () => {
  const [shareId, setShareId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  // Fetch existing share ID when dialog opens
  const fetchExistingShareId = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('portfolio_shares')
        .select('share_id')
        .eq('user_id', user.id)
        .eq('active', true)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setShareId(data.share_id);
      }
    } catch (error: any) {
      console.error("Error fetching share ID:", error.message);
      toast.error("Could not fetch sharing information");
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new share link
  const createShareLink = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Check if a share already exists
      const { data: existingShare } = await supabase
        .from('portfolio_shares')
        .select('id')
        .eq('user_id', user.id)
        .eq('active', true)
        .maybeSingle();
      
      if (existingShare) {
        // Update existing share with new share_id
        const newShareId = crypto.randomUUID();
        const { error } = await supabase
          .from('portfolio_shares')
          .update({ 
            share_id: newShareId,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingShare.id);
        
        if (error) throw error;
        setShareId(newShareId);
        toast.success("Share link updated successfully");
      } else {
        // Create new share
        const newShareId = crypto.randomUUID();
        const { error } = await supabase
          .from('portfolio_shares')
          .insert({ 
            user_id: user.id,
            share_id: newShareId
          });
        
        if (error) throw error;
        setShareId(newShareId);
        toast.success("Share link created successfully");
      }
    } catch (error: any) {
      console.error("Error creating share link:", error.message);
      toast.error("Could not create share link");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate the full share URL whenever shareId changes
  useEffect(() => {
    if (shareId) {
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/shared/${shareId}`);
    } else {
      setShareUrl("");
    }
  }, [shareId]);

  // Copy share URL to clipboard
  const copyToClipboard = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Share link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link to clipboard");
    }
  };

  return (
    <Dialog onOpenChange={(open) => {
      if (open) fetchExistingShareId();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Share2 size={18} />
          Share Portfolio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-semibold mb-1">Share your portfolio</DialogTitle>
          <DialogDescription className="text-base text-gray-500">
            Create a shareable link that allows others to view your portfolio without signing in.
          </DialogDescription>
        </DialogHeader>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            {shareId ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-gray-700">Share Link</label>
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-100 p-3 rounded-md flex-1 overflow-x-auto scrollbar-none whitespace-nowrap text-sm border border-gray-200">
                      {shareUrl}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyToClipboard}
                      className="flex-shrink-0 h-10 w-10 border-gray-300 hover:bg-gray-50"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-end mt-2">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={createShareLink}
                    disabled={isLoading}
                  >
                    <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    Regenerate Link
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6">
                <Share2 size={32} className="text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4 text-center">No share link yet. Create one to let others view your portfolio.</p>
                <Button
                  onClick={createShareLink}
                  disabled={isLoading}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <Share2 size={18} />
                  {isLoading ? "Creating..." : "Create Share Link"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-sm text-muted-foreground mt-4">
          <p className="mb-1">
            <strong>Note:</strong> Anyone with this link will be able to view your portfolio in read-only mode.
          </p>
          <p>
            Generate a new link to revoke access from the previous link.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SharePortfolioDialog;
