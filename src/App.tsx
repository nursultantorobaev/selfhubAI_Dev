import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleBasedRedirect } from "@/components/RoleBasedRedirect";
import Index from "./pages/Index";
import BusinessDetail from "./pages/BusinessDetail";
import Dashboard from "./pages/Dashboard";
import CustomerHome from "./pages/CustomerHome";
import CustomerDashboard from "./pages/CustomerDashboard";
import Calendar from "./pages/Calendar";
import ResetPassword from "./pages/ResetPassword";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/business/:id" element={<BusinessDetail />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Auth Routes - Redirect based on role */}
              <Route path="/redirect" element={<RoleBasedRedirect />} />
              
              {/* Customer Routes */}
              <Route 
                path="/customer/home" 
                element={
                  <ProtectedRoute requireAuth requireCustomer>
                    <CustomerHome />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer/bookings" 
                element={
                  <ProtectedRoute requireAuth requireCustomer>
                    <CustomerDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Business Routes */}
              <Route 
                path="/business/dashboard" 
                element={
                  <ProtectedRoute requireAuth requireBusiness>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/business/calendar" 
                element={
                  <ProtectedRoute requireAuth requireBusiness>
                    <Calendar />
                  </ProtectedRoute>
                } 
              />
              
              {/* Legacy Routes - Redirect for backward compatibility */}
              <Route path="/dashboard" element={<RoleBasedRedirect />} />
              <Route path="/calendar" element={<RoleBasedRedirect />} />
              <Route path="/my-bookings" element={<RoleBasedRedirect />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
