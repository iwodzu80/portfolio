
import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Share2 } from "lucide-react";

const SharedPortfolioHeader = () => {
  return (
    <div className="flex items-center justify-between mb-6">
      <Link 
        to="/" 
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ChevronLeft size={18} className="mr-1" />
        <span className="text-sm">Back to Home</span>
      </Link>
      <div className="flex items-center gap-2 py-1 px-3 bg-gray-100 rounded-full">
        <Share2 size={14} className="text-gray-500" />
        <span className="text-sm text-gray-500">Shared Portfolio View</span>
      </div>
    </div>
  );
};

export default SharedPortfolioHeader;
