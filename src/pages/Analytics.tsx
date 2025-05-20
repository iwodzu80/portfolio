
import React from "react";
import PortfolioAnalytics from "@/components/PortfolioAnalytics";
import { Toaster } from "sonner";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-portfolio-bg pb-12">
      <Toaster position="top-center" />
      <div className="container mx-auto pt-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Portfolio Analytics</h1>
        </div>
        
        <PortfolioAnalytics />
      </div>
    </div>
  );
};

export default Analytics;
