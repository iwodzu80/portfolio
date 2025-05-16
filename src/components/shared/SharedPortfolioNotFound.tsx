
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, AlertCircle } from "lucide-react";

const SharedPortfolioNotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-background shadow-sm border-b">
        <div className="container mx-auto py-4">
          <h1 className="text-xl font-semibold">Shared Portfolio</h1>
        </div>
      </div>
      
      <div className="flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center p-6">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold">Portfolio Not Found</h2>
          <p className="text-muted-foreground">
            The portfolio you're looking for doesn't exist or the share link has been deactivated.
          </p>
          <Link to="/auth">
            <Button className="mt-4 flex items-center gap-2">
              <Home size={16} />
              Go to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SharedPortfolioNotFound;
