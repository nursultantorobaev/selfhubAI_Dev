import { useState } from "react";
import { X, Filter, DollarSign, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";

export interface AdvancedFilters {
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  hasAvailability?: boolean;
  sortBy?: "rating" | "price_asc" | "price_desc" | "reviews";
}

interface AdvancedFiltersProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const AdvancedFilters = ({
  filters,
  onFiltersChange,
  onClearFilters,
  hasActiveFilters,
}: AdvancedFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters: AdvancedFilters = {};
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    setIsOpen(false);
  };

  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const activeFilterCount =
    (filters.minPrice !== undefined ? 1 : 0) +
    (filters.maxPrice !== undefined ? 1 : 0) +
    (filters.minRating !== undefined ? 1 : 0) +
    (filters.hasAvailability ? 1 : 0) +
    (filters.sortBy ? 1 : 0);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Advanced Filters</SheetTitle>
            <SheetDescription>
              Filter businesses by price, rating, and availability
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Price Range */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Price Range
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <Label>Min Price</Label>
                    <span className="text-muted-foreground">
                      ${localFilters.minPrice || 0}
                    </span>
                  </div>
                  <Slider
                    value={[localFilters.minPrice || 0]}
                    onValueChange={(value) => updateFilter("minPrice", value[0])}
                    max={500}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <Label>Max Price</Label>
                    <span className="text-muted-foreground">
                      ${localFilters.maxPrice || 500}
                    </span>
                  </div>
                  <Slider
                    value={[localFilters.maxPrice || 500]}
                    onValueChange={(value) => updateFilter("maxPrice", value[0])}
                    max={500}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Rating Filter */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Minimum Rating
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <Label>Rating</Label>
                    <span className="text-muted-foreground">
                      {localFilters.minRating ? `${localFilters.minRating}+ stars` : "Any"}
                    </span>
                  </div>
                  <Slider
                    value={[localFilters.minRating || 0]}
                    onValueChange={(value) => updateFilter("minRating", value[0])}
                    max={5}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Any</span>
                    <span>1★</span>
                    <span>2★</span>
                    <span>3★</span>
                    <span>4★</span>
                    <span>5★</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Availability Filter */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="availability"
                    checked={localFilters.hasAvailability || false}
                    onCheckedChange={(checked) =>
                      updateFilter("hasAvailability", checked)
                    }
                  />
                  <Label
                    htmlFor="availability"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Show only businesses with available appointments
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Filters to businesses that have open time slots in the next 7 days
                </p>
              </CardContent>
            </Card>

            {/* Sort By */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Sort By</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { value: "rating", label: "Highest Rated" },
                  { value: "price_asc", label: "Price: Low to High" },
                  { value: "price_desc", label: "Price: High to Low" },
                  { value: "reviews", label: "Most Reviews" },
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`sort-${option.value}`}
                      checked={localFilters.sortBy === option.value}
                      onCheckedChange={(checked) =>
                        checked ? updateFilter("sortBy", option.value) : updateFilter("sortBy", undefined)
                      }
                    />
                    <Label
                      htmlFor={`sort-${option.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleApply} className="flex-1">
                Apply Filters
              </Button>
              {hasActiveFilters && (
                <Button onClick={handleReset} variant="outline" className="flex-1">
                  Reset
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          {filters.minPrice !== undefined && (
            <Badge variant="secondary" className="px-3 py-1">
              Min: ${filters.minPrice}
              <button
                onClick={() => {
                  const newFilters = { ...filters };
                  delete newFilters.minPrice;
                  onFiltersChange(newFilters);
                }}
                className="ml-2 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.maxPrice !== undefined && filters.maxPrice !== 500 && (
            <Badge variant="secondary" className="px-3 py-1">
              Max: ${filters.maxPrice}
              <button
                onClick={() => {
                  const newFilters = { ...filters };
                  delete newFilters.maxPrice;
                  onFiltersChange(newFilters);
                }}
                className="ml-2 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.minRating !== undefined && filters.minRating > 0 && (
            <Badge variant="secondary" className="px-3 py-1">
              {filters.minRating}+ ⭐
              <button
                onClick={() => {
                  const newFilters = { ...filters };
                  delete newFilters.minRating;
                  onFiltersChange(newFilters);
                }}
                className="ml-2 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.hasAvailability && (
            <Badge variant="secondary" className="px-3 py-1">
              Available Now
              <button
                onClick={() => {
                  const newFilters = { ...filters };
                  newFilters.hasAvailability = false;
                  onFiltersChange(newFilters);
                }}
                className="ml-2 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.sortBy && (
            <Badge variant="secondary" className="px-3 py-1">
              Sort: {filters.sortBy === "rating" ? "Highest Rated" : filters.sortBy === "price_asc" ? "Price: Low to High" : filters.sortBy === "price_desc" ? "Price: High to Low" : "Most Reviews"}
              <button
                onClick={() => {
                  const newFilters = { ...filters };
                  delete newFilters.sortBy;
                  onFiltersChange(newFilters);
                }}
                className="ml-2 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </>
  );
};


