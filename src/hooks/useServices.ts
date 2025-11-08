import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Service = Tables<"services">;
export type ServiceInsert = TablesInsert<"services">;
export type ServiceUpdate = TablesUpdate<"services">;

export const useServices = (businessId: string | null | undefined) => {
  const queryClient = useQueryClient();

  // Get all services for a business
  const { data: services, isLoading, error } = useQuery({
    queryKey: ["services", businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Service[];
    },
    enabled: !!businessId,
  });

  // Create service mutation
  const createMutation = useMutation({
    mutationFn: async (service: Omit<ServiceInsert, "business_id">) => {
      if (!businessId) throw new Error("Business ID is required");

      const { data, error } = await supabase
        .from("services")
        .insert({
          ...service,
          business_id: businessId,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", businessId] });
    },
  });

  // Update service mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ServiceUpdate }) => {
      const { data, error } = await supabase
        .from("services")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", businessId] });
    },
  });

  // Delete service mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", businessId] });
    },
  });

  return {
    services: services || [],
    isLoading,
    error,
    createService: createMutation.mutateAsync,
    updateService: updateMutation.mutateAsync,
    deleteService: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};


