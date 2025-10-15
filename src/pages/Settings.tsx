import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "sonner";
import { ArrowLeft, Check, Loader2, Copy, Link as LinkIcon } from "lucide-react";
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

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const shareSlugSchema = z.object({
  slug: z.string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be less than 50 characters")
    .regex(/^[a-zA-Z0-9-_]+$/, "Slug can only contain letters, numbers, hyphens, and underscores")
    .transform(val => val.toLowerCase()),
});

const Settings = () => {
  const { user } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentSlug, setCurrentSlug] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [isUpdatingSlug, setIsUpdatingSlug] = useState(false);
  
  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const slugForm = useForm<z.infer<typeof shareSlugSchema>>({
    resolver: zodResolver(shareSlugSchema),
    defaultValues: {
      slug: "",
    },
  });

  const getBaseUrl = () => {
    const currentOrigin = window.location.origin;
    if (currentOrigin.includes('lovable.app') || currentOrigin.includes('id-preview')) {
      return currentOrigin;
    }
    if (currentOrigin.includes('clickly.it')) {
      return 'https://clickly.it';
    }
    return currentOrigin;
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

  useEffect(() => {
    loadShareData();
  }, [user]);

  const handleSlugUpdate = async (values: z.infer<typeof shareSlugSchema>) => {
    if (!user) return;

    try {
      setIsUpdatingSlug(true);

      // Check if slug is already taken
      const { data: existingSlug } = await supabase
        .from('portfolio_shares')
        .select('user_id')
        .eq('share_id', values.slug)
        .maybeSingle();

      if (existingSlug && existingSlug.user_id !== user.id) {
        toast.error("This slug is already taken. Please choose another one.");
        return;
      }

      // Check if user already has a share record
      const { data: existingShare } = await supabase
        .from('portfolio_shares')
        .select('share_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingShare) {
        // Update existing record
        const { error } = await supabase
          .from('portfolio_shares')
          .update({ 
            share_id: values.slug,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new record
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success("Share link copied to clipboard");
    } catch (error) {
      const textArea = document.createElement("textarea");
      textArea.value = shareLink;
      document.body.appendChild(textArea);
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

  const handlePasswordChange = async (values: z.infer<typeof passwordSchema>) => {
    try {
      setIsChangingPassword(true);
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: values.currentPassword,
      });
      
      if (signInError) {
        toast.error("Current password is incorrect");
        return;
      }
      
      const { error: updateError } = await supabase.auth.updateUser({ 
        password: values.newPassword 
      });
      
      if (updateError) {
        toast.error(updateError.message);
        return;
      }
      
      toast.success("Password updated successfully");
      form.reset();
    } catch (error: any) {
      toast.error(`Error changing password: ${error.message}`);
    } finally {
      setIsChangingPassword(false);
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
          <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
          
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-500">Email</span>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
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

            {currentSlug && shareLink && (
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
                {isActive && (
                  <p className="text-xs text-green-600 mt-2">✓ Share link is active</p>
                )}
              </div>
            )}
          </div>
          
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handlePasswordChange)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter current password"
                          type="password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter new password"
                          type="password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Confirm new password"
                          type="password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="mt-2"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;