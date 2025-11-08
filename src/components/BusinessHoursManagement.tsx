import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useBusinessHours } from "@/hooks/useBusinessHours";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Loader2, Clock, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const hoursSchema = z.object({
  hours: z.array(
    z.object({
      day_of_week: z.number().min(0).max(6),
      open_time: z.string().optional(),
      close_time: z.string().optional(),
      is_closed: z.boolean(),
    }).refine(
      (hour) => {
        // If closed, time validation is not required
        if (hour.is_closed) return true;
        // If open, times must be provided
        return !!hour.open_time && !!hour.close_time;
      },
      {
        message: "Open and close times are required when day is open",
      }
    )
  ),
}).refine(
  (data) => {
    // Validate that close_time is after open_time when not closed
    return data.hours.every((hour) => {
      if (hour.is_closed) return true;
      if (!hour.open_time || !hour.close_time) return false;
      return hour.close_time > hour.open_time;
    });
  },
  {
    message: "Close time must be after open time",
    path: ["hours"],
  }
);

type HoursFormData = z.infer<typeof hoursSchema>;

interface BusinessHoursManagementProps {
  businessId: string | null | undefined;
}

const BusinessHoursManagement = ({ businessId }: BusinessHoursManagementProps) => {
  const { hours, isLoading, upsertHours, isSaving } = useBusinessHours(businessId);
  const [hasChanges, setHasChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form with all 7 days
  const defaultHours = Array.from({ length: 7 }, (_, i) => ({
    day_of_week: i,
    open_time: "09:00",
    close_time: "17:00",
    is_closed: i === 0, // Sunday closed by default
  }));

  const form = useForm<HoursFormData>({
    resolver: zodResolver(hoursSchema),
    defaultValues: {
      hours: defaultHours,
    },
  });

  // Populate form when hours load
  useEffect(() => {
    if (hours.length > 0) {
      // Create a map of existing hours by day
      const hoursMap = new Map(hours.map((h) => [h.day_of_week, h]));
      
      // Fill in all 7 days, using existing data or defaults
      const allHours = Array.from({ length: 7 }, (_, i) => {
        const existing = hoursMap.get(i);
        return existing
          ? {
              day_of_week: i,
              open_time: existing.open_time,
              close_time: existing.close_time,
              is_closed: existing.is_closed ?? false,
            }
          : {
              day_of_week: i,
              open_time: "09:00",
              close_time: "17:00",
              is_closed: true,
            };
      });

      form.reset({ hours: allHours });
      setHasChanges(false);
      setIsInitialized(true);
    } else if (!isLoading) {
      // No hours exist yet, use defaults
      form.reset({ hours: defaultHours });
      setHasChanges(true); // Allow saving on initial setup
      setIsInitialized(true);
    }
  }, [hours, isLoading, form]);

  // Track changes - compare current form values with initial values
  useEffect(() => {
    const subscription = form.watch(() => {
      // Mark as changed whenever form values change
      setHasChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: HoursFormData) => {
    try {
      // Filter out closed days and ensure all open days have valid times
      const hoursToSave = data.hours.map((hour) => {
        if (hour.is_closed) {
          return {
            day_of_week: hour.day_of_week,
            open_time: "00:00", // Placeholder for closed days
            close_time: "00:00", // Placeholder for closed days
            is_closed: true,
          };
        }
        return {
          day_of_week: hour.day_of_week,
          open_time: hour.open_time || "09:00",
          close_time: hour.close_time || "17:00",
          is_closed: false,
        };
      });

      await upsertHours(hoursToSave);
      toast({
        title: "Business hours updated!",
        description: "Your business hours have been saved successfully.",
      });
      setHasChanges(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save business hours. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Add form validation error handler
  const onError = (errors: any) => {
    toast({
      title: "Validation Error",
      description: "Please check your business hours. Close time must be after open time.",
      variant: "destructive",
    });
  };

  const formatTime = (time: string) => {
    // Convert 24-hour format to 12-hour format for display
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Business Hours</CardTitle>
          <CardDescription>Set your operating hours for each day of the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Business Hours
        </CardTitle>
        <CardDescription>
          Set your operating hours for each day of the week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-4">
            {form.watch("hours").map((_, index) => (
              <FormField
                key={index}
                control={form.control}
                name={`hours.${index}.is_closed`}
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-24 flex-shrink-0">
                        <FormLabel className="font-semibold">
                          {dayNames[index]}
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={!field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(!checked);
                            setHasChanges(true);
                          }}
                        />
                      </FormControl>
                      <div className="flex-1 flex items-center gap-4">
                        {!field.value ? (
                          <>
                            <FormField
                              control={form.control}
                              name={`hours.${index}.open_time`}
                              render={({ field: timeField }) => (
                                <FormItem className="flex-1">
                                  <FormLabel className="text-xs text-muted-foreground">
                                    Open
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="time"
                                      value={timeField.value || "09:00"}
                                      onChange={(e) => {
                                        timeField.onChange(e.target.value);
                                        setHasChanges(true);
                                      }}
                                      onBlur={timeField.onBlur}
                                      disabled={field.value}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <span className="text-muted-foreground">-</span>
                            <FormField
                              control={form.control}
                              name={`hours.${index}.close_time`}
                              render={({ field: timeField }) => (
                                <FormItem className="flex-1">
                                  <FormLabel className="text-xs text-muted-foreground">
                                    Close
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="time"
                                      value={timeField.value || "17:00"}
                                      onChange={(e) => {
                                        timeField.onChange(e.target.value);
                                        setHasChanges(true);
                                      }}
                                      onBlur={timeField.onBlur}
                                      disabled={field.value}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">Closed</span>
                        )}
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            ))}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSaving || (!hasChanges && isInitialized && hours.length > 0)}
                className="flex-1"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Hours"}
              </Button>
            </div>
            {!isInitialized && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                Loading business hours...
              </p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BusinessHoursManagement;

