
import React from "react";
import { Share2 } from "lucide-react";

interface SharedPortfolioHeaderProps {
  ownerName?: string;
}

const SharedPortfolioHeader = ({ ownerName }: SharedPortfolioHeaderProps) => {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end mb-6">
      <div className="flex items-center gap-2 py-1 px-3 bg-gray-100 rounded-full">
        <Share2 size={14} className="text-gray-500" />
        <span className="text-sm text-gray-500">
          {ownerName ? `${ownerName}'s Portfolio` : "Shared Portfolio View"}
        </span>
      </div>
    </div>
  );
};

export default SharedPortfolioHeader;
