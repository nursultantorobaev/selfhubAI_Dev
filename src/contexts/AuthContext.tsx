import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string, role?: "customer" | "business") => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  resendConfirmationEmail: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      // Error logged but not exposed to user
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const refreshUser = async () => {
    // Force refresh of user session to get latest metadata
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await fetchProfile(session.user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        
        // Set user context in Sentry
        const { setUserContext } = await import("@/lib/sentry");
        setUserContext({
          id: session.user.id,
          email: session.user.email,
        });
      } else {
        setProfile(null);
        
        // Clear user context in Sentry
        const { clearUserContext } = await import("@/lib/sentry");
        clearUserContext();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // Log for debugging
    if (error) {
      console.error("Supabase sign in error:", {
        message: error.message,
        status: error.status,
        name: error.name,
      });
    } else if (data?.user) {
      console.log("Sign in successful:", {
        email: data.user.email,
        emailConfirmed: data.user.email_confirmed_at ? "Yes" : "No",
        userId: data.user.id,
      });
    }
    
    return { data, error };
  };

  const signUp = async (email: string, password: string, fullName?: string, role?: "customer" | "business") => {
    // Use production URL for email redirects (Supabase will handle the redirect)
    // In production, always use the production URL to avoid localhost issues
    const isProduction = import.meta.env.PROD;
    const redirectUrl = isProduction 
      ? 'https://selfhub-ai-dev.vercel.app/' 
      : `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || "",
          user_role: role || "customer", // Store role in user metadata
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    // Use production URL for email redirects
    const isProduction = import.meta.env.PROD;
    const redirectUrl = isProduction 
      ? 'https://selfhub-ai-dev.vercel.app/reset-password' 
      : `${window.location.origin}/reset-password`;
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { data, error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  };

  const resendConfirmationEmail = async (email: string) => {
    // Use production URL for email redirects (Supabase will handle the redirect)
    // In production, always use the production URL to avoid localhost issues
    const isProduction = import.meta.env.PROD;
    const redirectUrl = isProduction 
      ? 'https://selfhub-ai-dev.vercel.app/' 
      : `${window.location.origin}/`;
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        refreshUser,
        resetPassword,
        updatePassword,
        resendConfirmationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

