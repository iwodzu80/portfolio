
import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const SharedPortfolioHeader = () => {
  return (
    <div className="flex items-center mb-6">
      <Link 
        to="/" 
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ChevronLeft size={18} className="mr-1" />
        <span className="text-sm">Back to Home</span>
      </Link>
      <div className="flex-grow text-center text-sm text-gray-500">
        Shared Portfolio - Read Only
      </div>
    </div>
  );
};

export default SharedPortfolioHeader;
