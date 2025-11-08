import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type BusinessProfile = Tables<"business_profiles">;
export type BusinessProfileInsert = TablesInsert<"business_profiles">;
export type BusinessProfileUpdate = TablesUpdate<"business_profiles">;

export const useBusinessProfile = () => {
  const { user, refreshProfile } = useAuth();
  const queryClient = useQueryClient();

  // Get user's business profile
  const { data: businessProfile, isLoading, error } = useQuery({
    queryKey: ["businessProfile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as BusinessProfile | null;
    },
    enabled: !!user,
  });

  // Create business profile mutation
  const createMutation = useMutation({
    mutationFn: async (business: BusinessProfileInsert) => {
      if (!user) throw new Error("User must be logged in");
      
      const { data, error } = await supabase
        .from("business_profiles")
        .insert({
          ...business,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update user profile to mark as business owner and complete onboarding
      // Try to update onboarding fields, but don't fail if columns don't exist
      const updateData: any = { 
        is_business_owner: true,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      };
      
      // Update profile - if onboarding columns don't exist, this will error
      // but we'll catch it and continue with just is_business_owner update
      const { error: updateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);
      
      // If error is due to missing columns, try again with just is_business_owner
      if (updateError) {
        const errorMsg = updateError.message?.toLowerCase() || "";
        if (errorMsg.includes("column") && errorMsg.includes("onboarding_completed")) {
          // Columns don't exist - update without onboarding fields
          await supabase
            .from("profiles")
            .update({ is_business_owner: true })
            .eq("id", user.id);
        } else {
          // Other error - throw it
          throw updateError;
        }
      }

      return data as BusinessProfile;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["businessProfile", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      // Refresh auth profile to get updated is_business_owner flag
      if (user) {
        await refreshProfile();
      }
    },
  });

  // Update business profile mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: BusinessProfileUpdate }) => {
      const { data, error } = await supabase
        .from("business_profiles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as BusinessProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessProfile", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
  });

  // Delete business profile mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("business_profiles")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      // Update user profile to remove business owner flag
      await supabase
        .from("profiles")
        .update({ is_business_owner: false })
        .eq("id", user?.id);

      return null;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["businessProfile", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      if (user) {
        await refreshProfile();
      }
    },
  });

  return {
    businessProfile,
    isLoading,
    error,
    hasBusiness: !!businessProfile,
    createBusiness: createMutation.mutateAsync,
    updateBusiness: updateMutation.mutateAsync,
    deleteBusiness: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

