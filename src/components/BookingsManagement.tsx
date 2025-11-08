import { useState, useEffect } from "react";
import { useAppointments, useUpdateAppointment, type AppointmentStatus } from "@/hooks/useAppointments";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { RescheduleDialog } from "@/components/RescheduleDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, User, Phone, Mail, Loader2, CheckCircle2, XCircle, CalendarX, CalendarClock, List, Grid } from "lucide-react";
import { format } from "date-fns";
import { sendEmailNotification } from "@/lib/sendEmail";
import { supabase } from "@/integrations/supabase/client";
import { AppointmentsCalendar } from "@/components/AppointmentsCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BookingsManagementProps {
  businessId: string;
}

const statusColors: Record<AppointmentStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  confirmed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  completed: "bg-green-500/10 text-green-700 dark:text-green-400",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const statusLabels: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const BookingsManagement = ({ businessId }: BookingsManagementProps) => {
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all");
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<AppointmentStatus | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");
  const [selectedCalendarAppointment, setSelectedCalendarAppointment] = useState<any | null>(null);
  
  const { businessProfile: business } = useBusinessProfile();

  const { data: appointments, isLoading } = useAppointments({
    businessId,
    ...(statusFilter !== "all" && { status: statusFilter }),
  });

  const updateAppointment = useUpdateAppointment();

  // The appointments data is already filtered by status in the hook, but we keep this for consistency
  const filteredAppointments = appointments || [];

  // Sort by date and time (most recent first for past, upcoming first for future)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
    const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
    return dateB.getTime() - dateA.getTime();
  });

  // Auto-complete past appointments
  useEffect(() => {
    const autoCompletePastAppointments = async () => {
      if (!appointments) return;
      
      const now = new Date();
      const pastAppointments = appointments.filter((apt) => {
        const aptDateTime = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
        return aptDateTime < now && 
               apt.status !== "completed" && 
               apt.status !== "cancelled";
      });

      if (pastAppointments.length > 0) {
        // Auto-complete past appointments
        for (const apt of pastAppointments) {
          try {
            await updateAppointment.mutateAsync({
              id: apt.id,
              updates: { status: "completed" },
            });
          } catch (error) {
            // Silently fail - will retry on next load
          }
        }
      }
    };

    autoCompletePastAppointments();
  }, [appointments, updateAppointment]);

  const handleStatusChange = async (appointmentId: string, status: AppointmentStatus, reason?: string) => {
    try {
      // Get appointment details before updating
      const appointment = appointments?.find((apt) => apt.id === appointmentId);
      if (!appointment) return;

      // Update appointment
      const updates: any = { status };
      if (reason && status === "cancelled") {
        updates.cancellation_reason = reason;
      }
      
      await updateAppointment.mutateAsync({
        id: appointmentId,
        updates,
      });

      // Send email notification based on status
      const service = appointment.service;
      const business = appointment.business;
      const appointmentDate = format(new Date(appointment.appointment_date), "MMMM dd, yyyy");
      const appointmentTime = format(new Date(`2000-01-01T${appointment.appointment_time}`), "h:mm a");

      let emailTemplate = "";
      let emailSubject = "";
      
      switch (status) {
        case "confirmed":
          emailTemplate = "booking_confirmation";
          emailSubject = `Appointment Confirmed - ${business?.business_name || "Business"}`;
          break;
        case "cancelled":
          emailTemplate = "booking_cancellation";
          emailSubject = `Appointment Cancelled - ${business?.business_name || "Business"}`;
          break;
        case "completed":
          // No email for completed status
          break;
        default:
          break;
      }

      if (emailTemplate && appointment.customer_email) {
        sendEmailNotification(
          appointment.customer_email,
          emailSubject,
          emailTemplate,
          {
            customer_name: appointment.customer_name,
            business_name: business?.business_name || "Business",
            service_name: service?.name || "Service",
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            appointment_id: appointment.id,
            ...(reason && { cancellation_reason: reason }),
          }
        ).catch(() => {
          // Silently fail - email sending is non-critical
        });
      }

      toast({
        title: "Status Updated",
        description: `Appointment status has been updated to ${statusLabels[status]}.`,
      });

      // Reset cancellation reason
      setCancellationReason("");
      setShowCancellationDialog(false);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update appointment status.",
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

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP");
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const isPastAppointment = (dateString: string, timeString: string) => {
    const appointmentDateTime = new Date(`${dateString}T${timeString}`);
    return appointmentDateTime < new Date();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>Manage your business appointments</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                variant={viewMode === "calendar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                className="h-8"
              >
                <Grid className="h-4 w-4 mr-2" />
                Calendar
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8"
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as AppointmentStatus | "all")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <CalendarX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No appointments found.</p>
          </div>
        ) : viewMode === "calendar" ? (
          <AppointmentsCalendar
            appointments={filteredAppointments}
            onAppointmentClick={(appointment) => {
              setSelectedCalendarAppointment(appointment);
              setSelectedAppointment(appointment.id);
              // Show appointment details or allow editing
              // For now, we'll just select it so it can be managed
            }}
          />
        ) : (
          <div className="space-y-4">
            {sortedAppointments.map((appointment) => {
              const service = appointment.service;
              const isPast = isPastAppointment(appointment.appointment_date, appointment.appointment_time);

              return (
                <Card key={appointment.id} className={isPast ? "opacity-75" : ""}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {service?.name || "Service"}
                          </h3>
                          <Badge className={statusColors[appointment.status]}>
                            {statusLabels[appointment.status]}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(appointment.appointment_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(appointment.appointment_time)}</span>
                            {service && (
                              <span className="ml-2">
                                ({formatDuration(service.duration_minutes)})
                              </span>
                            )}
                          </div>
                          {service && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">
                                {formatPrice(service.price)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Customer Information */}
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Customer Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{appointment.customer_name}</span>
                        </div>
                        {appointment.customer_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={`mailto:${appointment.customer_email}`}
                              className="text-primary hover:underline"
                            >
                              {appointment.customer_email}
                            </a>
                          </div>
                        )}
                        {appointment.customer_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={`tel:${appointment.customer_phone}`}
                              className="text-primary hover:underline"
                            >
                              {appointment.customer_phone}
                            </a>
                          </div>
                        )}
                      </div>
                        {appointment.notes && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Notes: </span>
                              {appointment.notes}
                            </p>
                          </div>
                        )}
                        {(appointment as any).cancellation_reason && (
                          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <p className="text-sm">
                              <span className="font-medium text-yellow-800 dark:text-yellow-200">Cancellation Reason: </span>
                              <span className="text-yellow-700 dark:text-yellow-300">{(appointment as any).cancellation_reason}</span>
                            </p>
                          </div>
                        )}
                      </div>

                    {/* Actions */}
                    {!isPast && appointment.status !== "cancelled" && (
                      <div className="border-t pt-4 mt-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAppointmentToReschedule(appointment);
                              setRescheduleDialogOpen(true);
                            }}
                          >
                            <CalendarClock className="mr-2 h-4 w-4" />
                            Reschedule
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Update Status:</span>
                          <Select
                            value={appointment.status}
                            onValueChange={(value) => {
                              const newStatusValue = value as AppointmentStatus;
                              setSelectedAppointment(appointment.id);
                              setNewStatus(newStatusValue);
                              
                              // Show cancellation dialog if cancelling
                              if (newStatusValue === "cancelled") {
                                setShowCancellationDialog(true);
                              } else {
                                // Direct update for other statuses
                                handleStatusChange(appointment.id, newStatusValue);
                              }
                            }}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Cancellation Dialog with Reason */}
        <AlertDialog
          open={showCancellationDialog && selectedAppointment !== null && newStatus === "cancelled"}
          onOpenChange={(open) => {
            if (!open) {
              setShowCancellationDialog(false);
              setSelectedAppointment(null);
              setNewStatus(null);
              setCancellationReason("");
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
              <AlertDialogDescription>
                Please provide a reason for cancelling this appointment. This will be sent to the customer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="cancellation-reason">Cancellation Reason *</Label>
              <Textarea
                id="cancellation-reason"
                placeholder="e.g., Service unavailable, schedule conflict..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="mt-2"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {cancellationReason.length}/500 characters
              </p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (selectedAppointment && newStatus && cancellationReason.trim()) {
                    handleStatusChange(selectedAppointment, newStatus, cancellationReason.trim());
                  } else {
                    toast({
                      title: "Reason Required",
                      description: "Please provide a cancellation reason.",
                      variant: "destructive",
                    });
                  }
                }}
                disabled={updateAppointment.isPending || !cancellationReason.trim()}
              >
                {updateAppointment.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Appointment"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Status Update Confirmation Dialog (for non-cancellation statuses) */}
        <AlertDialog
          open={selectedAppointment !== null && newStatus !== null && newStatus !== "cancelled" && !showCancellationDialog}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedAppointment(null);
              setNewStatus(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Update Appointment Status</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to change the status to{" "}
                <strong>{newStatus && statusLabels[newStatus]}</strong>?
                {newStatus === "confirmed" && " The customer will receive a confirmation email."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (selectedAppointment && newStatus) {
                    handleStatusChange(selectedAppointment, newStatus);
                    setSelectedAppointment(null);
                    setNewStatus(null);
                  }
                }}
                disabled={updateAppointment.isPending}
              >
                {updateAppointment.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reschedule Dialog */}
        {appointmentToReschedule && (
          <RescheduleDialog
            open={rescheduleDialogOpen}
            onOpenChange={(open) => {
              setRescheduleDialogOpen(open);
              if (!open) setAppointmentToReschedule(null);
            }}
            appointment={appointmentToReschedule}
            business={business || undefined}
          />
        )}

        {/* Calendar Appointment Detail Dialog */}
        <AlertDialog
          open={selectedCalendarAppointment !== null}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedCalendarAppointment(null);
              setSelectedAppointment(null);
            }
          }}
        >
          <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Appointment Details</AlertDialogTitle>
              <AlertDialogDescription>
                View and manage appointment information
              </AlertDialogDescription>
            </AlertDialogHeader>
            {selectedCalendarAppointment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Date</Label>
                    <p className="font-medium">
                      {format(new Date(selectedCalendarAppointment.appointment_date), "EEEE, MMMM dd, yyyy")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Time</Label>
                    <p className="font-medium">
                      {format(new Date(`2000-01-01T${selectedCalendarAppointment.appointment_time}`), "h:mm a")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <Badge className={statusColors[selectedCalendarAppointment.status]}>
                      {statusLabels[selectedCalendarAppointment.status]}
                    </Badge>
                  </div>
                  {selectedCalendarAppointment.service && (
                    <div>
                      <Label className="text-muted-foreground">Service</Label>
                      <p className="font-medium">{selectedCalendarAppointment.service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedCalendarAppointment.service.duration_minutes} min • {formatPrice(selectedCalendarAppointment.service.price)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="border-t pt-4">
                  <Label className="text-muted-foreground">Customer Information</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCalendarAppointment.customer_name || "N/A"}</span>
                    </div>
                    {selectedCalendarAppointment.customer_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${selectedCalendarAppointment.customer_email}`} className="text-primary hover:underline">
                          {selectedCalendarAppointment.customer_email}
                        </a>
                      </div>
                    )}
                    {selectedCalendarAppointment.customer_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${selectedCalendarAppointment.customer_phone}`} className="text-primary hover:underline">
                          {selectedCalendarAppointment.customer_phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                {selectedCalendarAppointment.notes && (
                  <div className="border-t pt-4">
                    <Label className="text-muted-foreground">Notes</Label>
                    <p className="mt-2 text-sm">{selectedCalendarAppointment.notes}</p>
                  </div>
                )}
                <div className="border-t pt-4 flex gap-3">
                  <Select
                    value={selectedCalendarAppointment.status}
                    onValueChange={(value) => {
                      const newStatusValue = value as AppointmentStatus;
                      setNewStatus(newStatusValue);
                      
                      if (newStatusValue === "cancelled") {
                        setShowCancellationDialog(true);
                      } else {
                        handleStatusChange(selectedCalendarAppointment.id, newStatusValue);
                        setSelectedCalendarAppointment(null);
                      }
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  {!isPastAppointment(selectedCalendarAppointment.appointment_date, selectedCalendarAppointment.appointment_time) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAppointmentToReschedule(selectedCalendarAppointment);
                        setRescheduleDialogOpen(true);
                        setSelectedCalendarAppointment(null);
                      }}
                    >
                      <CalendarClock className="mr-2 h-4 w-4" />
                      Reschedule
                    </Button>
                  )}
                </div>
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

