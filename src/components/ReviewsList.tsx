import { useReviews, useDeleteReview } from "@/hooks/useReviews";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Star, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
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
import { useState } from "react";

interface ReviewsListProps {
  businessId: string;
  limit?: number;
}

export const ReviewsList = ({ businessId, limit }: ReviewsListProps) => {
  const { user } = useAuth();
  const { data: reviews, isLoading } = useReviews({ businessId, limit });
  const deleteReview = useDeleteReview();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  const handleDeleteClick = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;

    try {
      await deleteReview.mutateAsync(reviewToDelete);
      toast({
        title: "Review Deleted",
        description: "Your review has been deleted successfully.",
      });
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No reviews yet. Be the first to review this business!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {reviews.map((review) => {
          const customer = review.customer;
          const isOwner = user?.id === review.customer_id;

          return (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    {customer?.avatar_url && (
                      <AvatarImage
                        src={customer.avatar_url}
                        alt={customer?.full_name || "User"}
                      />
                    )}
                    <AvatarFallback>
                      {getInitials(customer?.full_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">
                          {customer?.full_name || "Anonymous"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(review.created_at), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(review.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {review.review_text && (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {review.review_text}
                      </p>
                    )}

                    {review.appointment && (
                      <p className="text-xs text-muted-foreground">
                        Reviewed after appointment on{" "}
                        {format(
                          new Date(`${review.appointment.appointment_date}T${review.appointment.appointment_time}`),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                        {review.appointment.service?.name && (
                          <span> • {review.appointment.service.name}</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteReview.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteReview.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

