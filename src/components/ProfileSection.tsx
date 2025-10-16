import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import EditableImage from "./EditableImage";
import EditableField from "./EditableField";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { SocialLink } from "@/types/portfolio";
import { 
  Mail, 
  Phone, 
  Copy, 
  Check, 
  Eye, 
  EyeOff,
  Linkedin,
  Github,
  Twitter,
  Globe,
  Plus,
  Trash2
} from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";

interface ProfileSectionProps {
  name: string;
  photo: string;
  email: string;
  telephone: string;
  role: string;
  tagline: string;
  description: string;
  social_links?: SocialLink[];
  is_public?: boolean;
  show_email?: boolean;
  show_phone?: boolean;
  onUpdate: () => void;
  isEditingMode?: boolean;
  isLoading?: boolean;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  name,
  photo,
  email,
  telephone,
  role,
  tagline,
  description,
  social_links = [],
  is_public = true,
  show_email = true,
  show_phone = true,
  onUpdate,
  isEditingMode = true,
  isLoading = false
}) => {
  const { user } = useAuth();
  const [localState, setLocalState] = useState({
    name,
    photo,
    email,
    telephone,
    role,
    tagline,
    description,
    social_links,
    is_public,
    show_email,
    show_phone
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Update local state when props change (e.g., on initial load)
  useEffect(() => {
    setLocalState({
      name,
      photo,
      email,
      telephone,
      role,
      tagline,
      description,
      social_links,
      is_public,
      show_email,
      show_phone
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, photo, email, telephone, role, tagline, description, JSON.stringify(social_links), is_public, show_email, show_phone]);
  
  // Set document title when name changes
  useEffect(() => {
    if (localState.name) {
      document.title = `${localState.name}'s Portfolio`;
    } else {
      document.title = "Portfolio";
    }
  }, [localState.name]);

  const handleProfileUpdate = async (field: string, value: string | boolean | SocialLink[]) => {
    if (!user) {
      toast.error("You must be logged in to update your profile");
      return;
    }
    
    // Update local state immediately for a responsive UI
    setLocalState(prevState => ({
      ...prevState,
      [field]: value
    }));
    
    try {
      console.log(`Updating profile field ${field} for user ${user.id} with value:`, value);
      
      // Check if profile exists first
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking profile existence:", checkError);
        throw checkError;
      }
      
      let error;
      
      if (!existingProfile) {
        // Create profile if it doesn't exist
        console.log("Profile doesn't exist, creating new profile");
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email,
            [field === 'photo' ? 'photo_url' : field === 'telephone' ? 'phone' : field]: value
          });
        error = insertError;
        
        if (!insertError) {
          console.log("Profile created successfully with field:", field);
        }
      } else {
        // Update existing profile
        console.log("Profile exists, updating field:", field);
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            [field === 'photo' ? 'photo_url' : field === 'telephone' ? 'phone' : field]: value,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        error = updateError;
        
        if (!updateError) {
          console.log("Profile updated successfully with field:", field);
        }
      }
        
      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }
      
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')} updated successfully`);
      
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(`Error updating profile: ${error.message}`);
      
      // Revert local state on error
      setLocalState({
        name,
        photo,
        email,
        telephone,
        role,
        tagline,
        description,
        social_links,
        is_public,
        show_email,
        show_phone
      });
    }
  };

  const handleCopyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const handleAddSocialLink = () => {
    const newLink: SocialLink = {
      id: crypto.randomUUID(),
      platform: "",
      url: "",
      customName: ""
    };
    const updatedLinks = [...localState.social_links, newLink];
    handleProfileUpdate("social_links", updatedLinks);
  };

  const handleUpdateSocialLink = (id: string, field: 'platform' | 'url' | 'customName', value: string) => {
    const updatedLinks = localState.social_links.map(link =>
      link.id === id ? { ...link, [field]: value } : link
    );
    handleProfileUpdate("social_links", updatedLinks);
  };

  const handleDeleteSocialLink = (id: string) => {
    const updatedLinks = localState.social_links.filter(link => link.id !== id);
    handleProfileUpdate("social_links", updatedLinks);
  };

  const getSocialIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    if (platformLower === 'linkedin') return <Linkedin className="w-5 h-5" />;
    if (platformLower === 'github') return <Github className="w-5 h-5" />;
    if (platformLower === 'twitter') return <Twitter className="w-5 h-5" />;
    return <Globe className="w-5 h-5" />;
  };

  const getSocialDisplayName = (link: SocialLink) => {
    if (link.platform === 'other') {
      return link.customName || 'Other';
    }
    return link.platform.charAt(0).toUpperCase() + link.platform.slice(1);
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="flex flex-col items-center max-w-xl mx-auto mb-6 p-6">
        <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full" />
        <div className="mt-6 w-full text-center space-y-3">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-6 w-32 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-4 w-40 mx-auto" />
          <Skeleton className="h-20 w-full mx-auto mt-4" />
        </div>
      </section>
    );
  }

  // Read-only mode
  if (!isEditingMode) {
    return (
      <section className="flex flex-col items-center max-w-xl mx-auto mb-6 p-6">
        {localState.photo && (
          <img
            src={localState.photo}
            alt={localState.name}
            className="w-32 h-32 md:w-40 md:h-40 shadow-md border-4 border-border rounded-full object-cover"
          />
        )}
        
        <div className="mt-6 w-full text-center">
          <h1 className="font-bold text-2xl md:text-3xl mb-2 text-foreground">{localState.name || "Your Name"}</h1>
          {localState.role && <p className="text-primary text-lg mb-2">{localState.role}</p>}
          {localState.tagline && <p className="text-muted-foreground mb-4 max-w-prose mx-auto text-center">{localState.tagline}</p>}
          
          <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground mb-4 flex-wrap">
            {localState.email && (
              <a href={`mailto:${localState.email}`} className="text-primary hover:underline inline-flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {localState.email}
              </a>
            )}
            {localState.email && localState.telephone && <span className="inline-flex items-center">•</span>}
            {localState.telephone && (
              <a href={`tel:${localState.telephone}`} className="hover:underline inline-flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {localState.telephone}
              </a>
            )}
          </div>

          {localState.social_links && localState.social_links.length > 0 && (
            <div className="flex justify-center gap-3 mb-4">
              {localState.social_links.filter(link => link.platform && link.url).map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title={getSocialDisplayName(link)}
                >
                  {getSocialIcon(link.platform)}
                </a>
              ))}
            </div>
          )}
          
          {localState.description && (
            <p className="text-muted-foreground mt-4 max-w-prose mx-auto text-justify">{localState.description}</p>
          )}
        </div>
      </section>
    );
  }

  // Edit mode
  return (
    <section className="flex flex-col items-center max-w-xl mx-auto mb-6 p-6">

      <EditableImage
        src={localState.photo}
        alt={localState.name}
        onChange={(value) => handleProfileUpdate("photo", value)}
        className="w-32 h-32 md:w-40 md:h-40 shadow-md border-4 border-border"
      />
      
      <div className="mt-6 w-full text-center">
        <EditableField
          value={localState.name}
          onChange={(value) => handleProfileUpdate("name", value)}
          tag="h1"
          className="font-bold text-2xl md:text-3xl mb-2 text-foreground"
          placeholder="Your Name"
        />
        
        <EditableField
          value={localState.role}
          onChange={(value) => handleProfileUpdate("role", value)}
          tag="p"
          className="text-primary text-lg mb-2"
          placeholder="Your Role"
        />
        
        <EditableField
          value={localState.tagline}
          onChange={(value) => handleProfileUpdate("tagline", value)}
          tag="p"
          className="text-muted-foreground mb-4 max-w-prose mx-auto text-center"
          placeholder="Your tagline"
          multiline
        />
        
        <div className="flex justify-center items-center text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <EditableField
              value={localState.email}
              onChange={(value) => handleProfileUpdate("email", value)}
              tag="span"
              placeholder="Email"
              className="text-primary"
            />
            {localState.email && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleCopyToClipboard(localState.email, 'email')}
                >
                  {copiedField === 'email' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleProfileUpdate("show_email", !localState.show_email)}
                  title={localState.show_email ? "Hide email on shared page" : "Show email on shared page"}
                >
                  {localState.show_email ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </Button>
              </>
            )}
          </div>
          <span className="mx-1 flex-shrink-0 inline-flex items-center">•</span>
          <div className="flex items-center gap-1">
            <EditableField
              value={localState.telephone}
              onChange={(value) => handleProfileUpdate("telephone", value)}
              tag="span"
              placeholder="Telephone"
            />
            {localState.telephone && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleCopyToClipboard(localState.telephone, 'telephone')}
                >
                  {copiedField === 'telephone' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleProfileUpdate("show_phone", !localState.show_phone)}
                  title={localState.show_phone ? "Hide phone on shared page" : "Show phone on shared page"}
                >
                  {localState.show_phone ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Social Links Section */}
        <div className="mt-6 mb-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <h3 className="text-sm font-medium text-foreground">Social Links</h3>
            <Button
              onClick={handleAddSocialLink}
              variant="outline"
              size="sm"
              className="h-7 px-2"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          
          {localState.social_links && localState.social_links.length > 0 && (
            <div className="space-y-2">
              {localState.social_links.map(link => (
                <div key={link.id} className="flex gap-2 items-center justify-center flex-wrap">
                  <Select
                    value={link.platform}
                    onValueChange={(value) => handleUpdateSocialLink(link.id, 'platform', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="github">GitHub</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {link.platform === 'other' && (
                    <Input
                      type="text"
                      value={link.customName || ''}
                      onChange={(e) => handleUpdateSocialLink(link.id, 'customName', e.target.value)}
                      placeholder="Custom name"
                      className="w-32 h-9"
                    />
                  )}
                  
                  <Input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleUpdateSocialLink(link.id, 'url', e.target.value)}
                    placeholder="https://..."
                    className="flex-1 max-w-xs h-9"
                  />
                  
                  <Button
                    onClick={() => handleDeleteSocialLink(link.id)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <EditableField
          value={localState.description}
          onChange={(value) => handleProfileUpdate("description", value)}
          tag="p"
          className="text-muted-foreground mt-4 max-w-prose mx-auto text-justify"
          placeholder="Add a brief description about yourself..."
          multiline
        />
      </div>
    </section>
  );
};

export default ProfileSection;