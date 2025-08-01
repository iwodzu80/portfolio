
import React, { useState, Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import PortfolioHeader from "@/components/PortfolioHeader";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import LoadingSpinner from "@/components/LoadingSpinner";

// Lazy load heavy components with better error handling
const ProfileSection = lazy(() => 
  import("@/components/ProfileSection").then(module => ({
    default: module.default
  }))
);

const SectionContainer = lazy(() => 
  import("@/components/SectionContainer").then(module => ({
    default: module.default
  }))
);

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

// Error boundary for lazy loaded components
const LazyComponentErrorBoundary = ({ children, fallback }: { children: React.ReactNode, fallback: React.ReactNode }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

const Index = React.memo(() => {
  const [isEditingMode, setIsEditingMode] = useState(false);
  const { profileData, sections, isLoading, loadData } = usePortfolioData();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="container mx-auto pt-10">
        <div className="px-4">
          <PortfolioHeader 
            isEditingMode={isEditingMode} 
            setIsEditingMode={setIsEditingMode} 
          />
        </div>

        <LazyComponentErrorBoundary fallback={<ProfileSkeleton />}>
          <Suspense fallback={<ProfileSkeleton />}>
            <ProfileSection
              name={profileData.name}
              photo={profileData.photo}
              email={profileData.email}
              telephone={profileData.telephone}
              role={profileData.role}
              tagline={profileData.tagline}
              description={profileData.description}
              onUpdate={loadData}
              isEditingMode={isEditingMode}
            />
          </Suspense>
        </LazyComponentErrorBoundary>
        
        <div className="my-4 border-t border-gray-200 max-w-xl mx-auto" />
        
        <LazyComponentErrorBoundary fallback={<SectionSkeleton />}>
          <Suspense fallback={<SectionSkeleton />}>
            <SectionContainer
              sections={sections}
              onUpdate={loadData}
              isEditingMode={isEditingMode}
            />
          </Suspense>
        </LazyComponentErrorBoundary>
      </div>
    </div>
  );
});

Index.displayName = "Index";

export default Index;
