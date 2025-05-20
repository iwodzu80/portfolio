
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, LogOut, Settings as SettingsIcon, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import SharePortfolioDialog from "@/components/SharePortfolioDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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

  return (
    <div className="flex justify-between mb-4">
      <div>
        <SharePortfolioDialog />
      </div>
      <div className="flex gap-2">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <UserRound size={18} />
              Account
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <SettingsIcon size={16} className="mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOut size={16} className="mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default PortfolioHeader;
