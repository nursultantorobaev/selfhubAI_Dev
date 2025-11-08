import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";

const resetPasswordSchema = z.object({
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updatePassword, user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Check if user has a valid session (from password reset link)
  useEffect(() => {
    // Check if there's a password reset token in the URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hasAccessToken = hashParams.has('access_token') || hashParams.has('type');
    
    // Listen for auth state changes (Supabase will fire this when it processes the token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (session?.user && hasAccessToken)) {
        setHasValidSession(true);
        setIsCheckingSession(false);
      }
    });

    const checkSession = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      // If there's a token in the hash, wait a bit for Supabase to process it
      if (hasAccessToken) {
        // Give Supabase time to process the token (up to 3 minutes)
        let attempts = 0;
        const maxAttempts = 900; // 900 attempts * 200ms = 180 seconds (3 minutes)
        
        const checkInterval = setInterval(async () => {
          attempts++;
          
          // Check current session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            setHasValidSession(true);
            setIsCheckingSession(false);
            clearInterval(checkInterval);
          } else if (attempts >= maxAttempts) {
            // After max attempts, check one more time
            const { data: { session: finalSession } } = await supabase.auth.getSession();
            if (finalSession?.user) {
              setHasValidSession(true);
            } else {
              setHasValidSession(false);
              toast({
                title: "Invalid or expired link",
                description: "This password reset link is invalid or has expired. Please request a new one.",
                variant: "destructive",
              });
              setTimeout(() => navigate("/"), 2000);
            }
            setIsCheckingSession(false);
            clearInterval(checkInterval);
          }
        }, 200); // Check every 200ms

        return () => {
          clearInterval(checkInterval);
          subscription.unsubscribe();
        };
      } else {
        // No token in URL, check if user is already logged in
        if (user) {
          setHasValidSession(true);
        } else {
          setHasValidSession(false);
          toast({
            title: "Invalid or expired link",
            description: "This password reset link is invalid or has expired. Please request a new one.",
            variant: "destructive",
          });
          setTimeout(() => navigate("/"), 2000);
        }
        setIsCheckingSession(false);
        subscription.unsubscribe();
      }
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, authLoading, navigate]);

  const onSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await updatePassword(values.password);
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to update password. Please try again.",
          variant: "destructive",
        });
      } else {
        setIsSuccess(true);
        toast({
          title: "Password updated!",
          description: "Your password has been successfully updated.",
        });
        // Redirect to home after 2 seconds
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking session
  if (isCheckingSession || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                  <h2 className="text-xl font-semibold">Verifying reset link...</h2>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we verify your password reset link.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error if no valid session
  if (!hasValidSession) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h2 className="text-xl font-semibold">Invalid or Expired Link</h2>
                  <p className="text-sm text-muted-foreground">
                    This password reset link is invalid or has expired. Please request a new one.
                  </p>
                  <Button onClick={() => navigate("/")} className="mt-4">
                    Return to Homepage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                  <h2 className="text-2xl font-bold">Password Reset Successful!</h2>
                  <p className="text-muted-foreground">
                    Your password has been successfully updated. You can now sign in with your new password.
                  </p>
                  <Button onClick={() => navigate("/")} className="mt-4">
                    Go to Homepage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Reset Your Password</CardTitle>
              <CardDescription>
                Enter your new password below. Make sure it's at least 6 characters and includes uppercase, lowercase, and a number.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter new password"
                              {...field}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Must be at least 6 characters with uppercase, lowercase, and a number
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm new password"
                              {...field}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating password...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;

