
import React from "react";

const SharedPortfolioNotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Portfolio Not Found</h1>
      <p className="mb-6 text-muted-foreground">This shared portfolio doesn't exist or has been deactivated.</p>
    </div>
  );
};

export default SharedPortfolioNotFound;
