
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, LogOut, Settings as SettingsIcon, UserRound, BarChart3, EyeOff, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import SharePortfolioDialog from "@/components/SharePortfolioDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PortfolioHeaderProps {
  isEditingMode: boolean;
  setIsEditingMode: (value: boolean) => void;
}

const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({ 
  isEditingMode, 
  setIsEditingMode 
}) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [isPublic, setIsPublic] = useState(true);
  const [showEmail, setShowEmail] = useState(true);
  const [showPhone, setShowPhone] = useState(true);

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

  useEffect(() => {
    loadPrivacySettings();
  }, [user]);

  return (
    <header className="border-b bg-card sticky top-0 z-50 mb-6">
      <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-3xl font-outfit font-bold bg-gradient-to-r from-portfolio-violet to-portfolio-celadon bg-clip-text text-transparent">
            clickly.it
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <SharePortfolioDialog />
          <Button
            onClick={() => setIsEditingMode(!isEditingMode)}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isEditingMode ? (
              <>
                <Eye size={18} />
                View Mode
              </>
            ) : (
              <>
                <Pencil size={18} />
                Edit Mode
              </>
            )}
          </Button>
          <ThemeToggle />
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Shield size={18} />
                Privacy
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-3">Privacy Settings</h4>
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
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <UserRound size={18} />
                Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <SettingsIcon size={16} className="mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/analytics")}>
                <BarChart3 size={16} className="mr-2" />
                View Analytics
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut size={16} className="mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
};

export default PortfolioHeader;
