import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useServices } from "@/hooks/useServices";
import { useBusinessHours } from "@/hooks/useBusinessHours";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomerReview } from "@/hooks/useReviews";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookingDialog } from "@/components/BookingDialog";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewsList } from "@/components/ReviewsList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Star, MapPin, Phone, Mail, Globe, Clock, Scissors } from "lucide-react";
import { AlertCircle } from "lucide-react";
import type { BusinessProfile } from "@/hooks/useBusinesses";
import barbershop1 from "@/assets/barbershop-1.jpg";
import salon2 from "@/assets/salon-2.jpg";
import salon3 from "@/assets/salon-3.jpg";
import salon4 from "@/assets/salon-4.jpg";

const defaultImages = [barbershop1, salon2, salon3, salon4];

const BusinessDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const { data: customerReview } = useCustomerReview(id, user?.id);

  const { data: business, isLoading, error } = useQuery({
    queryKey: ["business", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as BusinessProfile;
    },
    enabled: !!id,
  });

  const { services, isLoading: servicesLoading } = useServices(id);
  const { hours, isLoading: hoursLoading } = useBusinessHours(id);
  
  // Filter only active services for display
  const activeServices = services.filter((service) => service.is_active !== false);

  const getImage = () => {
    if (business?.cover_image_url) return business.cover_image_url;
    if (!business) return defaultImages[0];
    const index = parseInt(business.id.slice(-1), 16) % defaultImages.length;
    return defaultImages[index];
  };

  const fullAddress = business
    ? `${business.address}, ${business.city}${business.state ? `, ${business.state}` : ""}${business.zip_code ? ` ${business.zip_code}` : ""}`
    : "";

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

  const formatTime = (time: string) => {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  // Create a map of hours by day for easy lookup
  const hoursByDay = new Map(hours.map((h) => [h.day_of_week, h]));
  
  // Get all 7 days with their hours or default to closed
  const allDays = Array.from({ length: 7 }, (_, i) => {
    const hourData = hoursByDay.get(i);
    return {
      day: dayNames[i],
      dayOfWeek: i,
      openTime: hourData?.open_time || null,
      closeTime: hourData?.close_time || null,
      isClosed: hourData?.is_closed ?? (hourData === undefined),
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 sm:mb-6 text-sm sm:text-base touch-manipulation"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : error || !business ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Business not found or failed to load.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-8">
            {/* Hero Image */}
            <div className="relative h-48 sm:h-64 md:h-96 rounded-lg overflow-hidden">
              <img
                src={getImage()}
                alt={business.business_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* Business Info */}
            <div className="grid md:grid-cols-3 gap-4 sm:gap-8">
              <div className="md:col-span-2 space-y-4 sm:space-y-6">
                <div>
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    {business.logo_url && (
                      <img
                        src={business.logo_url}
                        alt={`${business.business_name} logo`}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border-2 border-border flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 break-words">{business.business_name}</h1>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        {business.rating && business.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-5 w-5 fill-accent text-accent" />
                            <span className="font-semibold">{business.rating.toFixed(1)}</span>
                            {business.total_reviews && business.total_reviews > 0 && (
                              <span className="text-sm">({business.total_reviews} reviews)</span>
                            )}
                          </div>
                        )}
                        <span className="capitalize">{business.business_type}</span>
                      </div>
                    </div>
                  </div>
                  {business.description && (
                    <p className="text-base sm:text-lg text-muted-foreground">{business.description}</p>
                  )}
                </div>

                <Card>
                  <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Contact Information</h2>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Address</p>
                          <p className="text-muted-foreground">{fullAddress}</p>
                        </div>
                      </div>
                      {business.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Phone</p>
                            <a href={`tel:${business.phone}`} className="text-muted-foreground hover:text-primary">
                              {business.phone}
                            </a>
                          </div>
                        </div>
                      )}
                      {business.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Email</p>
                            <a href={`mailto:${business.email}`} className="text-muted-foreground hover:text-primary">
                              {business.email}
                            </a>
                          </div>
                        </div>
                      )}
                      {business.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Website</p>
                            <a 
                              href={business.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary"
                            >
                              {business.website}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Business Hours
                    </h3>
                    {hoursLoading ? (
                      <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-6 w-full" />
                        ))}
                      </div>
                    ) : hours.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Business hours not set yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {allDays.map((day) => (
                          <div
                            key={day.dayOfWeek}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="font-medium">{day.day}</span>
                            {day.isClosed ? (
                              <span className="text-muted-foreground">Closed</span>
                            ) : day.openTime && day.closeTime ? (
                              <span className="text-muted-foreground">
                                {formatTime(day.openTime)} - {formatTime(day.closeTime)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Not set</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Scissors className="h-5 w-5" />
                      Services
                    </h3>
                    {servicesLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : activeServices.length === 0 ? (
                      <p className="text-sm text-muted-foreground mb-4">
                        No services available at this time.
                      </p>
                    ) : (
                      <div className="space-y-3 mb-4">
                        {activeServices.map((service) => (
                          <div
                            key={service.id}
                            className="flex items-start gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            {(service as any).image_url && (
                              <div className="flex-shrink-0">
                                <img
                                  src={(service as any).image_url}
                                  alt={service.name}
                                  className="w-20 h-20 rounded-lg object-cover border"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold">{service.name}</h4>
                                <span className="font-bold text-primary">
                                  {formatPrice(service.price)}
                                </span>
                              </div>
                              {service.description && (
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {service.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDuration(service.duration_minutes)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button 
                      className="w-full" 
                      disabled={activeServices.length === 0}
                      onClick={() => {
                        if (!user) {
                          // Show auth dialog or redirect to login
                          // For now, just open booking dialog which will handle auth check
                        }
                        setBookingDialogOpen(true);
                      }}
                    >
                      Book Appointment
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold mb-2">Reviews</h2>
                      {business.rating && business.rating > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-5 w-5 fill-accent text-accent" />
                            <span className="font-semibold text-lg">
                              {business.rating.toFixed(1)}
                            </span>
                          </div>
                          {business.total_reviews && business.total_reviews > 0 && (
                            <span className="text-muted-foreground">
                              ({business.total_reviews} {business.total_reviews === 1 ? "review" : "reviews"})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {user && !customerReview && (
                      <Button onClick={() => setReviewDialogOpen(true)}>
                        Write a Review
                      </Button>
                    )}
                    {user && customerReview && (
                      <Button variant="outline" onClick={() => setReviewDialogOpen(true)}>
                        Update Your Review
                      </Button>
                    )}
                  </div>
                  <ReviewsList businessId={id || ""} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {business && (
        <>
          <BookingDialog
            open={bookingDialogOpen}
            onOpenChange={setBookingDialogOpen}
            business={business}
          />
          <ReviewForm
            open={reviewDialogOpen}
            onOpenChange={setReviewDialogOpen}
            businessId={business.id}
          />
        </>
      )}

      <Footer />
    </div>
  );
};

export default BusinessDetail;

