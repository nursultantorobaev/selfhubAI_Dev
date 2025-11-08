import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useServices } from "@/hooks/useServices";
import { useBusinessHours } from "@/hooks/useBusinessHours";
import { useUpdateAppointment, generateTimeSlots } from "@/hooks/useAppointments";
import { supabase } from "@/integrations/supabase/client";
import { sendEmailNotification } from "@/lib/sendEmail";
import { isBookingDateTimeValid, BUFFER_MINUTES } from "@/lib/validation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { BusinessProfile } from "@/hooks/useBusinesses";

const MIN_BOOKING_HOURS = 2;
const MAX_BOOKING_DAYS = 90;

const rescheduleSchema = z.object({
  appointmentDate: z.date({
    required_error: "Please select a date",
  }),
  appointmentTime: z.string().min(1, "Please select a time"),
}).refine((data) => {
  const timeCheck = isBookingDateTimeValid(
    data.appointmentDate,
    data.appointmentTime,
    MIN_BOOKING_HOURS,
    MAX_BOOKING_DAYS
  );
  return timeCheck.valid;
}, (data) => {
  const timeCheck = isBookingDateTimeValid(
    data.appointmentDate,
    data.appointmentTime,
    MIN_BOOKING_HOURS,
    MAX_BOOKING_DAYS
  );
  return {
    message: timeCheck.reason || "Invalid booking time",
    path: ["appointmentTime"],
  };
});

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: {
    id: string;
    business_id: string;
    service_id: string;
    appointment_date: string;
    appointment_time: string;
    customer_name: string;
    customer_email: string;
    service?: { name: string; duration_minutes: number };
    business?: { business_name: string };
  };
  business?: BusinessProfile;
}

