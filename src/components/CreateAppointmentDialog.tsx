import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useServices } from "@/hooks/useServices";
import { useBusinessHours } from "@/hooks/useBusinessHours";
import { useCreateAppointment, useAppointments } from "@/hooks/useAppointments";
import { useQueryClient } from "@tanstack/react-query";
import { format, addMinutes, parse } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { Loader2, CalendarIcon, Clock, User, Mail, Phone, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { BUFFER_MINUTES } from "@/lib/validation";
import { sendEmailNotification } from "@/lib/sendEmail";
import type { BusinessProfile } from "@/hooks/useBusinessProfile";

const appointmentSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  appointmentDate: z.date({
    required_error: "Please select a date",
  }),
  appointmentTime: z.string().min(1, "Please select a time"),
  customerName: z.string().min(2, "Customer name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email"),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: BusinessProfile;
  initialDate?: Date;
  initialTime?: string;
}

export const CreateAppointmentDialog = ({
  open,
  onOpenChange,
  business,
  initialDate,
  initialTime,
}: CreateAppointmentDialogProps) => {
  // All hooks must be called unconditionally at the top level
  // Use optional chaining to safely access business.id
  const { services, isLoading: servicesLoading } = useServices(business?.id || "");
  const { hours, isLoading: hoursLoading } = useBusinessHours(business?.id || "");
  const { data: existingAppointments } = useAppointments({
    businessId: business?.id || "",
  });
  const createAppointment = useCreateAppointment();
  const queryClient = useQueryClient();

  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      serviceId: "",
      appointmentDate: initialDate || undefined,
      appointmentTime: initialTime || "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      notes: "",
    },
  });

  const selectedService = services.find((s) => s.id === form.watch("serviceId"));
  const selectedDate = form.watch("appointmentDate");
  const selectedTime = form.watch("appointmentTime");

  // Generate available time slots - memoized with useCallback
  const generateAvailableSlots = useCallback(async (date: Date, serviceId: string) => {
    if (!date || !serviceId) {
      setAvailableTimeSlots([]);
      return;
    }

    setCheckingAvailability(true);
    try {
      const service = services?.find((s) => s.id === serviceId);
      if (!service) {
        setAvailableTimeSlots([]);
        setCheckingAvailability(false);
        return;
      }

      const dayOfWeek = date.getDay();
      const dayHours = hours?.find((h) => h.day_of_week === dayOfWeek);

      if (!dayHours || dayHours.is_closed) {
        setAvailableTimeSlots([]);
        setCheckingAvailability(false);
        return;
      }

      if (!dayHours.open_time || !dayHours.close_time) {
        setAvailableTimeSlots([]);
        setCheckingAvailability(false);
        return;
      }

      const slots: string[] = [];
      const [openHour, openMin] = dayHours.open_time.split(":").map(Number);
      const [closeHour, closeMin] = dayHours.close_time.split(":").map(Number);

      const openTime = new Date(date);
      openTime.setHours(openHour, openMin, 0, 0);
      const closeTime = new Date(date);
      closeTime.setHours(closeHour, closeMin, 0, 0);

      let currentTime = new Date(openTime);

      while (currentTime < closeTime) {
        const timeString = format(currentTime, "HH:mm");
        const slotEnd = addMinutes(currentTime, service.duration_minutes + BUFFER_MINUTES);

        // Check if slot conflicts with existing appointments
        const dateString = format(date, "yyyy-MM-dd");
        const conflicts = existingAppointments?.filter((apt) => {
          if (apt.appointment_date !== dateString) return false;
          if (apt.status === "cancelled" || apt.status === "completed") return false;

          const aptStart = parse(apt.appointment_time, "HH:mm:ss", new Date());
          const aptDuration = apt.service?.duration_minutes || 60;
          const aptEnd = addMinutes(aptStart, aptDuration + BUFFER_MINUTES);

          const slotStartTime = parse(timeString, "HH:mm", new Date());

          return (
            slotStartTime < aptEnd &&
            slotEnd > addMinutes(aptStart, -BUFFER_MINUTES)
          );
        });

        if (!conflicts || conflicts.length === 0) {
          slots.push(timeString);
        }

        currentTime = addMinutes(currentTime, 15); // 15-minute intervals
      }

      setAvailableTimeSlots(slots);
    } catch (error) {
      setAvailableTimeSlots([]);
      setError("Failed to generate available time slots. Please try again.");
      // Log error in development only
      if (import.meta.env.DEV) {
        console.error("Error generating slots:", error);
      }
    } finally {
      setCheckingAvailability(false);
    }
  }, [services, hours, existingAppointments]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      const resetDate = initialDate ? new Date(initialDate) : undefined;
      form.reset({
        serviceId: "",
        appointmentDate: resetDate,
        appointmentTime: initialTime || "",
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        notes: "",
      });
      // Reset available slots
      setAvailableTimeSlots([]);
      
      if (initialDate && selectedService) {
        // Auto-generate slots if date and service are provided
        const dateObj = initialDate instanceof Date ? initialDate : new Date(initialDate);
        setTimeout(() => {
          generateAvailableSlots(dateObj, selectedService.id);
        }, 100);
      }
    }
  }, [open, initialDate, initialTime, selectedService, form, generateAvailableSlots]);

  // Update slots when date or service changes
  useEffect(() => {
    const serviceId = form.watch("serviceId");
    const date = form.watch("appointmentDate");
    
    if (date && serviceId) {
      const service = services.find((s) => s.id === serviceId);
      if (service) {
        const dateToUse = date instanceof Date ? date : new Date(date);
        generateAvailableSlots(dateToUse, serviceId);
      }
    } else {
      setAvailableTimeSlots([]);
    }
  }, [form.watch("appointmentDate"), form.watch("serviceId"), services, generateAvailableSlots]);

  // Safety check (after all hooks)
  if (!business?.id) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              Business information is missing. Please refresh the page.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    );
  }

  const onSubmit = async (values: AppointmentFormData) => {
    setError(null);
    
    if (!selectedService) {
      const errorMsg = "Please select a service";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    if (!values.appointmentDate) {
      const errorMsg = "Please select a date";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    try {
      const dateString = format(values.appointmentDate, "yyyy-MM-dd");
      const timeString = values.appointmentTime;

      // Double-check for conflicts
      const conflicts = existingAppointments?.filter((apt) => {
        if (apt.appointment_date !== dateString) return false;
        if (apt.status === "cancelled" || apt.status === "completed") return false;
        if (apt.appointment_time.substring(0, 5) !== timeString) return false;
        return true;
      });

      if (conflicts && conflicts.length > 0) {
        toast({
          title: "Time Slot Unavailable",
          description: "This time slot is no longer available. Please select another time.",
          variant: "destructive",
        });
        await generateAvailableSlots(values.appointmentDate, values.serviceId);
        return;
      }

      // Create appointment (business owner creating for a customer)
      // Note: customer_id is required in the database, so we'll use the business owner's ID
      // but the customer_name/email/phone will be the actual customer
      const appointment = await createAppointment.mutateAsync({
        business_id: business.id,
        service_id: values.serviceId,
        customer_id: business.owner_id, // Required field, but customer info is in customer_name/email/phone
        appointment_date: dateString,
        appointment_time: timeString,
        customer_name: values.customerName,
        customer_email: values.customerEmail,
        customer_phone: values.customerPhone || null,
        notes: values.notes || null,
        status: "confirmed", // Auto-confirm appointments created by business
      });

      // Send confirmation email
      sendEmailNotification(
        values.customerEmail,
        `Appointment Confirmed - ${business.business_name}`,
        "booking_confirmation",
        {
          customer_name: values.customerName,
          business_name: business.business_name,
          service_name: selectedService.name,
          appointment_date: format(values.appointmentDate, "MMMM dd, yyyy"),
          appointment_time: format(parse(timeString, "HH:mm", new Date()), "h:mm a"),
        }
      ).catch(() => {
        // Silently fail - email is non-critical
      });

      // Invalidate appointments query to refresh the calendar
      queryClient.invalidateQueries({ queryKey: ["appointments", business.id] });

      toast({
        title: "Appointment Created",
        description: `Appointment created successfully for ${values.customerName}`,
      });

      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg = error?.message || error?.error?.message || "Failed to create appointment";
      setError(errorMsg);
      // Log error in development only
      if (import.meta.env.DEV) {
        console.error("Appointment creation error:", error);
      }
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const activeServices = services?.filter((s) => s.is_active !== false) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>Create New Appointment</DialogTitle>
          <DialogDescription>
            Schedule an appointment for a customer. Fill in the customer details and select a service, date, and time.
          </DialogDescription>
        </DialogHeader>

        {servicesLoading || hoursLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading services and hours...</span>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md mb-4">
                <p className="text-sm text-red-800 dark:text-red-200">
                  ⚠️ {error}
                </p>
              </div>
            )}

            {!servicesLoading && activeServices.length === 0 && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md mb-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ You need to create at least one active service before you can create appointments. 
                  Go to your Dashboard to add services.
                </p>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Generate time slots if date is already selected
                      const currentDate = form.getValues("appointmentDate");
                      if (currentDate) {
                        const dateToUse = currentDate instanceof Date ? currentDate : new Date(currentDate);
                        generateAvailableSlots(dateToUse, value);
                      } else if (initialDate) {
                        const dateToUse = initialDate instanceof Date ? initialDate : new Date(initialDate);
                        generateAvailableSlots(dateToUse, value);
                      }
                    }}
                    value={field.value || undefined}
                    disabled={activeServices.length === 0 || servicesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={activeServices.length === 0 ? "No services available" : "Select a service"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeServices.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No active services found
                        </div>
                      ) : (
                        activeServices.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - {service.duration_minutes} min - ${service.price}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the service the customer wants to book
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
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
                            if (date) {
                              field.onChange(date);
                              // Generate time slots if service is already selected
                              const currentServiceId = form.getValues("serviceId");
                              if (currentServiceId) {
                                generateAvailableSlots(date, currentServiceId);
                              }
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appointmentTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      disabled={!selectedDate || !selectedService || checkingAvailability}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time">
                            {checkingAvailability ? "Checking availability..." : "Select time"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {checkingAvailability ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            Checking availability...
                          </div>
                        ) : availableTimeSlots.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            {!selectedDate && !selectedService 
                              ? "Please select a date and service first" 
                              : !selectedDate 
                              ? "Please select a date first"
                              : !selectedService
                              ? "Please select a service first"
                              : "No available slots. Please select a different date or service."}
                          </div>
                        ) : (
                          availableTimeSlots.map((slot) => {
                            const [hours, minutes] = slot.split(":");
                            const hour = parseInt(hours);
                            const ampm = hour >= 12 ? "PM" : "AM";
                            const displayHour = hour % 12 || 12;
                            const timeDisplay = `${displayHour}:${minutes} ${ampm}`;
                            return (
                              <SelectItem key={slot} value={slot}>
                                {timeDisplay}
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <User className="inline h-4 w-4 mr-1" />
                      Customer Name
                    </FormLabel>
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
                    <FormLabel>
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
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
                  <FormLabel>
                    <FileText className="inline h-4 w-4 mr-1" />
                    Notes (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special requests or notes..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createAppointment.isPending || activeServices.length === 0}
              >
                {createAppointment.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Appointment"
                )}
              </Button>
            </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

