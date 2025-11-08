import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { useAppointments, useUpdateAppointment, type AppointmentStatus } from "@/hooks/useAppointments";
import { AppointmentsCalendar } from "@/components/AppointmentsCalendar";
import { RescheduleDialog } from "@/components/RescheduleDialog";
import { CreateAppointmentDialog } from "@/components/CreateAppointmentDialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { CalendarX, Loader2, CalendarClock, User, Phone, Mail, Plus } from "lucide-react";
import { format } from "date-fns";
import { sendEmailNotification } from "@/lib/sendEmail";

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

export default function Calendar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { businessProfile, hasBusiness, isLoading: businessLoading } = useBusinessProfile();
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all");
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<AppointmentStatus | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<any | null>(null);
  const [createAppointmentDialogOpen, setCreateAppointmentDialogOpen] = useState(false);
  const [createAppointmentDate, setCreateAppointmentDate] = useState<Date | undefined>(undefined);
  const [createAppointmentTime, setCreateAppointmentTime] = useState<string | undefined>(undefined);

  const { data: appointments, isLoading: appointmentsLoading } = useAppointments({
    businessId: businessProfile?.id,
    ...(statusFilter !== "all" && { status: statusFilter }),
  });

  const updateAppointment = useUpdateAppointment();

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

  const handleStatusChange = async (
    appointmentId: string,
    newStatus: AppointmentStatus,
    reason?: string
  ) => {
    try {
      const appointment = appointments?.find((apt) => apt.id === appointmentId);
      if (!appointment) return;

      await updateAppointment.mutateAsync({
        id: appointmentId,
        updates: {
          status: newStatus,
          ...(reason && { cancellation_reason: reason }),
        },
      });

      // Send email notification for status changes
      if (appointment.customer_email) {
        const emailType =
          newStatus === "confirmed"
            ? "booking_confirmation"
            : newStatus === "cancelled"
            ? "booking_cancellation"
            : undefined;

        if (emailType) {
          sendEmailNotification(
            appointment.customer_email,
            newStatus === "confirmed"
              ? `Appointment Confirmed - ${businessProfile?.business_name}`
              : `Appointment Cancelled - ${businessProfile?.business_name}`,
            emailType,
            {
              customer_name: appointment.customer_name || "Customer",
              business_name: businessProfile?.business_name || "Business",
              service_name: appointment.service?.name || "Service",
              appointment_date: format(
                new Date(appointment.appointment_date),
                "MMMM dd, yyyy"
              ),
              appointment_time: format(
                new Date(`2000-01-01T${appointment.appointment_time}`),
                "h:mm a"
              ),
              cancellation_reason: reason || undefined,
              is_late_cancellation: false,
            }
          ).catch(() => {
            // Silently fail - email is non-critical
          });
        }
      }

      toast({
        title: "Status Updated",
        description: `Appointment status changed to ${statusLabels[newStatus]}`,
      });

      setSelectedAppointment(null);
      setNewStatus(null);
      setShowCancellationDialog(false);
      setCancellationReason("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  if (businessLoading || appointmentsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your calendar.
          </p>
          <Button onClick={() => navigate("/")}>Go to Homepage</Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!hasBusiness || !businessProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Business Profile Required</h1>
          <p className="text-muted-foreground mb-6">
            You need to create a business profile first to view your calendar.
          </p>
          <Button onClick={() => navigate("/business/dashboard")}>Go to Dashboard</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const filteredAppointments = appointments || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl">Appointments Calendar</CardTitle>
                <CardDescription className="text-sm sm:text-base mt-1 sm:mt-2">
                  View and manage all your appointments in calendar format. Click a date to create a new appointment.
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as AppointmentStatus | "all")}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
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
                <Button 
                  onClick={() => {
                    setCreateAppointmentDate(undefined);
                    setCreateAppointmentTime(undefined);
                    setCreateAppointmentDialogOpen(true);
                  }}
                  className="w-full sm:w-auto touch-manipulation"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Appointment
                </Button>
                <Button variant="outline" onClick={() => navigate("/business/dashboard")}>
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <CalendarX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No appointments found.</p>
              </div>
            ) : (
              <AppointmentsCalendar
                appointments={filteredAppointments}
                onAppointmentClick={(appointment) => {
                  setSelectedAppointment(appointment);
                  setNewStatus(null);
                }}
                onCreateAppointment={(date, time) => {
                  setCreateAppointmentDate(date);
                  setCreateAppointmentTime(time);
                  setCreateAppointmentDialogOpen(true);
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Cancellation Dialog */}
        <AlertDialog
          open={showCancellationDialog && selectedAppointmentId !== null && newStatus === "cancelled"}
          onOpenChange={(open) => {
            if (!open) {
              setShowCancellationDialog(false);
              setSelectedAppointmentId(null);
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
                  if (selectedAppointmentId && newStatus && cancellationReason.trim()) {
                    handleStatusChange(selectedAppointmentId, newStatus, cancellationReason.trim());
                    setSelectedAppointmentId(null);
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

        {/* Status Update Confirmation Dialog */}
        <AlertDialog
          open={selectedAppointmentId !== null && newStatus !== null && newStatus !== "cancelled" && !showCancellationDialog}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedAppointmentId(null);
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
                  if (selectedAppointmentId && newStatus) {
                    handleStatusChange(selectedAppointmentId, newStatus);
                    setSelectedAppointmentId(null);
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

        {/* Appointment Detail Dialog */}
        <AlertDialog
          open={selectedAppointment !== null}
          onOpenChange={(open) => {
            if (!open) {
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
            {selectedAppointment && (() => {
              const appointment = selectedAppointment;
              if (!appointment) return null;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Date</Label>
                      <p className="font-medium">
                        {format(new Date(appointment.appointment_date), "EEEE, MMMM dd, yyyy")}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Time</Label>
                      <p className="font-medium">
                        {format(new Date(`2000-01-01T${appointment.appointment_time}`), "h:mm a")}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <Badge className={statusColors[appointment.status]}>
                        {statusLabels[appointment.status]}
                      </Badge>
                    </div>
                    {appointment.service && (
                      <div>
                        <Label className="text-muted-foreground">Service</Label>
                        <p className="font-medium">{appointment.service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.service.duration_minutes} min • {formatPrice(appointment.service.price)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="border-t pt-4">
                    <Label className="text-muted-foreground">Customer Information</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{appointment.customer_name || "N/A"}</span>
                      </div>
                      {appointment.customer_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${appointment.customer_email}`} className="text-primary hover:underline">
                            {appointment.customer_email}
                          </a>
                        </div>
                      )}
                      {appointment.customer_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${appointment.customer_phone}`} className="text-primary hover:underline">
                            {appointment.customer_phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  {appointment.notes && (
                    <div className="border-t pt-4">
                      <Label className="text-muted-foreground">Notes</Label>
                      <p className="mt-2 text-sm">{appointment.notes}</p>
                    </div>
                  )}
                  <div className="border-t pt-4 flex gap-3">
                    <Select
                      value={appointment.status}
                      onValueChange={(value) => {
                        const newStatusValue = value as AppointmentStatus;
                        setNewStatus(newStatusValue);
                        setSelectedAppointmentId(appointment.id);
                        
                        if (newStatusValue === "cancelled") {
                          setShowCancellationDialog(true);
                        } else {
                          handleStatusChange(appointment.id, newStatusValue);
                          setSelectedAppointment(null);
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
                    {!isPastAppointment(appointment.appointment_date, appointment.appointment_time) && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAppointmentToReschedule(appointment);
                          setRescheduleDialogOpen(true);
                          setSelectedAppointment(null);
                        }}
                      >
                        <CalendarClock className="mr-2 h-4 w-4" />
                        Reschedule
                      </Button>
                    )}
                  </div>
                </div>
              );
            })()}
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
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
            business={businessProfile || undefined}
          />
        )}

        {/* Create Appointment Dialog */}
        {businessProfile && (
          <CreateAppointmentDialog
            open={createAppointmentDialogOpen}
            onOpenChange={(open) => {
              setCreateAppointmentDialogOpen(open);
              if (!open) {
                setCreateAppointmentDate(undefined);
                setCreateAppointmentTime(undefined);
              }
            }}
            business={businessProfile}
            initialDate={createAppointmentDate}
            initialTime={createAppointmentTime}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}

