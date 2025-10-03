
import React from "react";
import { Share2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SharedPortfolioHeaderProps {
  ownerName?: string;
}

const SharedPortfolioHeader = ({ ownerName }: SharedPortfolioHeaderProps) => {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
      <div className="flex items-center gap-2 py-1 px-3 bg-muted rounded-full">
        <Share2 size={14} className="text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {ownerName ? `${ownerName}'s Portfolio` : "Shared Portfolio View"}
        </span>
      </div>
      <ThemeToggle />
    </div>
  );
};

export default SharedPortfolioHeader;
