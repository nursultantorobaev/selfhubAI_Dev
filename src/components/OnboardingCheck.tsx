import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Not logged in, show children
      setCheckingOnboarding(false);
      return;
    }

    // Check if onboarding is completed
    // If profile doesn't have onboarding_completed field, assume not completed (for backward compatibility)
    const onboardingCompleted = profile?.onboarding_completed ?? false;

    if (!onboardingCompleted) {
      // Only show customer onboarding for non-business owners
      // Business owners will complete onboarding through business setup
      if (!profile?.is_business_owner) {
        setShowOnboarding(true);
      }
    }

    setCheckingOnboarding(false);
  }, [user, profile, loading]);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    await refreshProfile();
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

