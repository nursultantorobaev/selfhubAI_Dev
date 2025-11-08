import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateReview, useUpdateReview, useCustomerReview } from "@/hooks/useReviews";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5, "Rating must be between 1 and 5"),
  reviewText: z.string().optional(),
});

interface ReviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  appointmentId?: string;
}

export const ReviewForm = ({ open, onOpenChange, businessId, appointmentId }: ReviewFormProps) => {
  const { user } = useAuth();
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const { data: existingReview, isLoading: checkingReview } = useCustomerReview(businessId, user?.id);

  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating || 0,
      reviewText: existingReview?.review_text || "",
    },
  });

  // Update form when existing review loads
  useEffect(() => {
    if (existingReview) {
      form.reset({
        rating: existingReview.rating,
        reviewText: existingReview.review_text || "",
      });
    }
  }, [existingReview, form]);

  const onSubmit = async (values: z.infer<typeof reviewSchema>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to leave a review.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (existingReview) {
        // Update existing review
        await updateReview.mutateAsync({
          id: existingReview.id,
          updates: {
            rating: values.rating,
            review_text: values.reviewText || null,
          },
        });

        toast({
          title: "Review Updated!",
          description: "Your review has been updated successfully.",
        });
      } else {
        // Create new review
        await createReview.mutateAsync({
          business_id: businessId,
          customer_id: user.id,
          appointment_id: appointmentId || null,
          rating: values.rating,
          review_text: values.reviewText || null,
        });

        // Track review submission
        const { trackReview } = await import("@/lib/analytics");
        trackReview({
          business_id: businessId,
          rating: values.rating,
        });

        toast({
          title: "Review Submitted!",
          description: "Thank you for your review!",
        });
      }

      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: existingReview ? "Update Failed" : "Submission Failed",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const rating = form.watch("rating");
  const displayRating = hoveredStar || rating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {existingReview ? "Update Your Review" : "Write a Review"}
          </DialogTitle>
          <DialogDescription>
            {existingReview
              ? "Update your review and rating for this business."
              : "Share your experience and help others make informed decisions."}
          </DialogDescription>
        </DialogHeader>

        {checkingReview ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Star Rating */}
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating *</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => field.onChange(star)}
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(null)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={cn(
                                "h-8 w-8 transition-colors",
                                star <= displayRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300 hover:text-yellow-300"
                              )}
                            />
                          </button>
                        ))}
                        {rating > 0 && (
                          <span className="ml-2 text-sm text-muted-foreground">
                            {rating} {rating === 1 ? "star" : "stars"}
                          </span>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Review Text */}
              <FormField
                control={form.control}
                name="reviewText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Review (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your experience with this business..."
                        className="resize-none min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  disabled={createReview.isPending || updateReview.isPending}
                  className="flex-1"
                >
                  {(createReview.isPending || updateReview.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {existingReview ? "Updating..." : "Submitting..."}
                    </>
                  ) : (
                    existingReview ? "Update Review" : "Submit Review"
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

