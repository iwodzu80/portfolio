import React, { useEffect, useRef, Suspense, lazy } from "react";
import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useSharedPortfolio } from "@/hooks/useSharedPortfolio";
import SharedPortfolioHeader from "@/components/SharedPortfolioHeader";
import SharedPortfolioNotFound from "@/components/SharedPortfolioNotFound";
import LoadingSpinner from "@/components/LoadingSpinner";
import { sanitizeText } from "@/utils/securityUtils";
import { supabase } from "@/integrations/supabase/client";

// Lazy load heavy components
const ProfileSection = lazy(() => import("@/components/ProfileSection"));
const SectionContainer = lazy(() => import("@/components/SectionContainer"));

const ProfileSkeleton = () => (
  <div className="max-w-xl mx-auto px-6 py-8">
    <div className="text-center space-y-4">
      <Skeleton className="h-24 w-24 rounded-full mx-auto" />
      <Skeleton className="h-6 w-48 mx-auto" />
      <Skeleton className="h-4 w-32 mx-auto" />
      <Skeleton className="h-16 w-full" />
    </div>
  </div>
);

const SectionSkeleton = () => (
  <div className="max-w-xl mx-auto px-6 space-y-6">
    <Skeleton className="h-8 w-48 mx-auto" />
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  </div>
);

const SharedPortfolio = React.memo(() => {
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
    
    // Record analytics with rate limiting (once per session per portfolio)
    if (!analyticsRecorded.current && sanitizedShareId && sanitizedShareId.length >= 3 && !/[^a-zA-Z0-9-]/.test(sanitizedShareId)) {
      const sessionKey = `portfolio_view_${sanitizedShareId}`;
      
      if (!sessionStorage.getItem(sessionKey)) {
        analyticsRecorded.current = true;
        sessionStorage.setItem(sessionKey, 'true');
        
        // Analytics recording will be implemented later with proper function
        console.log("Portfolio view recorded for shareId:", sanitizedShareId);
      }
    }

    // Cleanup function to remove the meta tag when component unmounts
    return () => {
      const robotsTagToRemove = document.querySelector('meta[name="robots"][content="noindex, nofollow, noarchive, nosnippet"]');
      if (robotsTagToRemove) {
        robotsTagToRemove.remove();
      }
    };
  }, [shareId, ownerName]);

  if (!shareId || shareId.length < 3 || /[^a-zA-Z0-9-]/.test(shareId)) {
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
    <div className="min-h-screen bg-background pb-12">
      <div className="container mx-auto pt-10 px-4">
        <SharedPortfolioHeader ownerName={ownerName} />

        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileSection
            name={profileData.name}
            photo={profileData.photo}
            email={profileData.email}
            telephone={profileData.telephone}
            role={profileData.role}
            tagline={profileData.tagline}
            description={profileData.description}
            social_links={profileData.social_links}
            show_email={profileData.show_email}
            show_phone={profileData.show_phone}
            onUpdate={() => {}}
            isEditingMode={false}
          />
        </Suspense>
        
        <div className="my-4 border-t border-border max-w-xl mx-auto" />
        
        {hasValidSections ? (
          <Suspense fallback={<SectionSkeleton />}>
            <SectionContainer
              sections={sections}
              onUpdate={() => {}}
              isEditingMode={false}
            />
          </Suspense>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No projects to display</p>
          </div>
        )}
      </div>
    </div>
  );
});

SharedPortfolio.displayName = "SharedPortfolio";

export default SharedPortfolio;
