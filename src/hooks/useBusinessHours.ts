import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type BusinessHours = Tables<"business_hours">;
export type BusinessHoursInsert = TablesInsert<"business_hours">;
export type BusinessHoursUpdate = TablesUpdate<"business_hours">;

export const useBusinessHours = (businessId: string | null | undefined) => {
  const queryClient = useQueryClient();

  // Get all business hours for a business
  const { data: hours, isLoading, error } = useQuery({
    queryKey: ["businessHours", businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from("business_hours")
        .select("*")
        .eq("business_id", businessId)
        .order("day_of_week", { ascending: true });

      if (error) throw error;
      return data as BusinessHours[];
    },
    enabled: !!businessId,
  });

  // Upsert business hours (insert or update)
  const upsertMutation = useMutation({
    mutationFn: async (hoursData: Array<{
      day_of_week: number;
      open_time: string;
      close_time: string;
      is_closed: boolean;
    }>) => {
      if (!businessId) throw new Error("Business ID is required");

      // Delete existing hours for this business
      await supabase
        .from("business_hours")
        .delete()
        .eq("business_id", businessId);

      // Insert new hours
      const hoursToInsert = hoursData.map((hour) => ({
        business_id: businessId,
        day_of_week: hour.day_of_week,
        open_time: hour.open_time,
        close_time: hour.close_time,
        is_closed: hour.is_closed,
      }));

      const { data, error } = await supabase
        .from("business_hours")
        .insert(hoursToInsert)
        .select();

      if (error) throw error;
      return data as BusinessHours[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessHours", businessId] });
    },
  });

  return {
    hours: hours || [],
    isLoading,
    error,
    upsertHours: upsertMutation.mutateAsync,
    isSaving: upsertMutation.isPending,
  };
};