export const RescheduleDialog = ({ open, onOpenChange, appointment, business }: RescheduleDialogProps) => {
  const { services } = useServices(appointment.business_id);
  const { hours } = useBusinessHours(appointment.business_id);
  const updateAppointment = useUpdateAppointment();

  const service = services.find((s) => s.id === appointment.service_id);
  const activeServices = services.filter((s) => s.is_active !== false);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const form = useForm<z.infer<typeof rescheduleSchema>>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      appointmentDate: undefined,
      appointmentTime: "",
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        appointmentDate: undefined,
        appointmentTime: "",
      });
      setSelectedDate(undefined);
      setAvailableTimeSlots([]);
    }
  }, [open, form]);

  // When date changes, generate available time slots
  useEffect(() => {
    const date = form.watch("appointmentDate");
    if (!date || !service) {
      setAvailableTimeSlots([]);
      return;
    }

    setSelectedDate(date);
    generateAvailableSlots(date);
  }, [form.watch("appointmentDate"), service]);

  const generateAvailableSlots = async (date: Date) => {
    if (!date || !service) return;

    // Get day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = date.getDay();
    const dayHours = hours.find((h) => h.day_of_week === dayOfWeek);

    if (!dayHours || dayHours.is_closed) {
      setAvailableTimeSlots([]);
      return;
    }

    // Generate time slots based on business hours (with buffer time)
    const slots = generateTimeSlots(
      dayHours.open_time,
      dayHours.close_time,
      service.duration_minutes,
      15, // 15-minute intervals
      BUFFER_MINUTES // Buffer time between appointments
    );

    // Check availability for each slot
    setCheckingAvailability(true);
    const dateString = format(date, "yyyy-MM-dd");
    
    try {
      // Get existing appointments for this date (excluding current appointment)
      const { data: appointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select("*, service:services(duration_minutes)")
        .eq("business_id", appointment.business_id)
        .eq("appointment_date", dateString)
        .in("status", ["pending", "confirmed"])
        .neq("id", appointment.id); // Exclude current appointment

      if (appointmentsError) throw appointmentsError;

      // Filter out slots that overlap with existing appointments (including buffer time)
      const available = slots.filter((slot) => {
        if (!appointments || appointments.length === 0) return true;

        // Check if this slot overlaps with any existing appointment (with buffer)
        const slotStart = new Date(`${dateString}T${slot}`);
        const slotEndWithBuffer = new Date(
          slotStart.getTime() + (service.duration_minutes + BUFFER_MINUTES) * 60 * 1000
        );

        return !appointments.some((apt) => {
          const aptStart = new Date(`${dateString}T${apt.appointment_time}`);
          const aptDuration = apt.service?.duration_minutes || 60;
          // Add buffer time before the appointment starts and after it ends
          const aptStartWithBuffer = new Date(aptStart.getTime() - BUFFER_MINUTES * 60 * 1000);
          const aptEndWithBuffer = new Date(aptStart.getTime() + (aptDuration + BUFFER_MINUTES) * 60 * 1000);

          // Check for overlap (with buffer time considered)
          return slotStart < aptEndWithBuffer && slotEndWithBuffer > aptStartWithBuffer;
        });
      });

      setAvailableTimeSlots(available);
    } catch (error) {
      toast({
        title: "Unable to Check Availability",
        description: "Please try selecting a different date or time.",
        variant: "destructive",
      });
      setAvailableTimeSlots([]);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof rescheduleSchema>) => {
    try {
      const dateString = format(values.appointmentDate, "yyyy-MM-dd");

      // Validate booking window
      const windowCheck = isBookingDateTimeValid(
        values.appointmentDate,
        values.appointmentTime,
        MIN_BOOKING_HOURS,
        MAX_BOOKING_DAYS
      );
      if (!windowCheck.valid) {
        toast({
          title: "Invalid Booking Time",
          description: windowCheck.reason || "Please select a valid booking time.",
          variant: "destructive",
        });
        return;
      }

      // Check for conflicts with buffer time (excluding current appointment)
      const { data: conflictingAppointments } = await supabase
        .from("appointments")
        .select("*, service:services(duration_minutes)")
        .eq("business_id", appointment.business_id)
        .eq("appointment_date", dateString)
        .in("status", ["pending", "confirmed"])
        .neq("id", appointment.id);

      // Check for conflicts with buffer time
      if (conflictingAppointments && conflictingAppointments.length > 0 && service) {
        const slotStart = new Date(`${dateString}T${values.appointmentTime}`);
        const slotEndWithBuffer = new Date(
          slotStart.getTime() + (service.duration_minutes + BUFFER_MINUTES) * 60 * 1000
        );

        const hasConflict = conflictingAppointments.some((apt) => {
          const aptStart = new Date(`${dateString}T${apt.appointment_time}`);
          const aptDuration = apt.service?.duration_minutes || 60;
          const aptStartWithBuffer = new Date(aptStart.getTime() - BUFFER_MINUTES * 60 * 1000);
          const aptEndWithBuffer = new Date(aptStart.getTime() + (aptDuration + BUFFER_MINUTES) * 60 * 1000);
          
          return slotStart < aptEndWithBuffer && slotEndWithBuffer > aptStartWithBuffer;
        });

        if (hasConflict) {
          toast({
            title: "Time Slot Unavailable",
            description: "This time slot is no longer available. Please select another time.",
            variant: "destructive",
          });
          await generateAvailableSlots(values.appointmentDate);
          return;
        }
      }

      // Update appointment
      const oldDate = appointment.appointment_date;
      const oldTime = appointment.appointment_time;

      await updateAppointment.mutateAsync({
        id: appointment.id,
        updates: {
          appointment_date: dateString,
          appointment_time: values.appointmentTime,
        },
      });

      // Send reschedule email notification
      const businessName = business?.business_name || appointment.business?.business_name || "Business";
      const serviceName = service?.name || appointment.service?.name || "Service";
      
      sendEmailNotification(
        appointment.customer_email,
        `Appointment Rescheduled - ${businessName}`,
        "booking_rescheduled",
        {
          customer_name: appointment.customer_name,
          business_name: businessName,
          service_name: serviceName,
          old_appointment_date: format(new Date(oldDate), "MMMM dd, yyyy"),
          old_appointment_time: format(new Date(`2000-01-01T${oldTime}`), "h:mm a"),
          new_appointment_date: format(values.appointmentDate, "MMMM dd, yyyy"),
          new_appointment_time: format(new Date(`2000-01-01T${values.appointmentTime}`), "h:mm a"),
          appointment_id: appointment.id,
        }
      ).catch(() => {
        // Silently fail - email sending is non-critical
      });

      toast({
        title: "Appointment Rescheduled!",
        description: `Your appointment has been rescheduled to ${format(values.appointmentDate, "MMMM dd, yyyy")} at ${format(new Date(`2000-01-01T${values.appointmentTime}`), "h:mm a")}.`,
      });

      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Reschedule Failed",
        description: error.message || "Failed to reschedule appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!service) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Service Not Found</DialogTitle>
            <DialogDescription>
              The service for this appointment is no longer available.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Select a new date and time for your appointment
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Current Appointment Info */}
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Current Appointment:</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(appointment.appointment_date), "MMMM dd, yyyy")} at{" "}
                {formatTime(appointment.appointment_time)}
              </p>
            </div>

            {/* Date Selection */}
            <FormField
              control={form.control}
              name="appointmentDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Select New Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setSelectedDate(date);
                        }}
                        disabled={(date) => {
                          // Disable past dates
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (date < today) return true;

                          // Disable dates if business is closed that day
                          const dayOfWeek = date.getDay();
                          const dayHours = hours.find((h) => h.day_of_week === dayOfWeek);
                          return dayHours?.is_closed ?? false;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time Selection */}
            {selectedDate && (
              <FormField
                control={form.control}
                name="appointmentTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select New Time *</FormLabel>
                    {checkingAvailability ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          Checking availability...
                        </span>
                      </div>
                    ) : availableTimeSlots.length === 0 ? (
                      <div className="py-4 text-center text-sm text-muted-foreground">
                        No available time slots for this date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                        {availableTimeSlots.map((slot) => (
                          <Button
                            key={slot}
                            type="button"
                            variant={field.value === slot ? "default" : "outline"}
                            onClick={() => field.onChange(slot)}
                            className="text-sm"
                          >
                            {formatTime(slot)}
                          </Button>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateAppointment.isPending || !selectedDate || !form.watch("appointmentTime")}
                className="flex-1"
              >
                {updateAppointment.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rescheduling...
                  </>
                ) : (
                  "Reschedule Appointment"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};


