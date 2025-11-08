import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BusinessCard from "@/components/BusinessCard";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import { AdvancedFilters, type AdvancedFilters as AdvancedFiltersType } from "@/components/AdvancedFilters";
import { useBusinesses } from "@/hooks/useBusinesses";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get("type") || null
  );
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersType>(() => {
    // Parse advanced filters from URL
    const filters: AdvancedFiltersType = {};
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minRating = searchParams.get("minRating");
    const hasAvailability = searchParams.get("hasAvailability");
    const sortBy = searchParams.get("sortBy");
    
    if (minPrice) filters.minPrice = Number(minPrice);
    if (maxPrice) filters.maxPrice = Number(maxPrice);
    if (minRating) filters.minRating = Number(minRating);
    if (hasAvailability === "true") filters.hasAvailability = true;
    if (sortBy) filters.sortBy = sortBy as any;
    
    return filters;
  });

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory) params.set("type", selectedCategory);
    if (city) params.set("city", city);
    if (advancedFilters.minPrice !== undefined) params.set("minPrice", advancedFilters.minPrice.toString());
    if (advancedFilters.maxPrice !== undefined && advancedFilters.maxPrice !== 500) params.set("maxPrice", advancedFilters.maxPrice.toString());
    if (advancedFilters.minRating !== undefined && advancedFilters.minRating > 0) params.set("minRating", advancedFilters.minRating.toString());
    if (advancedFilters.hasAvailability) params.set("hasAvailability", "true");
    if (advancedFilters.sortBy) params.set("sortBy", advancedFilters.sortBy);
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, city, advancedFilters, setSearchParams]);

  const { data: businesses, isLoading, error } = useBusinesses({
    limit: 12,
    businessType: selectedCategory || undefined,
    city: city || undefined,
    searchQuery: searchQuery || undefined,
    advancedFilters: Object.keys(advancedFilters).length > 0 ? advancedFilters : undefined,
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setCity("");
    setAdvancedFilters({});
  };

  const hasActiveFilters = searchQuery || selectedCategory || city || 
    (advancedFilters.minPrice !== undefined) ||
    (advancedFilters.maxPrice !== undefined && advancedFilters.maxPrice !== 500) ||
    (advancedFilters.minRating !== undefined && advancedFilters.minRating > 0) ||
    advancedFilters.hasAvailability ||
    !!advancedFilters.sortBy;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero 
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        city={city}
        onSearchChange={setSearchQuery}
        onCategorySelect={setSelectedCategory}
        onCityChange={setCity}
      />
      
      {/* Featured Businesses Section */}
      <section className="py-8 sm:py-16">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-8 gap-4">
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
                <h2 className="text-2xl sm:text-3xl font-bold">
                  {hasActiveFilters ? "Search Results" : "Recommended"}
                </h2>
                {/* Always show Filters button for easy access */}
                <AdvancedFilters
                  filters={advancedFilters}
                  onFiltersChange={setAdvancedFilters}
                  onClearFilters={() => setAdvancedFilters({})}
                  hasActiveFilters={
                    (advancedFilters.minPrice !== undefined) ||
                    (advancedFilters.maxPrice !== undefined && advancedFilters.maxPrice !== 500) ||
                    (advancedFilters.minRating !== undefined && advancedFilters.minRating > 0) ||
                    advancedFilters.hasAvailability ||
                    !!advancedFilters.sortBy
                  }
                />
              </div>
              <p className="text-muted-foreground">
                {hasActiveFilters 
                  ? `Found ${businesses?.length || 0} ${businesses?.length === 1 ? "business" : "businesses"}`
                  : "Top-rated beauty and wellness professionals near you"
                }
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-6 items-center">
              {searchQuery && (
                <Badge variant="secondary" className="px-3 py-1">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary" className="px-3 py-1">
                  Type: {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {city && (
                <Badge variant="secondary" className="px-3 py-1">
                  Location: {city}
                  <button
                    onClick={() => setCity("")}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {/* Advanced Filter Badges */}
              {advancedFilters.minPrice !== undefined && (
                <Badge variant="secondary" className="px-3 py-1">
                  Min: ${advancedFilters.minPrice}
                  <button
                    onClick={() => {
                      const newFilters = { ...advancedFilters };
                      delete newFilters.minPrice;
                      setAdvancedFilters(newFilters);
                    }}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {advancedFilters.maxPrice !== undefined && advancedFilters.maxPrice !== 500 && (
                <Badge variant="secondary" className="px-3 py-1">
                  Max: ${advancedFilters.maxPrice}
                  <button
                    onClick={() => {
                      const newFilters = { ...advancedFilters };
                      delete newFilters.maxPrice;
                      setAdvancedFilters(newFilters);
                    }}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {advancedFilters.minRating !== undefined && advancedFilters.minRating > 0 && (
                <Badge variant="secondary" className="px-3 py-1">
                  {advancedFilters.minRating}+ ⭐
                  <button
                    onClick={() => {
                      const newFilters = { ...advancedFilters };
                      delete newFilters.minRating;
                      setAdvancedFilters(newFilters);
                    }}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {advancedFilters.hasAvailability && (
                <Badge variant="secondary" className="px-3 py-1">
                  Available Now
                  <button
                    onClick={() => {
                      const newFilters = { ...advancedFilters };
                      newFilters.hasAvailability = false;
                      setAdvancedFilters(newFilters);
                    }}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {advancedFilters.sortBy && (
                <Badge variant="secondary" className="px-3 py-1">
                  Sort: {advancedFilters.sortBy === "rating" ? "Highest Rated" : advancedFilters.sortBy === "price_asc" ? "Price: Low to High" : advancedFilters.sortBy === "price_desc" ? "Price: High to Low" : "Most Reviews"}
                  <button
                    onClick={() => {
                      const newFilters = { ...advancedFilters };
                      delete newFilters.sortBy;
                      setAdvancedFilters(newFilters);
                    }}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load businesses. Please try again later.
              </AlertDescription>
            </Alert>
          ) : businesses && businesses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No businesses found. Be the first to list your business!
              </AlertDescription>
            </Alert>
          )}
        </div>
      </section>
      
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;
