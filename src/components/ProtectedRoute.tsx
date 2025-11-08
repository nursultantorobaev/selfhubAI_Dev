import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireBusiness?: boolean;
  requireCustomer?: boolean;
};

/**
 * Protected route component that checks authentication and role
 */
export const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireBusiness = false,
  requireCustomer = false,
}: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md p-6">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  // Require authentication
  if (requireAuth && !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Require business owner role
  // Check user role from metadata (set during signup) or profile flag (set when business is created)
  const userRole = user?.user_metadata?.user_role;
  const isBusinessOwner = profile?.is_business_owner || userRole === "business";
  
  if (requireBusiness && !isBusinessOwner) {
    // Redirect to customer home if they're a customer, otherwise to home
    if (user && !isBusinessOwner) {
      return <Navigate to="/customer/home" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Require customer role (not business owner)
  if (requireCustomer && isBusinessOwner) {
    // Redirect to business dashboard if they're a business owner
    return <Navigate to="/business/dashboard" replace />;
  }

  return <>{children}</>;
};

