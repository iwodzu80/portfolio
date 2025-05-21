
import React, { useEffect, useRef } from "react";
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
  const analyticsRecorded = useRef(false);

  useEffect(() => {
    // Sanitize any data from URL params for extra security
    const sanitizedShareId = shareId ? sanitizeText(shareId.replace(/[^a-zA-Z0-9-]/g, '')) : null;
    
    // Set page title
    document.title = sanitizedShareId 
      ? `Shared Portfolio: ${sanitizeText(ownerName || "")}`
      : "Shared Portfolio";
    
    // Only record analytics once per page visit
    if (!analyticsRecorded.current && sanitizedShareId && sanitizedShareId.length >= 8 && !/[^a-zA-Z0-9-]/.test(sanitizedShareId)) {
      analyticsRecorded.current = true;
      
      // Use non-blocking approach for analytics
      setTimeout(() => {
        // Record view completely in the background without affecting UI
        supabase.rpc('record_portfolio_view', {
          p_share_id: sanitizedShareId,
          p_referrer: document.referrer || 'direct',
          p_user_agent: navigator.userAgent
        }).catch(err => {
          // Silent fail for analytics - log but don't impact user experience
          console.error("Analytics error:", err);
        });
      }, 100); // Small delay to prioritize UI rendering
    }
  }, [shareId, ownerName]);

  // Security check - if shareId is clearly invalid, show not found immediately
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
          role={profileData.role}
          tagline={profileData.tagline}
          description={profileData.description}
          onUpdate={() => {}}
          isEditingMode={false}
        />
        
        <div className="my-4 border-t border-gray-200 max-w-xl mx-auto" />
        
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
