import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Sparkles, MapPin, ArrowRight, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomerOnboardingProps {
  onComplete: () => void;
}

export const CustomerOnboarding = ({ onComplete }: CustomerOnboardingProps) => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);

  const serviceTypes = [
    { id: "salon", label: "Hair Salons" },
    { id: "barbershop", label: "Barbershops" },
    { id: "spa", label: "Spas" },
    { id: "nails", label: "Nail Salons" },
    { id: "massage", label: "Massage" },
    { id: "fitness", label: "Fitness" },
    { id: "beauty", label: "Beauty Services" },
    { id: "wellness", label: "Wellness" },
  ];

  const handleComplete = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Save preferences to user metadata (location and service types)
      const preferencesData: any = {};
      if (location) {
        preferencesData.preferred_location = location;
      }
      if (preferences.length > 0) {
        preferencesData.preferred_service_types = preferences;
      }

      // Update user metadata with preferences
      if (Object.keys(preferencesData).length > 0) {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: {
            ...user.user_metadata,
            ...preferencesData,
          },
        });
        if (metadataError) {
          console.warn("Failed to save preferences to metadata:", metadataError);
          // Continue anyway - preferences are optional
        }
      }

      // Try to update onboarding status in profiles table
      // Handle case where columns might not exist yet (graceful degradation)
      const updateData: any = {};
      
      // Only include onboarding fields if we can determine they exist
      // We'll try the update and handle errors gracefully
      try {
        const { error, data } = await supabase
          .from("profiles")
          .update({
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString(),
          })
          .eq("id", user.id)
          .select();

        if (error) {
          // Check if error is due to missing columns
          const errorMsg = error.message?.toLowerCase() || "";
          if (errorMsg.includes("column") && (errorMsg.includes("onboarding_completed") || errorMsg.includes("does not exist"))) {
            // Columns don't exist - this is okay, just continue without tracking
            console.warn("Onboarding tracking columns not found. Preferences saved to user metadata. Please run ADD_ONBOARDING_TRACKING.sql migration for full tracking.");
            // Continue without throwing - onboarding will work, just won't be tracked in DB
          } else {
            // Other error - log but don't block onboarding
            console.error("Error updating onboarding status:", error);
            // Continue anyway - preferences are saved in metadata
          }
        }
      } catch (dbError: any) {
        // Database error - log but continue
        console.warn("Database update failed, but preferences saved to metadata:", dbError);
      }

      await refreshProfile();
      
      toast({
        title: "Welcome to SelfHub AI!",
        description: "You're all set. Let's find you the perfect service.",
      });

      onComplete();
    } catch (error: any) {
      console.error("Error completing onboarding:", error);
      
      // Provide more specific error message
      let errorMessage = "Failed to complete onboarding. Please try again.";
      if (error.message?.includes("permission") || error.message?.includes("policy")) {
        errorMessage = "Permission denied. Please check your database permissions.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  const togglePreference = (id: string) => {
    setPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl">Welcome to SelfHub AI!</CardTitle>
          <CardDescription className="text-lg mt-2">
            {step === 1 && "Let's personalize your experience"}
            {step === 2 && "Tell us what you're looking for"}
            {step === 3 && "You're all set!"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">
                  Find Your Perfect Beauty & Wellness Service
                </h3>
                <p className="text-muted-foreground">
                  We'll help you discover amazing local businesses and book appointments
                  in just a few clicks.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <MapPin className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Find Services</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Search by location and type
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Book Instantly</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    No account needed for booking
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Sparkles className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Manage Easily</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Track all your appointments
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(2)}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isLoading}
                >
                  Skip
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Preferences */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="location">Your Location (Optional)</Label>
                  <Input
                    id="location"
                    placeholder="City or ZIP code"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This helps us show you nearby businesses
                  </p>
                </div>
                <div>
                  <Label>Service Types You're Interested In (Optional)</Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Select all that apply - you can change this later
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {serviceTypes.map((type) => (
                      <div
                        key={type.id}
                        className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted cursor-pointer"
                        onClick={() => togglePreference(type.id)}
                      >
                        <Checkbox
                          id={type.id}
                          checked={preferences.includes(type.id)}
                          onCheckedChange={() => togglePreference(type.id)}
                        />
                        <Label
                          htmlFor={type.id}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Skeleton className="h-4 w-4 mr-2 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isLoading}
                >
                  Skip
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

