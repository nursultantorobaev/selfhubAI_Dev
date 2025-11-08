import { useState, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import heroBackground from "@/assets/hero-background.jpg";

const categoryMap: Record<string, string> = {
  "Hair Salon": "salon",
  "Barbershop": "barbershop",
  "Nail Salon": "nails",
  "Skin Care": "beauty",
  "Brows & Lashes": "beauty",
  "Massage": "massage",
  "Makeup": "beauty",
  "Wellness & Day Spa": "wellness",
};

const categories = [
  "Hair Salon",
  "Barbershop",
  "Nail Salon",
  "Skin Care",
  "Brows & Lashes",
  "Massage",
  "Makeup",
  "Wellness & Day Spa",
];

interface HeroProps {
  searchQuery: string;
  selectedCategory: string | null;
  city: string;
  onSearchChange: (query: string) => void;
  onCategorySelect: (category: string | null) => void;
  onCityChange: (city: string) => void;
}

const Hero = ({ searchQuery, selectedCategory, city, onSearchChange, onCategorySelect, onCityChange }: HeroProps) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [localCity, setLocalCity] = useState(city);

  // Sync local state with props
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setLocalCity(city);
  }, [city]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
  };

  const handleCategoryClick = (category: string) => {
    const categoryType = categoryMap[category];
    if (selectedCategory === categoryType) {
      // Deselect if already selected
      onCategorySelect(null);
    } else {
      onCategorySelect(categoryType);
    }
  };

  return (
    <section className="relative min-h-[500px] sm:min-h-[600px] flex items-center justify-center">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4 sm:mb-6">
          Be confident
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90 mb-6 sm:mb-8 px-2">
          Discover and book beauty & wellness professionals near you
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search services or businesses"
                className="pl-10 sm:pl-12 h-12 sm:h-14 text-base sm:text-lg bg-background shadow-large border-0"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </div>
            <div className="relative w-full sm:w-48">
              <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="City or location"
                className="pl-10 sm:pl-12 h-12 sm:h-14 text-base sm:text-lg bg-background shadow-large border-0"
                value={localCity}
                onChange={(e) => {
                  setLocalCity(e.target.value);
                  onCityChange(e.target.value);
                }}
              />
            </div>
            <Button
              type="submit"
              className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base"
            >
              Search
            </Button>
          </div>
        </form>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center px-2">
          {categories.map((category) => {
            const categoryType = categoryMap[category];
            const isSelected = selectedCategory === categoryType;
            return (
              <Button
                key={category}
                variant={isSelected ? "default" : "secondary"}
                className={`rounded-full px-3 sm:px-6 text-xs sm:text-sm py-2 sm:py-2 hover:bg-background hover:shadow-medium transition-all touch-manipulation ${
                  isSelected ? "bg-primary text-primary-foreground" : ""
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Hero;
