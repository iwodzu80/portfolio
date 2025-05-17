
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, LogOut, Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import SharePortfolioDialog from "@/components/SharePortfolioDialog";

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
          onClick={() => navigate("/settings")}
          variant="outline"
          className="flex items-center gap-2"
        >
          <SettingsIcon size={18} />
          Settings
        </Button>
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
        <Button 
          onClick={signOut}
          variant="outline"
          className="flex items-center gap-2"
        >
          <LogOut size={18} />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default PortfolioHeader;
