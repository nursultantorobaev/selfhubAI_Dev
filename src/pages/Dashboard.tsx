import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import ServicesManagement from "@/components/ServicesManagement";
import BusinessHoursManagement from "@/components/BusinessHoursManagement";
import { BookingsManagement } from "@/components/BookingsManagement";
import { BusinessAnalytics } from "@/components/BusinessAnalytics";
import { ImageUpload } from "@/components/ImageUpload";
import { AIBusinessSetup } from "@/components/AIBusinessSetup";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { US_STATES } from "@/lib/usStates";
import { filterCities } from "@/lib/usCities";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import { loadGoogleMaps } from "@/lib/loadGoogleMaps";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Edit,
  Plus,
  Sparkles,
  Calendar
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

const businessTypes = [
  { value: "salon", label: "Hair Salon" },
  { value: "barbershop", label: "Barbershop" },
  { value: "spa", label: "Spa" },
  { value: "nails", label: "Nail Salon" },
  { value: "massage", label: "Massage" },
  { value: "fitness", label: "Fitness" },
  { value: "beauty", label: "Beauty" },
  { value: "wellness", label: "Wellness" },
  { value: "other", label: "Other" },
] as const;

const businessSchema = z.object({
  business_name: z.string().min(2, "Business name must be at least 2 characters"),
  business_type: z.enum(["salon", "barbershop", "spa", "nails", "massage", "fitness", "beauty", "wellness", "other"]),
  description: z.string().optional(),
  address: z.string().min(5, "Please enter a valid address"),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  country: z.string().default("US"),
  phone: z.string().min(1, "Phone number is required").refine(
    (val) => {
      // Allow various phone formats, just check it has at least 10 digits
      const digits = val.replace(/\D/g, "");
      return digits.length >= 10;
    },
    { message: "Please enter a valid phone number (at least 10 digits)" }
  ),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  logo_url: z.string().optional(),
  cover_image_url: z.string().optional(),
});

