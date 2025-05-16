
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SharedPortfolioHeader = () => {
  return (
    <div className="bg-background shadow-sm border-b">
      <div className="container mx-auto py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold">Shared Portfolio</h1>
          <div className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            Read only
          </div>
        </div>
        <Link to="/auth">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Sign in
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SharedPortfolioHeader;
