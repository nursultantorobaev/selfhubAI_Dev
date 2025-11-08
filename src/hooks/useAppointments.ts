import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Appointment = Tables<"appointments">;
export type AppointmentInsert = TablesInsert<"appointments">;
export type AppointmentUpdate = TablesUpdate<"appointments">;

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

interface UseAppointmentsOptions {
  businessId?: string;
  customerId?: string;
  status?: AppointmentStatus;
  date?: string; // YYYY-MM-DD format
}

export const useAppointments = (options: UseAppointmentsOptions = {}) => {
  const { businessId, customerId, status, date } = options;

  return useQuery({
    queryKey: ["appointments", businessId, customerId, status, date],
    queryFn: async () => {
      let query = supabase
        .from("appointments")
        .select(`
          *,
          service:services(*),
          business:business_profiles(*),
          customer:profiles(*)
        `)
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      if (businessId) {
        query = query.eq("business_id", businessId);
      }

      if (customerId) {
        query = query.eq("customer_id", customerId);
      }

      if (status) {
        query = query.eq("status", status);
      }

      if (date) {
        query = query.eq("appointment_date", date);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as (Appointment & {
        service: any;
        business: any;
        customer: any;
      })[];
    },
    enabled: !!businessId || !!customerId,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointment: AppointmentInsert) => {
      // Use RPC function to prevent race conditions
      // This function checks availability and locks rows atomically
      const { data: appointmentId, error: rpcError } = await supabase.rpc(
        "create_appointment_safe",
        {
          p_business_id: appointment.business_id,
          p_service_id: appointment.service_id,
          p_customer_id: appointment.customer_id,
          p_appointment_date: appointment.appointment_date,
          p_appointment_time: appointment.appointment_time,
          p_customer_name: appointment.customer_name,
          p_customer_email: appointment.customer_email,
          p_customer_phone: appointment.customer_phone || null,
          p_notes: appointment.notes || null,
          p_status: appointment.status || "pending",
        }
      );

      if (rpcError) {
        // If RPC function doesn't exist, fall back to direct insert
        // (for backward compatibility during migration)
        if (rpcError.message?.includes("function") || rpcError.message?.includes("does not exist")) {
          // Fallback to standard insert
          const { data, error } = await supabase
            .from("appointments")
            .insert(appointment)
            .select(`
              *,
              service:services(*),
              business:business_profiles(*),
              customer:profiles(*)
            `)
            .single();

          if (error) throw error;
          return data;
        }
        throw rpcError;
      }

      // Fetch the created appointment with relations
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          service:services(*),
          business:business_profiles(*),
          customer:profiles(*)
        `)
        .eq("id", appointmentId)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments", data.business_id] });
      queryClient.invalidateQueries({ queryKey: ["appointments", data.customer_id] });
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: AppointmentUpdate }) => {
      const { data, error } = await supabase
        .from("appointments")
        .update(updates)
        .eq("id", id)
        .select(`
          *,
          service:services(*),
          business:business_profiles(*),
          customer:profiles(*)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments", data.business_id] });
      queryClient.invalidateQueries({ queryKey: ["appointments", data.customer_id] });
    },
  });
};

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      if (data.business_id) {
        queryClient.invalidateQueries({ queryKey: ["appointments", data.business_id] });
      }
      if (data.customer_id) {
        queryClient.invalidateQueries({ queryKey: ["appointments", data.customer_id] });
      }
    },
  });
};

// Helper function to check if a time slot is available
export const checkTimeSlotAvailability = async (
  businessId: string,
  date: string,
  time: string,
  durationMinutes: number
): Promise<boolean> => {
  // Parse the appointment time
  const [hours, minutes] = time.split(":").map(Number);
  const appointmentStart = new Date(`${date}T${time}`);
  const appointmentEnd = new Date(appointmentStart.getTime() + durationMinutes * 60 * 1000);

  // Get all appointments for this business on this date
  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("business_id", businessId)
    .eq("appointment_date", date)
    .in("status", ["pending", "confirmed"]);

  if (error) throw error;

  if (!appointments || appointments.length === 0) {
    return true;
  }

  // Check for overlaps
  for (const appointment of appointments) {
    const [apptHours, apptMinutes] = appointment.appointment_time.split(":").map(Number);
    const apptStart = new Date(`${date}T${appointment.appointment_time}`);
    
    // Get service duration from the appointment (we'll need to fetch this)
    // For now, assume 60 minutes if not available
    const apptDuration = 60; // Default, should be fetched from service
    const apptEnd = new Date(apptStart.getTime() + apptDuration * 60 * 1000);

    // Check if appointments overlap
    if (
      (appointmentStart < apptEnd && appointmentEnd > apptStart)
    ) {
      return false;
    }
  }

  return true;
};

// Helper function to generate available time slots
// Now includes buffer time consideration
export const generateTimeSlots = (
  openTime: string,
  closeTime: string,
  durationMinutes: number,
  intervalMinutes: number = 15,
  bufferMinutes: number = 15
): string[] => {
  const slots: string[] = [];
  
  // Parse open and close times
  const [openHours, openMinutes] = openTime.split(":").map(Number);
  const [closeHours, closeMinutes] = closeTime.split(":").map(Number);
  
  const start = new Date();
  start.setHours(openHours, openMinutes, 0, 0);
  
  const end = new Date();
  end.setHours(closeHours, closeMinutes, 0, 0);
  
  const slot = new Date(start);
  
  while (slot < end) {
    // Check if slot + duration + buffer fits within business hours
    const slotEnd = new Date(slot.getTime() + (durationMinutes + bufferMinutes) * 60 * 1000);
    if (slotEnd <= end) {
      const hours = slot.getHours().toString().padStart(2, "0");
      const minutes = slot.getMinutes().toString().padStart(2, "0");
      slots.push(`${hours}:${minutes}`);
    }
    
    // Move to next slot
    slot.setMinutes(slot.getMinutes() + intervalMinutes);
  }
  
  return slots;
};

