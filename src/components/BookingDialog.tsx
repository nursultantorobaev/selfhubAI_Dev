import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useServices } from "@/hooks/useServices";
import { useBusinessHours } from "@/hooks/useBusinessHours";
import { useCreateAppointment, generateTimeSlots } from "@/hooks/useAppointments";
import { supabase } from "@/integrations/supabase/client";
import { sendEmailNotification } from "@/lib/sendEmail";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { Loader2, CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  isValidPhoneNumber,
  isWithinBookingWindow,
  isBookingDateTimeValid,
  getMinimumBookingTime,
  getMaximumBookingTime,
} from "@/lib/validation";
import type { BusinessProfile } from "@/hooks/useBusinesses";

// Configuration constants
const MIN_BOOKING_HOURS = 2; // Minimum 2 hours in advance
const MAX_BOOKING_DAYS = 90; // Maximum 90 days ahead
const BUFFER_MINUTES = 15; // 15 minutes buffer between appointments
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const MAX_PHONE_LENGTH = 20;
const MAX_NOTES_LENGTH = 500;

const bookingSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  appointmentDate: z.date({
    required_error: "Please select a date",
  }),
  appointmentTime: z.string().min(1, "Please select a time"),
  customerName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(MAX_NAME_LENGTH, `Name must be less than ${MAX_NAME_LENGTH} characters`),
  customerEmail: z
    .string()
    .email("Please enter a valid email address")
    .max(MAX_EMAIL_LENGTH, `Email must be less than ${MAX_EMAIL_LENGTH} characters`),
  customerPhone: z
    .string()
    .optional()
    .refine((phone) => !phone || isValidPhoneNumber(phone), {
      message: "Please enter a valid phone number",
    })
    .refine((phone) => !phone || phone.length <= MAX_PHONE_LENGTH, {
      message: `Phone number must be less than ${MAX_PHONE_LENGTH} characters`,
    }),
  notes: z
    .string()
    .optional()
    .refine((notes) => !notes || notes.length <= MAX_NOTES_LENGTH, {
      message: `Notes must be less than ${MAX_NOTES_LENGTH} characters`,
    }),
})
  .refine((data) => {
    // Validate that the selected date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return data.appointmentDate >= today;
  }, {
    message: "Please select a date in the future",
    path: ["appointmentDate"],
  })
  .refine((data) => {
    // Validate booking window (minimum hours in advance, maximum days ahead)
    // For date-only validation, we check if date is at least minHours from start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(data.appointmentDate);
    selectedDate.setHours(0, 0, 0, 0);
    
    // If same day, we'll validate time later
    if (selectedDate.getTime() === today.getTime()) {
      return true; // Time validation will happen in another refine
    }
    
    const windowCheck = isWithinBookingWindow(data.appointmentDate, MIN_BOOKING_HOURS, MAX_BOOKING_DAYS);
    return windowCheck.valid;
  }, (data) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(data.appointmentDate);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate.getTime() === today.getTime()) {
      return { message: "", path: ["appointmentDate"] }; // Will validate with time
    }
    
    const windowCheck = isWithinBookingWindow(data.appointmentDate, MIN_BOOKING_HOURS, MAX_BOOKING_DAYS);
    return {
      message: windowCheck.reason || "Invalid booking date",
      path: ["appointmentDate"],
    };
  })
  .refine((data) => {
    // Validate that date + time combination is valid (for same-day bookings)
    if (!data.appointmentTime) return true; // Time validation will catch this
    
    const timeCheck = isBookingDateTimeValid(
      data.appointmentDate,
      data.appointmentTime,
      MIN_BOOKING_HOURS,
      MAX_BOOKING_DAYS
    );
    return timeCheck.valid;
  }, (data) => {
    if (!data.appointmentTime) {
      return { message: "Please select a time", path: ["appointmentTime"] };
    }
    
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

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: BusinessProfile;
}

export const BookingDialog = ({ open, onOpenChange, business }: BookingDialogProps) => {
  const { user, profile } = useAuth();
  const { services, isLoading: servicesLoading } = useServices(business.id);
  const { hours } = useBusinessHours(business.id);
  const createAppointment = useCreateAppointment();

  // All hooks must be called unconditionally at the top level
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: "",
      appointmentDate: undefined,
      appointmentTime: "",
      customerName: profile?.full_name || "",
      customerEmail: user?.email || "",
      customerPhone: profile?.phone || "",
      notes: "",
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && user) {
      form.reset({
        serviceId: "",
        appointmentDate: undefined,
        appointmentTime: "",
        customerName: profile?.full_name || "",
        customerEmail: user?.email || "",
        customerPhone: profile?.phone || "",
        notes: "",
      });
      setSelectedService("");
      setSelectedDate(undefined);
      setAvailableTimeSlots([]);
    }
  }, [open, user, profile, form]);

  // When service changes, reset time selection
  useEffect(() => {
    if (selectedService) {
      form.setValue("appointmentTime", "");
      setAvailableTimeSlots([]);
    }
  }, [selectedService, form]);

  // When date changes, generate available time slots
  useEffect(() => {
    const date = form.watch("appointmentDate");
    if (!date || !selectedService) {
      setAvailableTimeSlots([]);
      return;
    }

    setSelectedDate(date);
    generateAvailableSlots(date, selectedService);
  }, [form.watch("appointmentDate"), selectedService]);

  // Validate business is active (after all hooks)
  if (!business.is_active) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Business Unavailable</DialogTitle>
            <DialogDescription>
              This business is currently not accepting new bookings.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    );
  }

  // Filter active services
  const activeServices = services.filter((s) => s.is_active !== false);

  const generateAvailableSlots = async (date: Date, serviceId: string) => {
    if (!date || !serviceId) return;

    const service = activeServices.find((s) => s.id === serviceId);
    if (!service) return;

    // Validate service is still active
    if (service.is_active === false) {
      setAvailableTimeSlots([]);
      toast({
        title: "Service Unavailable",
        description: "This service is no longer available. Please select another service.",
        variant: "destructive",
      });
      return;
    }

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
      // Get existing appointments for this date
      const { data: appointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select("*, service:services(duration_minutes)")
        .eq("business_id", business.id)
        .eq("appointment_date", dateString)
        .in("status", ["pending", "confirmed"]);

      if (appointmentsError) throw appointmentsError;

      // Filter out slots that overlap with existing appointments (including buffer time)
      const available = slots.filter((slot) => {
        if (!appointments || appointments.length === 0) return true;

        // Check if this slot overlaps with any existing appointment (with buffer)
        const slotStart = new Date(`${dateString}T${slot}`);
        // Add buffer time to the end of the slot
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
      // Error handling - don't expose technical details to user
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

  const onSubmit = async (values: z.infer<typeof bookingSchema>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book an appointment.",
        variant: "destructive",
      });
      return;
    }

    try {
      const dateString = format(values.appointmentDate, "yyyy-MM-dd");

      // Validate business is still active
      if (!business.is_active) {
        toast({
          title: "Business Unavailable",
          description: "This business is no longer accepting bookings.",
          variant: "destructive",
        });
        return;
      }

      // Validate service is still active
      const service = activeServices.find((s) => s.id === values.serviceId);
      if (!service || service.is_active === false) {
        toast({
          title: "Service Unavailable",
          description: "The selected service is no longer available. Please select another service.",
          variant: "destructive",
        });
        return;
      }

      // Validate booking window (date + time combination)
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

      const { data: conflictingAppointments } = await supabase
        .from("appointments")
        .select("*, service:services(duration_minutes)")
        .eq("business_id", business.id)
        .eq("appointment_date", dateString)
        .in("status", ["pending", "confirmed"]);

      // Check for conflicts with buffer time
      if (conflictingAppointments && conflictingAppointments.length > 0) {
        const slotStart = new Date(`${dateString}T${values.appointmentTime}`);
        const slotEndWithBuffer = new Date(
          slotStart.getTime() + (service.duration_minutes + BUFFER_MINUTES) * 60 * 1000
        );

        const hasConflict = conflictingAppointments.some((apt) => {
          const aptStart = new Date(`${dateString}T${apt.appointment_time}`);
          const aptDuration = apt.service?.duration_minutes || 60;
          // Add buffer time before and after appointment
          const aptStartWithBuffer = new Date(aptStart.getTime() - BUFFER_MINUTES * 60 * 1000);
          const aptEndWithBuffer = new Date(aptStart.getTime() + (aptDuration + BUFFER_MINUTES) * 60 * 1000);
          
          // Check for overlap with buffer time
          return slotStart < aptEndWithBuffer && slotEndWithBuffer > aptStartWithBuffer;
        });

        if (hasConflict) {
          toast({
            title: "Time Slot Unavailable",
            description: "This time slot is no longer available. Please select another time.",
            variant: "destructive",
          });
          // Refresh available slots
          await generateAvailableSlots(values.appointmentDate, values.serviceId);
          return;
        }
      }

      const appointment = await createAppointment.mutateAsync({
        business_id: business.id,
        service_id: values.serviceId,
        customer_id: user.id,
        appointment_date: dateString,
        appointment_time: values.appointmentTime,
        customer_name: values.customerName,
        customer_email: values.customerEmail,
        customer_phone: values.customerPhone || null,
        notes: values.notes || null,
        status: "pending",
      });

      // Track booking in analytics
      const { trackBooking } = await import("@/lib/analytics");
      trackBooking({
        business_id: business.id,
        service_id: service.id,
        value: service.price,
        currency: "USD",
      });

      // Send confirmation email to customer (non-blocking)
      sendEmailNotification(
        values.customerEmail,
        `Booking Confirmation - ${business.business_name}`,
        "booking_confirmation",
        {
          customer_name: values.customerName,
          business_name: business.business_name,
          service_name: service.name,
          appointment_date: format(values.appointmentDate, "MMMM dd, yyyy"),
          appointment_time: format(new Date(`2000-01-01T${values.appointmentTime}`), "h:mm a"),
          appointment_id: appointment.id,
        }
      ).catch(() => {
        // Silently fail - email sending is non-critical
        // Could log to error tracking service in production
      });

      toast({
        title: "Appointment Booked!",
        description: "Your appointment has been booked successfully. You'll receive a confirmation email shortly.",
      });

      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      // User-friendly error messages
      let errorMessage = "Failed to book appointment. Please try again.";
      
      if (error.message?.includes("duplicate") || error.message?.includes("unique")) {
        errorMessage = "This time slot was just booked by someone else. Please select another time.";
      } else if (error.message?.includes("is_active")) {
        errorMessage = "The business or service is no longer available.";
      } else if (error.message) {
        // Use error message if it's user-friendly, otherwise use generic
        errorMessage = error.message.length < 100 ? error.message : errorMessage;
      }
      
      toast({
        title: "Booking Failed",
        description: errorMessage,
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book an Appointment</DialogTitle>
          <DialogDescription>
            Book an appointment with {business.business_name}
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Please sign in to book an appointment.
            </p>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Service Selection */}
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Service *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedService(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {servicesLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading services...
                          </SelectItem>
                        ) : activeServices.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No services available
                          </SelectItem>
                        ) : (
                          activeServices.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{service.name}</span>
                                <span className="ml-4 text-sm text-muted-foreground">
                                  {formatPrice(service.price)} • {formatDuration(service.duration_minutes)}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date Selection */}
              <FormField
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Select Date *</FormLabel>
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

                            // Disable dates outside booking window
                            const windowCheck = isWithinBookingWindow(date, MIN_BOOKING_HOURS, MAX_BOOKING_DAYS);
                            if (!windowCheck.valid) return true;

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
              {selectedService && selectedDate && (
                <FormField
                  control={form.control}
                  name="appointmentTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Time *</FormLabel>
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

              {/* Customer Information */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">Your Information</h3>

                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any special requests or notes..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Cancellation Policy */}
              <div className="pt-4 border-t">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Cancellation Policy:</p>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Cancellations made 24+ hours in advance: Full refund/credit</li>
                    <li>Cancellations made within 24 hours: Subject to business policy</li>
                    <li>No-shows: No refund</li>
                    <li>You can reschedule or cancel anytime from your dashboard</li>
                  </ul>
                </div>
              </div>

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
                  disabled={createAppointment.isPending || !selectedService || !selectedDate}
                  className="flex-1"
                >
                  {createAppointment.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    "Book Appointment"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

