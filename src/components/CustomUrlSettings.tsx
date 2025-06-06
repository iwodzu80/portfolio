
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileData } from "@/hooks/useProfileData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Check, Loader2, AlertCircle } from "lucide-react";

const CustomUrlSettings = () => {
  const { user } = useAuth();
  const { profileData, fetchProfileData, checkCustomUrlAvailability } = useProfileData(user?.id);
  const [customUrl, setCustomUrl] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  useEffect(() => {
    setCustomUrl(profileData.custom_url || "");
  }, [profileData.custom_url]);

  const validateCustomUrl = (url: string): string | null => {
    if (!url || url.trim() === '') return null;
    
    const trimmedUrl = url.trim().toLowerCase();
    
    // Check length
    if (trimmedUrl.length < 3) return "URL must be at least 3 characters long";
    if (trimmedUrl.length > 50) return "URL must be less than 50 characters";
    
    // Check format (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(trimmedUrl)) {
      return "URL can only contain lowercase letters, numbers, and hyphens";
    }
    
    // Check reserved words
    const reservedWords = ['admin', 'api', 'www', 'app', 'shared', 'auth', 'login', 'signup', 'settings', 'analytics'];
    if (reservedWords.includes(trimmedUrl)) {
      return "This URL is reserved and cannot be used";
    }
    
    return null;
  };

  const handleUrlChange = (value: string) => {
    setCustomUrl(value);
    setIsAvailable(null);
    
    if (checkTimeout) {
      clearTimeout(checkTimeout);
    }
    
    const validationError = validateCustomUrl(value);
    if (validationError) {
      return;
    }
    
    if (value.trim() === '' || value === profileData.custom_url) {
      setIsAvailable(null);
      return;
    }
    
    const newTimeout = setTimeout(async () => {
      setIsChecking(true);
      const available = await checkCustomUrlAvailability(value.trim().toLowerCase());
      setIsAvailable(available);
      setIsChecking(false);
    }, 500);
    
    setCheckTimeout(newTimeout);
  };

  const handleSave = async () => {
    if (!user) return;
    
    const trimmedUrl = customUrl.trim().toLowerCase();
    const validationError = validateCustomUrl(trimmedUrl);
    
    if (validationError) {
      toast.error(validationError);
      return;
    }
    
    if (trimmedUrl !== '' && isAvailable === false) {
      toast.error("This URL is not available");
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          custom_url: trimmedUrl === '' ? null : trimmedUrl,
          updated_at: new Date().toISOString() 
        })
        .eq('id', user.id);
      
      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error("This URL is already taken");
        } else {
          throw error;
        }
        return;
      }
      
      toast.success("Custom URL updated successfully");
      await fetchProfileData();
    } catch (error: any) {
      console.error("Error updating custom URL:", error);
      toast.error("Failed to update custom URL");
    } finally {
      setIsUpdating(false);
    }
  };

  const validationError = validateCustomUrl(customUrl);
  const hasChanges = customUrl.trim().toLowerCase() !== (profileData.custom_url || '');
  const canSave = hasChanges && !validationError && !isChecking && (customUrl.trim() === '' || isAvailable === true);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="custom-url">Custom URL</Label>
        <div className="mt-1 flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">clickly.it/</span>
          <Input
            id="custom-url"
            value={customUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="your-custom-url"
            className="flex-1"
          />
          {isChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {!isChecking && customUrl.trim() !== '' && customUrl !== profileData.custom_url && (
            <>
              {isAvailable === true && <Check className="h-4 w-4 text-green-500" />}
              {isAvailable === false && <AlertCircle className="h-4 w-4 text-red-500" />}
            </>
          )}
        </div>
        
        <div className="mt-2 space-y-1">
          {validationError && (
            <p className="text-sm text-red-500">{validationError}</p>
          )}
          {!validationError && customUrl.trim() !== '' && customUrl !== profileData.custom_url && (
            <>
              {isAvailable === true && (
                <p className="text-sm text-green-600">✓ This URL is available</p>
              )}
              {isAvailable === false && (
                <p className="text-sm text-red-600">✗ This URL is already taken</p>
              )}
            </>
          )}
          <p className="text-sm text-muted-foreground">
            Choose a unique URL for your portfolio. Leave empty to use the default sharing method.
          </p>
        </div>
      </div>
      
      <Button 
        onClick={handleSave}
        disabled={!canSave || isUpdating}
        className="w-full"
      >
        {isUpdating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <Check className="mr-2 h-4 w-4" />
            Update Custom URL
          </>
        )}
      </Button>
    </div>
  );
};

export default CustomUrlSettings;