type BusinessFormData = z.infer<typeof businessSchema>;

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { businessProfile, isLoading, hasBusiness, createBusiness, updateBusiness, deleteBusiness, isCreating, isUpdating, isDeleting } = useBusinessProfile();
  const [isEditing, setIsEditing] = useState(!hasBusiness);
  const [showAISetup, setShowAISetup] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  // Load Google Maps API on mount
  useEffect(() => {
    loadGoogleMaps()
      .then(() => {
        setGoogleMapsLoaded(true);
      })
      .catch((error) => {
        console.error("Failed to load Google Maps:", error);
      });
  }, []);
  

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      business_name: "",
      business_type: "salon",
      description: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      country: "US",
      phone: "",
      email: "",
      website: "",
      logo_url: "",
      cover_image_url: "",
    },
  });

  // Populate form when business profile loads
  useEffect(() => {
    if (businessProfile && !isEditing) {
      form.reset({
        business_name: businessProfile.business_name,
        business_type: businessProfile.business_type,
        description: businessProfile.description || "",
        address: businessProfile.address,
        city: businessProfile.city,
        state: businessProfile.state || "",
        zip_code: businessProfile.zip_code || "",
        country: businessProfile.country || "US",
        phone: businessProfile.phone,
        email: businessProfile.email || "",
        website: businessProfile.website || "",
        logo_url: businessProfile.logo_url || "",
        cover_image_url: businessProfile.cover_image_url || "",
      });
    }
  }, [businessProfile, form, isEditing]);

  const onSubmit = async (data: BusinessFormData) => {
    try {
      if (hasBusiness && businessProfile) {
        // Update existing business
        await updateBusiness({
          id: businessProfile.id,
          updates: {
            ...data,
            email: data.email || null,
            website: data.website || null,
            state: data.state || null,
            zip_code: data.zip_code || null,
            logo_url: data.logo_url || null,
            cover_image_url: data.cover_image_url || null,
          },
        });
        toast({
          title: "Business updated!",
          description: "Your business profile has been updated successfully.",
        });
        setIsEditing(false);
      } else {
        // Create new business
        const newBusiness = await createBusiness({
          ...data,
          email: data.email || null,
          website: data.website || null,
          state: data.state || null,
          zip_code: data.zip_code || null,
          logo_url: data.logo_url || null,
          cover_image_url: data.cover_image_url || null,
        } as any); // owner_id is added by the hook
        
        // Check if AI-generated services and hours exist
        const aiServices = (window as any).__aiGeneratedServices;
        const aiHours = (window as any).__aiGeneratedHours;
        
        // Create services and hours using Supabase directly since we need the business ID
        if (newBusiness && newBusiness.id) {
          if (aiServices && aiServices.length > 0) {
            // Create services from AI-generated data
            try {
              const { supabase } = await import("@/integrations/supabase/client");
              await Promise.all(
                aiServices.map((service: any) =>
                  supabase.from("services").insert({
                    business_id: newBusiness.id,
                    name: service.name,
                    description: service.description || null,
                    price: service.price,
                    duration_minutes: service.duration_minutes,
                    is_active: true,
                    image_url: null,
                  })
                )
              );
            } catch (error) {
              // Silently fail - services can be added manually
              // Could log to error tracking service in production
            }
          }
          
          if (aiHours && aiHours.length > 0) {
            // Create hours from AI-generated data
            try {
              const { supabase } = await import("@/integrations/supabase/client");
              const hoursToInsert = aiHours.map((hour: any) => ({
                business_id: newBusiness.id,
                day_of_week: hour.day_of_week,
                open_time: hour.open_time,
                close_time: hour.close_time,
                is_closed: hour.is_closed,
              }));
              await supabase.from("business_hours").insert(hoursToInsert);
            } catch (error) {
              // Silently fail - hours can be set manually
              // Could log to error tracking service in production
            }
          }
        }
        
        // Clear AI-generated data
        delete (window as any).__aiGeneratedServices;
        delete (window as any).__aiGeneratedHours;
        
        toast({
          title: "Business created!",
          description: aiServices || aiHours 
            ? "Your business has been listed with AI-generated services and hours."
            : "Your business has been listed successfully.",
        });
        setIsEditing(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save business profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAIGenerated = async (aiData: any) => {
    try {
      // Ensure we have minimum required fields
      if (!aiData.business_name) {
        toast({
          title: "Error",
          description: "AI did not generate a business name. Please try again or use manual form.",
          variant: "destructive",
        });
        return;
      }

      // Populate form with AI-generated data
      // Make sure required fields have defaults if missing
      form.reset({
        business_name: aiData.business_name || "My Business",
        business_type: (aiData.business_type || "other") as any,
        description: aiData.description || "",
        address: aiData.address || "123 Main Street", // Required field - provide default
        city: aiData.city || "New York", // Required field - provide default
        state: aiData.state || "",
        zip_code: aiData.zip_code || "",
        country: "US",
        phone: aiData.phone || "555-0000", // Required field - provide default
        email: aiData.email || "",
        website: aiData.website || "",
        logo_url: "",
        cover_image_url: "",
      });

      // Store AI-generated services and hours for later
      (window as any).__aiGeneratedServices = aiData.services || [];
      (window as any).__aiGeneratedHours = aiData.hours || [];

      // Close AI setup and ensure form is visible
      setShowAISetup(false);
      setIsEditing(true); // Ensure form is in edit mode
      
      toast({
        title: "Business Setup Loaded!",
        description: "Review the details below and click 'Create Business' to save. Services and hours will be added automatically.",
      });
    } catch (error: any) {
      console.error("Error loading AI-generated data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load AI-generated data. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to access your dashboard.
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your business profile</p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
        ) : hasBusiness && !isEditing ? (
          // View mode - show business profile
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      {businessProfile?.business_name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Your business is listed and visible to customers
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Business
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Business Type</p>
                    <p className="capitalize">{businessProfile?.business_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Phone
                    </p>
                    <p>{businessProfile?.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Address
                    </p>
                    <p>
                      {businessProfile?.address}, {businessProfile?.city}
                      {businessProfile?.state && `, ${businessProfile.state}`}
                      {businessProfile?.zip_code && ` ${businessProfile.zip_code}`}
                    </p>
                  </div>
                  {businessProfile?.email && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </p>
                      <p>{businessProfile.email}</p>
                    </div>
                  )}
                  {businessProfile?.website && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        Website
                      </p>
                      <a 
                        href={businessProfile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {businessProfile.website}
                      </a>
                    </div>
                  )}
                  {businessProfile?.description && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                      <p>{businessProfile.description}</p>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/business/${businessProfile?.id}`)}
                  >
                    View Business Page
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={async () => {
                      if (businessProfile && confirm("Are you sure you want to delete your business? This will also delete all services, hours, and bookings. This action cannot be undone.")) {
                        try {
                          await deleteBusiness(businessProfile.id);
                          toast({
                            title: "Business deleted",
                            description: "Your business has been deleted successfully.",
                          });
                        } catch (error: any) {
                          toast({
                            title: "Error",
                            description: error.message || "Failed to delete business.",
                            variant: "destructive",
                          });
                        }
                      }
                    }}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Business"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Services Management Section */}
            {hasBusiness && businessProfile && (
              <>
                <BusinessAnalytics businessId={businessProfile.id} />
                <ServicesManagement businessId={businessProfile.id} />
                <BusinessHoursManagement businessId={businessProfile.id} />
                <BookingsManagement businessId={businessProfile.id} />
                <Card>
                  <CardHeader>
                    <CardTitle>Calendar View</CardTitle>
                    <CardDescription>
                      View and manage all appointments in a calendar format
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => navigate("/calendar")} className="w-full">
                      <Calendar className="mr-2 h-4 w-4" />
                      Open Calendar
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        ) : (
          // Edit/Create mode - show form or AI setup
          <>
            {showAISetup && !hasBusiness ? (
              <AIBusinessSetup
                onBusinessGenerated={handleAIGenerated}
                onCancel={() => setShowAISetup(false)}
              />
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {hasBusiness ? (
                          <>
                            <Edit className="h-5 w-5" />
                            Edit Business Profile
                          </>
                        ) : (
                          <>
                            <Plus className="h-5 w-5" />
                            Create Your Business Profile
                          </>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {hasBusiness 
                          ? "Update your business information below"
                          : "Get started by adding your business details"}
                      </CardDescription>
                    </div>
                    {!hasBusiness && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAISetup(true)}
                        className="flex items-center gap-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        AI Quick Setup
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="business_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Elite Men's Grooming Studio" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="business_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select business type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {businessTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell customers about your business..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Describe your services and what makes your business unique
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Image Uploads */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="logo_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Logo</FormLabel>
                          <FormControl>
                            <ImageUpload
                              currentImageUrl={field.value}
                              onImageChange={field.onChange}
                              type="logo"
                              label="Upload Logo"
                              description="Upload your business logo (square image recommended)"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cover_image_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cover Image</FormLabel>
                          <FormControl>
                            <ImageUpload
                              currentImageUrl={field.value}
                              onImageChange={field.onChange}
                              type="cover"
                              label="Upload Cover Image"
                              description="Upload a cover image for your business page (wide image recommended)"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address *</FormLabel>
                          <FormControl>
                            {googleMapsLoaded ? (
                              <PlacesAutocomplete
                                value={field.value}
                                onChange={(value) => {
                                  field.onChange(value);
                                }}
                                onSelect={async (address) => {
                                  field.onChange(address);
                                  try {
                                    const results = await geocodeByAddress(address);
                                    const latLng = await getLatLng(results[0]);
                                    
                                    // Extract city and state from address components
                                    const addressComponents = results[0].address_components;
                                    const cityComponent = addressComponents.find(
                                      (component) => component.types.includes("locality")
                                    );
                                    const stateComponent = addressComponents.find(
                                      (component) => component.types.includes("administrative_area_level_1")
                                    );
                                    const zipComponent = addressComponents.find(
                                      (component) => component.types.includes("postal_code")
                                    );
                                    
                                    if (cityComponent) {
                                      form.setValue("city", cityComponent.long_name);
                                    }
                                    if (stateComponent) {
                                      form.setValue("state", stateComponent.short_name);
                                    }
                                    if (zipComponent) {
                                      form.setValue("zip_code", zipComponent.long_name);
                                    }
                                  } catch (error) {
                                    console.error("Error geocoding address:", error);
                                  }
                                }}
                              >
                              {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                <div className="relative">
                                  <Input
                                    {...getInputProps({
                                      placeholder: "125 Madison Avenue",
                                      className: "w-full",
                                    })}
                                  />
                                  {suggestions.length > 0 && (
                                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                                      {loading && (
                                        <div className="p-2 text-sm text-muted-foreground">Loading...</div>
                                      )}
                                      {suggestions.map((suggestion) => {
                                        const className = cn(
                                          "p-2 cursor-pointer hover:bg-accent text-sm",
                                          suggestion.active && "bg-accent"
                                        );
                                        return (
                                          <div
                                            {...getSuggestionItemProps(suggestion, { className })}
                                            key={suggestion.placeId}
                                          >
                                            {suggestion.description}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                              </PlacesAutocomplete>
                            ) : (
                              <Input
                                placeholder="125 Madison Avenue"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                disabled={!googleMapsLoaded}
                              />
                            )}
                          </FormControl>
                          <FormDescription>
                            Start typing your address and select from suggestions
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => {
                        const handleCityChange = (value: string) => {
                          field.onChange(value);
                          if (value.length >= 2) {
                            const filtered = filterCities(value);
                            setCitySuggestions(filtered);
                            setShowCitySuggestions(true);
                          } else {
                            setShowCitySuggestions(false);
                          }
                        };

                        return (
                          <FormItem className="flex flex-col">
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="New York"
                                  value={field.value}
                                  onChange={(e) => handleCityChange(e.target.value)}
                                  onFocus={() => {
                                    if (field.value && field.value.length >= 2) {
                                      const filtered = filterCities(field.value);
                                      setCitySuggestions(filtered);
                                      setShowCitySuggestions(true);
                                    }
                                  }}
                                  onBlur={() => {
                                    // Delay hiding suggestions to allow click
                                    setTimeout(() => setShowCitySuggestions(false), 200);
                                  }}
                                />
                                {showCitySuggestions && citySuggestions.length > 0 && (
                                  <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                                    {citySuggestions.map((city) => (
                                      <div
                                        key={city}
                                        className="p-2 cursor-pointer hover:bg-accent text-sm"
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          field.onChange(city);
                                          setShowCitySuggestions(false);
                                        }}
                                      >
                                        {city}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {US_STATES.map((state) => (
                                <SelectItem key={state.value} value={state.value}>
                                  {state.label} ({state.value})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zip_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="10016" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <PhoneInput
                              international
                              defaultCountry="US"
                              value={field.value}
                              onChange={(value) => field.onChange(value || "")}
                              placeholder="(555) 123-4567"
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="business@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input 
                            type="url" 
                            placeholder="https://www.example.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Include https:// in your URL
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button 
                      type="submit" 
                      disabled={isCreating || isUpdating}
                    >
                      {(isCreating || isUpdating) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {hasBusiness ? "Update Business" : "Create Business"}
                    </Button>
                    {hasBusiness && (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;

