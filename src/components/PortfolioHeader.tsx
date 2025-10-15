
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, LogOut, Settings as SettingsIcon, UserRound, BarChart3, Monitor, Share2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

interface PortfolioHeaderProps {
  isEditingMode: boolean;
  setIsEditingMode: (value: boolean) => void;
}

const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({ 
  isEditingMode, 
  setIsEditingMode 
}) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b bg-card sticky top-0 z-50 mb-6">
      <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-3xl font-outfit font-bold bg-gradient-to-r from-portfolio-violet to-portfolio-celadon bg-clip-text text-transparent">
            clickly.it
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsEditingMode(!isEditingMode)}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isEditingMode ? (
              <>
                <Eye size={18} />
                View
              </>
            ) : (
              <>
                <Pencil size={18} />
                Edit
              </>
            )}
          </Button>
          
          <Button
            onClick={() => navigate("/sharing")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Share2 size={18} />
            Share
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <UserRound size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Monitor size={16} className="mr-2" />
                  Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}>
                    <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
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
