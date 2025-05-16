
import React, { useState, useEffect } from "react";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Link, Share2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SharePortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SharePortfolioDialog: React.FC<SharePortfolioDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shares, setShares] = useState<any[]>([]);

  const fetchShares = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolio_shares')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setShares(data || []);
    } catch (error) {
      console.error('Error fetching shares:', error);
      toast.error('Failed to load share links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchShares();
    }
  }, [open, user]);

  const createShareLink = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolio_shares')
        .insert({
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setShares([...shares, data]);
      toast.success('Share link created');
    } catch (error) {
      console.error('Error creating share:', error);
      toast.error('Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  const toggleShareStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('portfolio_shares')
        .update({ active: !currentStatus })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setShares(
        shares.map(share => 
          share.id === id ? { ...share, active: !currentStatus } : share
        )
      );
      
      toast.success(currentStatus ? 'Share link disabled' : 'Share link enabled');
    } catch (error) {
      console.error('Error toggling share status:', error);
      toast.error('Failed to update share link');
    }
  };

  const copyToClipboard = (shareId: string) => {
    const url = `${window.location.origin}/shared/${shareId}`;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied to clipboard');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Share Your Portfolio</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-1">
            Create links to share your portfolio with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          {shares.length === 0 ? (
            <div className="text-center py-6 border rounded-lg border-dashed border-gray-300 bg-gray-50">
              <p className="text-gray-500">No share links yet</p>
              <p className="text-sm text-gray-400 mt-1">Create one to share your portfolio</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shares.map((share) => (
                <Card key={share.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium mb-1">Share Link:</p>
                      <div className="flex items-center border rounded-md px-2 py-1 bg-gray-50">
                        <Link className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-sm text-gray-700 truncate">
                          {`${window.location.origin}/shared/${share.share_id}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center ml-2">
                      <Button
                        onClick={() => copyToClipboard(share.share_id)}
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        onClick={() => toggleShareStatus(share.id, share.active)}
                        size="sm"
                        variant={share.active ? "outline" : "default"}
                        className="h-8 ml-1"
                      >
                        {share.active ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <Button
            variant="default"
            onClick={createShareLink}
            disabled={loading}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            Create Share Link
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SharePortfolioDialog;
