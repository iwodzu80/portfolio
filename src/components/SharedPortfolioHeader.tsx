import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SharedPortfolioHeaderProps {
  ownerName?: string;
}

const SharedPortfolioHeader = ({ ownerName }: SharedPortfolioHeaderProps) => {
  return (
    <header className="border-b bg-card sticky top-0 z-50 mb-6">
      <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-3xl font-outfit font-bold bg-gradient-to-r from-portfolio-violet to-portfolio-celadon bg-clip-text text-transparent">
            clickly.it
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" className="text-foreground hover:text-primary gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};

export default SharedPortfolioHeader;
