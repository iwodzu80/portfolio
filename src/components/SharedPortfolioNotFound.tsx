
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FileX, ArrowLeft } from "lucide-react";

const SharedPortfolioNotFound = () => {
  useEffect(() => {
    // Add meta robots tag to prevent indexing
    const existingRobotsTag = document.querySelector('meta[name="robots"]');
    if (existingRobotsTag) {
      existingRobotsTag.remove();
    }
    
    const robotsTag = document.createElement('meta');
    robotsTag.name = 'robots';
    robotsTag.content = 'noindex, nofollow, noarchive, nosnippet';
    document.head.appendChild(robotsTag);

    // Cleanup function to remove the meta tag when component unmounts
    return () => {
      const robotsTagToRemove = document.querySelector('meta[name="robots"][content="noindex, nofollow, noarchive, nosnippet"]');
      if (robotsTagToRemove) {
        robotsTagToRemove.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-red-50 p-4 rounded-full mb-4">
        <FileX size={40} className="text-red-400" />
      </div>
      <h1 className="text-2xl font-bold mb-4">Portfolio Not Found</h1>
      <p className="mb-6 text-muted-foreground">This shared portfolio doesn't exist or has been deactivated.</p>
      <Link 
        to="/"
        className="flex items-center gap-2 text-portfolio-blue hover:underline"
      >
        <ArrowLeft size={16} />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};

export default SharedPortfolioNotFound;
