
import React from "react";
import PortfolioAnalytics from "@/components/PortfolioAnalytics";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-portfolio-bg pb-12">
      <Toaster position="top-center" />
      <div className="container mx-auto pt-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Back to Portfolio
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Portfolio Analytics</h1>
          </div>
        </div>
        
        <PortfolioAnalytics />
      </div>
    </div>
  );
};

export default Analytics;
