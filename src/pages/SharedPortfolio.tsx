
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import ProfileSection from "@/components/ProfileSection";
import SectionContainer from "@/components/SectionContainer";
import { useSharedPortfolio } from "@/hooks/useSharedPortfolio";
import SharedPortfolioHeader from "@/components/SharedPortfolioHeader";
import SharedPortfolioNotFound from "@/components/SharedPortfolioNotFound";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Toaster } from "sonner";
import { sanitizeText } from "@/utils/securityUtils";
import { supabase } from "@/integrations/supabase/client";

const SharedPortfolio = () => {
  const { shareId } = useParams();
  const { profileData, sections, isLoading, notFound, ownerName } = useSharedPortfolio(shareId);

  useEffect(() => {
    // Sanitize any data from URL params for extra security
    const sanitizedShareId = shareId ? sanitizeText(shareId.replace(/[^a-zA-Z0-9-]/g, '')) : null;
    
    console.log("SharedPortfolio component with shareId:", sanitizedShareId);
    
    // Set a security-focused CSP header for this page
    // Note: This won't work in React directly - just educational
    // You should configure this at the server level
    document.title = sanitizedShareId 
      ? `Shared Portfolio: ${sanitizeText(ownerName)}`
      : "Shared Portfolio";
    
    // Record analytics for this portfolio view
    const recordAnalytics = async () => {
      if (sanitizedShareId) {
        try {
          // Record the view using a direct RPC call instead of typed table access
          // This bypasses the TypeScript type checking for tables
          await supabase.rpc('record_portfolio_view', {
            p_share_id: sanitizedShareId,
            p_referrer: document.referrer || 'direct',
            p_user_agent: navigator.userAgent
          });
            
          console.log("Portfolio view recorded successfully");
        } catch (error) {
          console.error("Failed to record portfolio view:", error);
          // Don't show error to user - analytics should be silent
        }
      }
    };
    
    // Only record analytics if we have a valid shareId
    if (sanitizedShareId && sanitizedShareId.length >= 8 && !/[^a-zA-Z0-9-]/.test(sanitizedShareId)) {
      recordAnalytics();
    }
    
  }, [shareId, ownerName]);

  // Security check - if shareId is clearly invalid, show not found
  if (!shareId || shareId.length < 8 || /[^a-zA-Z0-9-]/.test(shareId)) {
    return <SharedPortfolioNotFound />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (notFound) {
    return <SharedPortfolioNotFound />;
  }

  // Check if sections is properly initialized
  const hasValidSections = Array.isArray(sections) && sections.length > 0;
  
  return (
    <div className="min-h-screen bg-portfolio-bg pb-12">
      <Toaster position="top-center" />
      <div className="container mx-auto pt-10 px-4">
        <SharedPortfolioHeader ownerName={ownerName} />

        <ProfileSection
          name={profileData.name}
          photo={profileData.photo}
          email={profileData.email}
          telephone={profileData.telephone}
          tagline={profileData.tagline}
          onUpdate={() => {}}
          isEditingMode={false}
        />
        
        <div className="my-6 border-t border-gray-200 max-w-md mx-auto" />
        
        {hasValidSections ? (
          <SectionContainer
            sections={sections}
            onUpdate={() => {}}
            isEditingMode={false}
          />
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No projects to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedPortfolio;
