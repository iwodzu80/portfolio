
import React from "react";

const SharedPortfolioLoading = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-background shadow-sm border-b">
        <div className="container mx-auto py-4">
          <h1 className="text-xl font-semibold">Shared Portfolio</h1>
        </div>
      </div>
      
      <div className="flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    </div>
  );
};

export default SharedPortfolioLoading;
