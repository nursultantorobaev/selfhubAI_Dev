import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { RoleSelection, type UserRole } from "@/components/RoleSelection";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
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

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthDialog = ({ open, onOpenChange }: AuthDialogProps) => {
  const { signIn, signUp, resetPassword, resendConfirmationEmail, user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResendEmail, setShowResendEmail] = useState(false);
  const [resendEmailAddress, setResendEmailAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  // Close dialog if user is already logged in
  useEffect(() => {
    if (user && open) {
      onOpenChange(false);
    }
  }, [user, open, onOpenChange]);

  // Reset role selection when switching tabs or closing
  useEffect(() => {
    if (!open) {
      setSelectedRole(null);
      setShowRoleSelection(false);
    }
    if (activeTab === "login") {
      setShowRoleSelection(false);
      setSelectedRole(null);
    }
  }, [open, activeTab]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const getErrorMessage = (error: any): string => {
    if (!error) return "";
    
    const message = error.message?.toLowerCase() || "";
    
    // Handle common Supabase auth errors
    if (message.includes("invalid login credentials") || message.includes("invalid credentials")) {
      return "Invalid email or password. Please try again.";
    }
    if (message.includes("email not confirmed") || message.includes("email not verified")) {
      // Show resend option if email not confirmed
      const email = loginForm.getValues("email");
      if (email) {
        setResendEmailAddress(email);
        setShowResendEmail(true);
      }
      return "Please verify your email address before signing in. Check your inbox for the verification link.";
    }
    if (message.includes("too many requests")) {
      return "Too many attempts. Please wait a moment and try again.";
    }
    if (message.includes("user not found")) {
      return "Invalid email or password. Please try again.";
    }
    
    return error.message || "An unexpected error occurred. Please try again.";
  };

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(values.email, values.password);
      if (error) {
        toast({
          title: "Sign in failed",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      } else {
        // Track login
        const { trackLogin } = await import("@/lib/analytics");
        trackLogin("email");

        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
        onOpenChange(false);
        loginForm.reset();
        
        // Redirect to role-based redirect handler
        navigate("/redirect");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setShowRoleSelection(false);
  };

  const onSignupSubmit = async (values: z.infer<typeof signupSchema>) => {
    if (!selectedRole) {
      toast({
        title: "Please select a role",
        description: "Choose whether you're a customer or business owner.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Pass role to signUp function (will be stored in user metadata)
      const { error } = await signUp(values.email, values.password, values.fullName, selectedRole);
      if (error) {
        const errorMsg = error.message?.toLowerCase() || "";
        let description = error.message;
        
        if (errorMsg.includes("user already registered") || errorMsg.includes("already registered")) {
          description = "An account with this email already exists. Please sign in instead.";
        } else if (errorMsg.includes("password")) {
          description = "Password doesn't meet requirements. Please try again.";
        }
        
        toast({
          title: "Sign up failed",
          description,
          variant: "destructive",
        });
      } else {
        // Track signup
        const { trackSignUp } = await import("@/lib/analytics");
        trackSignUp("email");

        // Store email for potential resend
        setResendEmailAddress(values.email);
        setShowResendEmail(true);
        
        toast({
          title: "Account created!",
          description: "We've sent a confirmation email to your inbox. Please check your email (including spam folder) and click the verification link to activate your account. You'll need to verify your email before you can sign in.",
        });
        onOpenChange(false);
        signupForm.reset();
        setActiveTab("login");
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

  const onForgotPasswordSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    setIsLoading(true);
    try {
      const { error, data } = await resetPassword(values.email);
      
      // Log for debugging (only in development)
      if (import.meta.env.DEV) {
        console.log("Password reset response:", { error, data });
      }
      
      if (error) {
        // Provide more specific error messages
        const errorMsg = error.message?.toLowerCase() || "";
        let description = error.message || "Failed to send reset email. Please try again.";
        
        if (errorMsg.includes("rate limit") || errorMsg.includes("too many")) {
          description = "Too many requests. Please wait a few minutes and try again.";
        } else if (errorMsg.includes("user not found")) {
          // For security, don't reveal if email exists, but show helpful message
          description = "If an account exists with this email, a password reset link has been sent. Please check your inbox (including spam folder).";
        } else if (errorMsg.includes("email") || errorMsg.includes("smtp") || errorMsg.includes("mail")) {
          description = "Email service error. Please check your Supabase SMTP configuration or try again later.";
        }
        
        toast({
          title: "Error",
          description,
          variant: "destructive",
        });
      } else {
        // Success - Supabase always returns success for security (even if email doesn't exist)
        toast({
          title: "Reset link sent!",
          description: "If an account exists with this email, you'll receive password reset instructions within a few minutes. Please check your inbox (including spam folder).",
        });
        setShowForgotPassword(false);
        forgotPasswordForm.reset();
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please check your Supabase email configuration in the dashboard.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onResendConfirmation = async () => {
    if (!resendEmailAddress) return;
    
    setIsLoading(true);
    try {
      const { error } = await resendConfirmationEmail(resendEmailAddress);
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to resend confirmation email. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Confirmation email sent!",
          description: "We've sent a new confirmation email. Please check your inbox (including spam folder).",
        });
        setShowResendEmail(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to SelfHub AI</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one to get started.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-4">
            {showForgotPassword ? (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForgotPassword(false);
                    forgotPasswordForm.reset();
                  }}
                  className="mb-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to sign in
                </Button>
                <Form {...forgotPasswordForm}>
                  <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Reset your password</h3>
                      <p className="text-sm text-muted-foreground">
                        Enter your email address and we'll send you a link to reset your password.
                      </p>
                    </div>
                    <FormField
                      control={forgotPasswordForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send reset link
                    </Button>
                  </form>
                </Form>
              </div>
            ) : (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Password</FormLabel>
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="h-auto px-0 text-xs"
                            onClick={() => setShowForgotPassword(true)}
                            disabled={isLoading}
                          >
                            Forgot password?
                          </Button>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              disabled={isLoading}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={isLoading}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                  {showResendEmail && resendEmailAddress && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                      <p className="text-sm text-yellow-900 dark:text-yellow-100 mb-2">
                        Didn't receive the confirmation email?
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={onResendConfirmation}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Resend Confirmation Email"
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            )}
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-4">
            {!selectedRole ? (
              <>
                <RoleSelection
                  onRoleSelect={handleRoleSelect}
                  selectedRole={selectedRole}
                />
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("login")}
                  className="w-full"
                >
                  Already have an account? Sign In
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Role:</span>
                    <span className="text-sm capitalize">{selectedRole}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedRole(null);
                    }}
                  >
                    Change
                  </Button>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-3 mb-4">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Why email confirmation?</strong> We send a verification email to ensure your email address is valid and to protect your account security. You'll need to click the link in the email before you can sign in.
                  </p>
                </div>
                <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                <FormField
                  control={signupForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        Must be at least 6 characters with uppercase, lowercase, and number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </Form>
            </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;

