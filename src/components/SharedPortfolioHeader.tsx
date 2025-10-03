
import React from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SharedPortfolioHeaderProps {
  ownerName?: string;
}

const SharedPortfolioHeader = ({ ownerName }: SharedPortfolioHeaderProps) => {
  return (
    <div className="flex justify-end mb-6">
      <ThemeToggle />
    </div>
  );
};

export default SharedPortfolioHeader;
