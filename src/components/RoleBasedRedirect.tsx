import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Component that redirects users based on their role after sign-in
 */
export const RoleBasedRedirect = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    if (!user) {
      // Not logged in, redirect to home
      navigate("/");
      return;
    }

    // Check user role and redirect accordingly
    if (profile?.is_business_owner) {
      // Business owner - redirect to business dashboard
      navigate("/business/dashboard");
    } else {
      // Customer - redirect to customer home or main search page
      navigate("/customer/home");
    }
  }, [user, profile, loading, navigate]);

  // Show loading state while determining redirect
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="space-y-4 w-full max-w-md p-6">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
};

