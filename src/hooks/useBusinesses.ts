import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { AdvancedFilters } from "@/components/AdvancedFilters";

export type BusinessProfile = Tables<"business_profiles">;

interface UseBusinessesOptions {
  limit?: number;
  businessType?: string;
  city?: string;
  searchQuery?: string;
  isActive?: boolean;
  advancedFilters?: AdvancedFilters;
}

// Helper function to calculate distance (Haversine formula)
// For now, we'll use a simple approximation based on city matching
// In production, you'd want to add lat/lng to business_profiles table
function calculateDistance(city1: string, city2: string): number {
  // Simple city matching - in production, use actual coordinates
  if (city1.toLowerCase() === city2.toLowerCase()) return 0;
  return Infinity; // Unknown distance
}

// Helper function to check if business has available appointments
async function checkAvailability(businessId: string): Promise<boolean> {
  try {
    // Get business hours
    const { data: hours } = await supabase
      .from("business_hours")
      .select("*")
      .eq("business_id", businessId);

    if (!hours || hours.length === 0) return false;

    // Get existing appointments for the next 7 days
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const { data: appointments } = await supabase
      .from("appointments")
      .select("appointment_date, appointment_time")
      .eq("business_id", businessId)
      .in("status", ["pending", "confirmed"])
      .gte("appointment_date", today.toISOString().split("T")[0])
      .lte("appointment_date", nextWeek.toISOString().split("T")[0]);

    // Get services for this business
    const { data: services } = await supabase
      .from("services")
      .select("duration_minutes")
      .eq("business_id", businessId)
      .eq("is_active", true);

    if (!services || services.length === 0) return false;

    // Simple check: if there are open hours and services, assume availability
    // In a real implementation, you'd check for actual time slots
    const hasOpenHours = hours.some((h) => !h.is_closed);
    
    return hasOpenHours && services.length > 0;
  } catch (error) {
    return false;
  }
}

export const useBusinesses = (options: UseBusinessesOptions = {}) => {
  const { 
    limit = 20, 
    businessType, 
    city, 
    searchQuery, 
    isActive = true,
    advancedFilters 
  } = options;

  // Increase limit when searching/filtering to get more results for client-side filtering
  const queryLimit = (searchQuery || advancedFilters) ? Math.max(limit * 5, 100) : limit;

  return useQuery({
    queryKey: ["businesses", limit, businessType, city, searchQuery, isActive, advancedFilters],
    queryFn: async () => {
      let query = supabase
        .from("business_profiles")
        .select("*")
        .eq("is_active", isActive)
        .limit(queryLimit);

      // Filter by business type
      if (businessType) {
        query = query.eq("business_type", businessType);
      }

      // Filter by city
      if (city) {
        query = query.ilike("city", `%${city}%`);
      }

      // Rating filter (if provided)
      if (advancedFilters?.minRating !== undefined) {
        query = query.gte("rating", advancedFilters.minRating);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      let results = data as BusinessProfile[];
      
      // Client-side filtering to search across multiple fields (name, description, address)
      if (searchQuery && results.length > 0) {
        const lowerQuery = searchQuery.toLowerCase();
        results = results.filter((business) => {
          const nameMatch = business.business_name?.toLowerCase().includes(lowerQuery);
          const descMatch = business.description?.toLowerCase().includes(lowerQuery);
          const addressMatch = business.address?.toLowerCase().includes(lowerQuery);
          const cityMatch = business.city?.toLowerCase().includes(lowerQuery);
          return nameMatch || descMatch || addressMatch || cityMatch;
        });
      }

      // Advanced filtering: Price range
      if (advancedFilters?.minPrice !== undefined || advancedFilters?.maxPrice !== undefined) {
        // Fetch services for all businesses to check price ranges
        const businessIds = results.map((b) => b.id);
        const { data: allServices } = await supabase
          .from("services")
          .select("business_id, price")
          .eq("is_active", true)
          .in("business_id", businessIds);

        if (allServices) {
          // Group services by business and find min/max prices
          const businessPrices = new Map<string, { min: number; max: number }>();
          
          allServices.forEach((service) => {
            const price = Number(service.price);
            const existing = businessPrices.get(service.business_id);
            if (!existing) {
              businessPrices.set(service.business_id, { min: price, max: price });
            } else {
              businessPrices.set(service.business_id, {
                min: Math.min(existing.min, price),
                max: Math.max(existing.max, price),
              });
            }
          });

          // Filter businesses by price range
          results = results.filter((business) => {
            const prices = businessPrices.get(business.id);
            if (!prices) return false; // No active services

            const minPrice = advancedFilters.minPrice ?? 0;
            const maxPrice = advancedFilters.maxPrice ?? Infinity;

            // Business matches if it has at least one service in the price range
            return prices.min <= maxPrice && prices.max >= minPrice;
          });
        } else {
          // No services found, filter out all
          results = [];
        }
      }

      // Advanced filtering: Availability
      if (advancedFilters?.hasAvailability) {
        // Check availability for all businesses in parallel
        const availabilityChecks = await Promise.all(
          results.map(async (business) => ({
            business,
            hasAvailability: await checkAvailability(business.id),
          }))
        );

        results = availabilityChecks
          .filter((check) => check.hasAvailability)
          .map((check) => check.business);
      }

      // Sorting
      if (advancedFilters?.sortBy) {
        if (advancedFilters.sortBy === "rating") {
          results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (advancedFilters.sortBy === "reviews") {
          results.sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0));
        } else if (advancedFilters.sortBy === "price_asc" || advancedFilters.sortBy === "price_desc") {
          // Fetch prices for sorting
          const businessIds = results.map((b) => b.id);
          const { data: allServices } = await supabase
            .from("services")
            .select("business_id, price")
            .eq("is_active", true)
            .in("business_id", businessIds);

          if (allServices) {
            const businessMinPrices = new Map<string, number>();
            allServices.forEach((service) => {
              const price = Number(service.price);
              const existing = businessMinPrices.get(service.business_id);
              if (!existing || price < existing) {
                businessMinPrices.set(service.business_id, price);
              }
            });

            results.sort((a, b) => {
              const priceA = businessMinPrices.get(a.id) || Infinity;
              const priceB = businessMinPrices.get(b.id) || Infinity;
              return advancedFilters.sortBy === "price_asc"
                ? priceA - priceB
                : priceB - priceA;
            });
          }
        }
      } else {
        // Default sorting by rating
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
      
      // Apply the original limit after filtering
      return results.slice(0, limit);
    },
  });
};

