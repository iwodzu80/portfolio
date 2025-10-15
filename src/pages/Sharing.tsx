import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "sonner";
import { ArrowLeft, Check, Loader2, Copy, Link as LinkIcon, Eye, EyeOff, RotateCw } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const shareSlugSchema = z.object({
  slug: z.string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be less than 50 characters")
    .regex(/^[a-zA-Z0-9-_]+$/, "Slug can only contain letters, numbers, hyphens, and underscores")
    .transform(val => val.toLowerCase()),
});

const Sharing = () => {
  const { user } = useAuth();
  const [currentSlug, setCurrentSlug] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [isUpdatingSlug, setIsUpdatingSlug] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [showEmail, setShowEmail] = useState(true);
  const [showPhone, setShowPhone] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [shareId, setShareId] = useState("");

  const slugForm = useForm<z.infer<typeof shareSlugSchema>>({
    resolver: zodResolver(shareSlugSchema),
    defaultValues: {
      slug: "",
    },
  });

  const getBaseUrl = () => {
    const hostname = window.location.hostname;
    if (hostname === 'clickly.it' || hostname === 'www.clickly.it') {
      return 'https://clickly.it';
    }
    return window.location.origin;
  };

  const loadShareData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('portfolio_shares')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setCurrentSlug(data.share_id);
        setShareId(data.share_id);
        setIsActive(data.is_active);
        slugForm.setValue('slug', data.share_id);
        const baseUrl = getBaseUrl();
        setShareLink(`${baseUrl}/shared/${data.share_id}`);
      }
    } catch (error: any) {
      console.error("Error fetching share data:", error);
      toast.error("Failed to load sharing settings");
    }
  };

  const loadPrivacySettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_public, show_email, show_phone')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setIsPublic(data.is_public ?? true);
        setShowEmail(data.show_email ?? true);
        setShowPhone(data.show_phone ?? true);
      }
    } catch (error: any) {
      console.error("Error fetching privacy settings:", error);
    }
  };

  useEffect(() => {
    loadShareData();
    loadPrivacySettings();
  }, [user]);

  const handleSlugUpdate = async (values: z.infer<typeof shareSlugSchema>) => {
    if (!user) return;

    try {
      setIsUpdatingSlug(true);

      const { data: existingSlug } = await supabase
        .from('portfolio_shares')
        .select('user_id')
        .eq('share_id', values.slug)
        .maybeSingle();

      if (existingSlug && existingSlug.user_id !== user.id) {
        toast.error("This slug is already taken. Please choose another one.");
        return;
      }

      const { data: existingShare } = await supabase
        .from('portfolio_shares')
        .select('share_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingShare) {
        const { error } = await supabase
          .from('portfolio_shares')
          .update({ 
            share_id: values.slug,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('portfolio_shares')
          .insert({
            user_id: user.id,
            share_id: values.slug,
            is_active: true
          });

        if (error) throw error;
      }

      setCurrentSlug(values.slug);
      setShareId(values.slug);
      const baseUrl = getBaseUrl();
      setShareLink(`${baseUrl}/shared/${values.slug}`);
      setIsActive(true);
      toast.success("Share link updated successfully");
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error("This slug is already taken. Please choose another one.");
      } else {
        toast.error("Failed to update share link");
      }
    } finally {
      setIsUpdatingSlug(false);
    }
  };

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
        newShareId = crypto.randomUUID();
        
        try {
          const { data: existingShare } = await supabase
            .from('portfolio_shares')
            .select('share_id')
            .eq('user_id', user.id)
            .maybeSingle();
          
          let error;
          
          if (existingShare) {
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
            if (error.code === '23505' && error.message.includes('portfolio_shares_share_id_unique')) {
              continue;
            } else {
              throw error;
            }
          }
          
          success = true;
        } catch (retryError: any) {
          if (retryError.code === '23505' && retryError.message.includes('portfolio_shares_share_id_unique')) {
            continue;
          } else {
            throw retryError;
          }
        }
      }
      
      if (!success) {
        throw new Error(`Failed to generate unique share ID after ${MAX_RETRIES} attempts`);
      }
      
      setShareId(newShareId);
      setCurrentSlug(newShareId);
      slugForm.setValue('slug', newShareId);
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
        
      if (error) throw error;
      
      setIsActive(active);
      toast.success(active ? "Share link activated" : "Share link deactivated");
    } catch (error: any) {
      console.error("Error toggling share status:", error);
      toast.error("Failed to update sharing status");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrivacySetting = async (field: string, value: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          [field]: value,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Privacy setting updated");
    } catch (error: any) {
      console.error("Error updating privacy setting:", error);
      toast.error("Failed to update privacy setting");
    }
  };

  const handlePrivacyToggle = async (field: 'is_public' | 'show_email' | 'show_phone', currentValue: boolean) => {
    const newValue = !currentValue;
    
    if (field === 'is_public') {
      setIsPublic(newValue);
    } else if (field === 'show_email') {
      setShowEmail(newValue);
    } else if (field === 'show_phone') {
      setShowPhone(newValue);
    }
    
    await updatePrivacySetting(field, newValue);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success("Share link copied to clipboard");
    } catch (error) {
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
    <div className="min-h-screen bg-portfolio-bg pb-12">
      <Toaster position="top-center" />
      <div className="container mx-auto pt-10 px-4">
        <div className="mb-8">
          <Link to="/dashboard" className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Portfolio
          </Link>
        </div>
        
        <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold mb-6">Sharing Settings</h1>
          
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Share Link Status</h2>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="share-active">Share Link Active</Label>
                    <p className="text-xs text-muted-foreground">
                      {isActive ? "Portfolio is publicly accessible" : "Share link disabled"}
                    </p>
                  </div>
                  <Switch
                    id="share-active"
                    checked={isActive}
                    onCheckedChange={toggleShareActive}
                    disabled={!shareId || isLoading}
                  />
                </div>
                
                {shareId && shareLink && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <LinkIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm font-mono truncate">{shareLink}</span>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={copyToClipboard}
                        className="ml-2 flex-shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                <Button 
                  variant="secondary" 
                  onClick={generateNewShareId} 
                  disabled={isLoading}
                  className="w-full flex items-center justify-center"
                  size="sm"
                >
                  <RotateCw size={16} className="mr-2" />
                  {shareId ? "Generate New Link" : "Create Share Link"}
                </Button>
              </div>
            )}
          </div>

          <div className="border-t pt-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Custom Share Link</h2>
            <p className="text-sm text-gray-500 mb-4">
              Create a memorable, custom link to share your portfolio
            </p>
            
            <Form {...slugForm}>
              <form onSubmit={slugForm.handleSubmit(handleSlugUpdate)} className="space-y-4">
                <FormField
                  control={slugForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Slug</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 flex items-center">
                            <span className="text-sm text-gray-500 mr-1">
                              {getBaseUrl()}/shared/
                            </span>
                            <Input 
                              placeholder="your-name"
                              {...field} 
                            />
                          </div>
                          <Button 
                            type="submit" 
                            disabled={isUpdatingSlug || !field.value}
                          >
                            {isUpdatingSlug ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Update
                              </>
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Use letters, numbers, hyphens, and underscores (3-50 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Privacy Settings</h2>
            <div className="space-y-1">
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-accent rounded-md px-3 py-2.5 transition-colors group"
                onClick={() => handlePrivacyToggle('is_public', isPublic)}
              >
                <span className="text-sm font-medium">Portfolio Visibility</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${isPublic ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}>
                    {isPublic ? 'Public' : 'Private'}
                  </span>
                  {isPublic ? (
                    <Eye size={16} className="text-green-600 dark:text-green-500" />
                  ) : (
                    <EyeOff size={16} className="text-muted-foreground" />
                  )}
                </div>
              </div>
              
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-accent rounded-md px-3 py-2.5 transition-colors group"
                onClick={() => handlePrivacyToggle('show_email', showEmail)}
              >
                <span className="text-sm font-medium">Email on Shared Page</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${showEmail ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}>
                    {showEmail ? 'Visible' : 'Hidden'}
                  </span>
                  {showEmail ? (
                    <Eye size={16} className="text-green-600 dark:text-green-500" />
                  ) : (
                    <EyeOff size={16} className="text-muted-foreground" />
                  )}
                </div>
              </div>
              
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-accent rounded-md px-3 py-2.5 transition-colors group"
                onClick={() => handlePrivacyToggle('show_phone', showPhone)}
              >
                <span className="text-sm font-medium">Phone on Shared Page</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${showPhone ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}>
                    {showPhone ? 'Visible' : 'Hidden'}
                  </span>
                  {showPhone ? (
                    <Eye size={16} className="text-green-600 dark:text-green-500" />
                  ) : (
                    <EyeOff size={16} className="text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sharing;
