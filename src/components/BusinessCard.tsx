import { Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import type { BusinessProfile } from "@/hooks/useBusinesses";
import barbershop1 from "@/assets/barbershop-1.jpg";
import salon2 from "@/assets/salon-2.jpg";
import salon3 from "@/assets/salon-3.jpg";
import salon4 from "@/assets/salon-4.jpg";

// Fallback images for businesses without cover images
const defaultImages = [barbershop1, salon2, salon3, salon4];

interface BusinessCardProps {
  business: BusinessProfile;
}

const BusinessCard = ({ business }: BusinessCardProps) => {
  const navigate = useNavigate();
  
  // Get a consistent image based on business ID, or use cover_image_url
  const getImage = () => {
    if (business.cover_image_url) return business.cover_image_url;
    // Use business ID to select a default image consistently
    const index = parseInt(business.id.slice(-1), 16) % defaultImages.length;
    return defaultImages[index];
  };

  const handleClick = () => {
    navigate(`/business/${business.id}`);
  };

  const displayRating = business.rating || 0;
  const displayReviews = business.total_reviews || 0;
  const fullAddress = `${business.address}, ${business.city}${business.state ? `, ${business.state}` : ""}${business.zip_code ? ` ${business.zip_code}` : ""}`;

  return (
    <Card 
      className="overflow-hidden hover:shadow-large transition-all cursor-pointer group active:scale-[0.98] touch-manipulation"
      onClick={handleClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={getImage()}
          alt={business.business_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {business.is_verified && (
          <Badge className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-accent text-xs sm:text-sm">
            Verified
          </Badge>
        )}
        {displayRating > 0 && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-background/90 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-1.5">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-accent text-accent" />
            <span className="font-semibold text-xs sm:text-sm">{displayRating.toFixed(1)}</span>
          </div>
        )}
      </div>
      <CardContent className="p-3 sm:p-4">
        <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 line-clamp-1">{business.business_name}</h3>
        <div className="flex items-start gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-sm">
          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
          <p className="line-clamp-2">{fullAddress}</p>
        </div>
        {displayReviews > 0 && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2">
            {displayReviews} {displayReviews === 1 ? "review" : "reviews"}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default BusinessCard;
