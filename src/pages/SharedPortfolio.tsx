
import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import ProfileSection from "@/components/ProfileSection";
import SectionContainer from "@/components/SectionContainer";
import { useSharedPortfolio } from "@/hooks/useSharedPortfolio";
import SharedPortfolioHeader from "@/components/SharedPortfolioHeader";
import SharedPortfolioNotFound from "@/components/SharedPortfolioNotFound";
import LoadingSpinner from "@/components/LoadingSpinner";
import { sanitizeText } from "@/utils/securityUtils";
import { supabase } from "@/integrations/supabase/client";

const SharedPortfolio = () => {
  const { shareId } = useParams();
  const { profileData, sections, isLoading, notFound, ownerName } = useSharedPortfolio(shareId);
  const analyticsRecorded = useRef(false);

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

    const sanitizedShareId = shareId ? sanitizeText(shareId.replace(/[^a-zA-Z0-9-]/g, '')) : null;
    
    document.title = sanitizedShareId 
      ? `Shared Portfolio: ${sanitizeText(ownerName || "")}`
      : "Shared Portfolio";
    
    if (!analyticsRecorded.current && sanitizedShareId && sanitizedShareId.length >= 8 && !/[^a-zA-Z0-9-]/.test(sanitizedShareId)) {
      analyticsRecorded.current = true;
      
      setTimeout(() => {
        const recordView = async () => {
          try {
            await supabase.rpc('record_portfolio_view', {
              p_share_id: sanitizedShareId,
              p_referrer: document.referrer || 'direct',
              p_user_agent: navigator.userAgent
            });
          } catch (err) {
            console.error("Analytics error:", err);
          }
        };
        
        recordView();
      }, 100);
    }

    // Cleanup function to remove the meta tag when component unmounts
    return () => {
      const robotsTagToRemove = document.querySelector('meta[name="robots"][content="noindex, nofollow, noarchive, nosnippet"]');
      if (robotsTagToRemove) {
        robotsTagToRemove.remove();
      }
    };
  }, [shareId, ownerName]);

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

  const hasValidSections = Array.isArray(sections) && sections.length > 0;
  
  return (
    <div className="min-h-screen bg-portfolio-bg pb-12">
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
