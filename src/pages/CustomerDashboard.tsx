import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAppointments, useUpdateAppointment, useDeleteAppointment } from "@/hooks/useAppointments";
import { ReviewForm } from "@/components/ReviewForm";
import { RescheduleDialog } from "@/components/RescheduleDialog";
import { sendEmailNotification } from "@/lib/sendEmail";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  X,
  Loader2,
  CalendarX,
  MessageSquare,
  CalendarClock,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  confirmed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  completed: "bg-green-500/10 text-green-700 dark:text-green-400",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<any | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [businessToReview, setBusinessToReview] = useState<string | null>(null);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<any | null>(null);

  const { data: appointments, isLoading } = useAppointments({
    customerId: user?.id,
  });

  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();

  // Filter appointments by date
  const now = new Date();
  const upcoming = appointments?.filter((apt) => {
    const appointmentDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
    return appointmentDate >= now && apt.status !== "cancelled";
  }) || [];

  const past = appointments?.filter((apt) => {
    const appointmentDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
    return appointmentDate < now || apt.status === "cancelled";
  }) || [];

  // Calculate hours until appointment
  const getHoursUntilAppointment = (appointmentDate: string, appointmentTime: string): number => {
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    const now = new Date();
    const diffMs = appointmentDateTime.getTime() - now.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60));
  };

  // Check if cancellation is within 24 hours
  const isWithinCancellationWindow = (appointmentDate: string, appointmentTime: string): boolean => {
    const hoursUntil = getHoursUntilAppointment(appointmentDate, appointmentTime);
    return hoursUntil < 24;
  };

  const handleCancelClick = (appointment: any) => {
    setAppointmentToCancel(appointment);
    setCancellationReason("");
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!appointmentToCancel) return;

    if (!cancellationReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for cancelling.",
        variant: "destructive",
      });
      return;
    }

    try {
      const hoursUntil = getHoursUntilAppointment(
        appointmentToCancel.appointment_date,
        appointmentToCancel.appointment_time
      );
      const isLateCancellation = hoursUntil < 24;

      // Update appointment with cancellation reason
      await updateAppointment.mutateAsync({
        id: appointmentToCancel.id,
        updates: {
          status: "cancelled",
          cancellation_reason: cancellationReason.trim(),
        },
      });

      // Send cancellation email
      const business = appointmentToCancel.business;
      const service = appointmentToCancel.service;
      const appointmentDate = format(new Date(appointmentToCancel.appointment_date), "MMMM dd, yyyy");
      const appointmentTime = format(new Date(`2000-01-01T${appointmentToCancel.appointment_time}`), "h:mm a");

      sendEmailNotification(
        appointmentToCancel.customer_email,
        `Appointment Cancelled - ${business?.business_name || "Business"}`,
        "booking_cancellation",
        {
          customer_name: appointmentToCancel.customer_name,
          business_name: business?.business_name || "Business",
          service_name: service?.name || "Service",
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          cancellation_reason: cancellationReason.trim(),
          is_late_cancellation: isLateCancellation,
        }
      ).catch(() => {
        // Silently fail - email sending is non-critical
      });

      toast({
        title: "Appointment Cancelled",
        description: isLateCancellation
          ? "Your appointment has been cancelled. Note: Cancellations within 24 hours may be subject to the business's cancellation policy."
          : "Your appointment has been cancelled successfully.",
      });

      setCancelDialogOpen(false);
      setAppointmentToCancel(null);
      setCancellationReason("");
    } catch (error: any) {
      toast({
        title: "Cancel Failed",
        description: error.message || "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReviewClick = (businessId: string) => {
    setBusinessToReview(businessId);
    setReviewDialogOpen(true);
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

  const renderAppointmentCard = (appointment: any) => {
    const business = appointment.business;
    const service = appointment.service;
    const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const isPast = appointmentDate < now;
    const canReview = isPast && appointment.status === "completed" && appointment.status !== "cancelled";

    return (
      <Card key={appointment.id} className={cn(isPast && "opacity-75")}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg">{business?.business_name || "Business"}</h3>
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

          {/* Service Details */}
          {service && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="font-medium mb-1">{service.name}</p>
              {service.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {service.description}
                </p>
              )}
            </div>
          )}

          {/* Business Info */}
          {business && (
            <div className="mb-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{business.address}, {business.city}</span>
              </div>
              {business.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${business.phone}`}
                    className="text-primary hover:underline"
                  >
                    {business.phone}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/business/${appointment.business_id}`)}
            >
              View Business
            </Button>
            {!isPast && appointment.status !== "cancelled" && (
              <>
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
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleCancelClick(appointment)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </>
            )}
            {canReview && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReviewClick(appointment.business_id)}
              >
                <Star className="mr-2 h-4 w-4" />
                Write Review
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your bookings.
          </p>
          <Button onClick={() => navigate("/")}>Go to Homepage</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">
            Manage your appointments and view your booking history
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upcoming" | "past")}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="upcoming">
                Upcoming ({upcoming.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({past.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-6">
              {upcoming.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CalendarX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Upcoming Appointments</h3>
                    <p className="text-muted-foreground mb-6">
                      You don't have any upcoming appointments.
                    </p>
                    <Button onClick={() => navigate("/")}>
                      Browse Businesses
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcoming.map(renderAppointmentCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-6">
              {past.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CalendarX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Past Appointments</h3>
                    <p className="text-muted-foreground">
                      Your completed appointments will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {past.map(renderAppointmentCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={(open) => {
        setCancelDialogOpen(open);
        if (!open) {
          setAppointmentToCancel(null);
          setCancellationReason("");
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              {appointmentToCancel && isWithinCancellationWindow(
                appointmentToCancel.appointment_date,
                appointmentToCancel.appointment_time
              ) ? (
                <div className="space-y-2">
                  <p className="font-semibold text-yellow-600 dark:text-yellow-400">
                    ⚠️ Late Cancellation Notice
                  </p>
                  <p>
                    You are cancelling within 24 hours of your appointment. This may be subject to the business's cancellation policy.
                  </p>
                </div>
              ) : (
                "Please provide a reason for cancelling this appointment."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="customer-cancellation-reason">Cancellation Reason *</Label>
            <Textarea
              id="customer-cancellation-reason"
              placeholder="e.g., Schedule conflict, change of plans..."
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
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Cancellation Policy:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Cancellations made 24+ hours in advance: Full refund/credit</li>
              <li>Cancellations made within 24 hours: Subject to business policy</li>
              <li>No-shows: No refund</li>
            </ul>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              disabled={updateAppointment.isPending || !cancellationReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

      {/* Review Dialog */}
      {businessToReview && (
        <ReviewForm
          open={reviewDialogOpen}
          onOpenChange={(open) => {
            setReviewDialogOpen(open);
            if (!open) setBusinessToReview(null);
          }}
          businessId={businessToReview}
        />
      )}

      {/* Reschedule Dialog */}
      {appointmentToReschedule && (
        <RescheduleDialog
          open={rescheduleDialogOpen}
          onOpenChange={(open) => {
            setRescheduleDialogOpen(open);
            if (!open) setAppointmentToReschedule(null);
          }}
          appointment={appointmentToReschedule}
        />
      )}

      <Footer />
    </div>
  );
}

