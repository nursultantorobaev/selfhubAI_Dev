import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Review = Tables<"reviews">;
export type ReviewInsert = TablesInsert<"reviews">;
export type ReviewUpdate = TablesUpdate<"reviews">;

interface UseReviewsOptions {
  businessId?: string;
  customerId?: string;
  limit?: number;
}

export const useReviews = (options: UseReviewsOptions = {}) => {
  const { businessId, customerId, limit } = options;

  return useQuery({
    queryKey: ["reviews", businessId, customerId, limit],
    queryFn: async () => {
      let query = supabase
        .from("reviews")
        .select(`
          *,
          customer:profiles(id, full_name, email, avatar_url),
          appointment:appointments(id, appointment_date, appointment_time, service:services(name))
        `)
        .order("created_at", { ascending: false });

      if (businessId) {
        query = query.eq("business_id", businessId);
      }

      if (customerId) {
        query = query.eq("customer_id", customerId);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as (Review & {
        customer: any;
        appointment: any;
      })[];
    },
    enabled: !!businessId || !!customerId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: ReviewInsert) => {
      const { data, error } = await supabase
        .from("reviews")
        .insert(review)
        .select(`
          *,
          customer:profiles(id, full_name, email, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews", data.business_id] });
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      queryClient.invalidateQueries({ queryKey: ["business", data.business_id] });
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ReviewUpdate }) => {
      const { data, error } = await supabase
        .from("reviews")
        .update(updates)
        .eq("id", id)
        .select(`
          *,
          customer:profiles(id, full_name, email, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews", data.business_id] });
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      queryClient.invalidateQueries({ queryKey: ["business", data.business_id] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      if (data.business_id) {
        queryClient.invalidateQueries({ queryKey: ["reviews", data.business_id] });
        queryClient.invalidateQueries({ queryKey: ["businesses"] });
        queryClient.invalidateQueries({ queryKey: ["business", data.business_id] });
      }
    },
  });
};

// Check if customer has already reviewed this business
export const useCustomerReview = (businessId: string | undefined, customerId: string | undefined) => {
  return useQuery({
    queryKey: ["customerReview", businessId, customerId],
    queryFn: async () => {
      if (!businessId || !customerId) return null;

      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("business_id", businessId)
        .eq("customer_id", customerId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No review found
          return null;
        }
        throw error;
      }
      return data as Review;
    },
    enabled: !!businessId && !!customerId,
  });
};


