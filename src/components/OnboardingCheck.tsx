import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { CustomerOnboarding } from "./CustomerOnboarding";
import { Skeleton } from "@/components/ui/skeleton";

interface OnboardingCheckProps {
  children: React.ReactNode;
  onOnboardingComplete?: () => void;
}

/**
 * Component that checks if user has completed onboarding
 * Shows onboarding flow if not completed
 */
export const OnboardingCheck = ({ children, onOnboardingComplete }: OnboardingCheckProps) => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const { hasBusiness, isLoading: businessLoading } = useBusinessProfile();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (loading || businessLoading) return;

    if (!user) {
      // Not logged in, show children
      setCheckingOnboarding(false);
      setShowOnboarding(false);
      return;
    }

    // Check if user is a business owner (by metadata, profile flag, or by having a business profile)
    const userRole = user.user_metadata?.user_role;
    const isBusinessOwner = profile?.is_business_owner || hasBusiness || userRole === "business";

    // Business owners can also be customers, but they don't need customer onboarding
    // They can browse and book services without onboarding
    if (isBusinessOwner) {
      setCheckingOnboarding(false);
      setShowOnboarding(false);
      return;
    }

    // Check if onboarding is completed
    // Check both profile table (if columns exist) and user metadata (fallback)
    const profileOnboardingCompleted = profile?.onboarding_completed ?? false;
    const metadataOnboardingCompleted = user.user_metadata?.customer_onboarding_completed === true;
    const onboardingCompleted = profileOnboardingCompleted || metadataOnboardingCompleted;

    // IMPORTANT: If showOnboarding is already false (set by handleOnboardingComplete),
    // don't override it back to true
    if (onboardingCompleted) {
      // Onboarding is completed, make sure we don't show it
      setShowOnboarding(false);
      setCheckingOnboarding(false);
    } else if (!showOnboarding) {
      // Only show onboarding if it's not already hidden
      // This prevents re-showing after handleOnboardingComplete sets it to false
      setShowOnboarding(true);
    }

    setCheckingOnboarding(false);
  }, [user, user?.user_metadata, profile, loading, hasBusiness, businessLoading, showOnboarding]);

  const handleOnboardingComplete = async () => {
    // CRITICAL: Immediately hide onboarding UI FIRST
    // This prevents the stuck screen
    setShowOnboarding(false);
    setCheckingOnboarding(false);
    
    // Force a re-render by updating state
    // This ensures the component shows children instead of onboarding
    
    // Refresh profile to get latest data (async, don't wait)
    refreshProfile().catch(console.error);
    
    // Call optional callback
    onOnboardingComplete?.();
  };

  // Show loading state while checking
  if (checkingOnboarding || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md p-6">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  // Show onboarding if needed
  if (showOnboarding && !profile?.is_business_owner) {
    return <CustomerOnboarding onComplete={handleOnboardingComplete} />;
  }

  // Show children (normal app content)
  return <>{children}</>;
};

