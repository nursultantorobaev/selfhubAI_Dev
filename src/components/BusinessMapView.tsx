import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Navigation, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistance, calculateDistance } from "@/lib/geocoding";
import type { BusinessProfile } from "@/hooks/useBusinesses";
import { Skeleton } from "@/components/ui/skeleton";

// Fix for default marker icons in React-Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import markerRetina from "leaflet/dist/images/marker-icon-2x.png";

const DefaultIcon = new Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconRetinaUrl: markerRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface BusinessMapViewProps {
  businesses: BusinessProfile[];
  isLoading?: boolean;
  onLocationDetected?: (lat: number, lng: number) => void;
}

// Component to handle map view changes
function MapViewUpdater({
  center,
  zoom,
}: {
  center: LatLngExpression;
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

export const BusinessMapView = ({
  businesses,
  isLoading,
  onLocationDetected,
}: BusinessMapViewProps) => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([40.7128, -74.006]); // Default: NYC
  const [mapZoom, setMapZoom] = useState(12);

  // Filter businesses with valid coordinates
  const businessesWithCoords = businesses.filter(
    (b) => b.latitude != null && b.longitude != null
  );

  // Calculate center of all businesses if available
  useEffect(() => {
    if (businessesWithCoords.length > 0) {
      const avgLat =
        businessesWithCoords.reduce((sum, b) => sum + (b.latitude || 0), 0) /
        businessesWithCoords.length;
      const avgLng =
        businessesWithCoords.reduce((sum, b) => sum + (b.longitude || 0), 0) /
        businessesWithCoords.length;
      setMapCenter([avgLat, avgLng]);
      setMapZoom(businessesWithCoords.length === 1 ? 15 : 12);
    } else if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      setMapZoom(12);
    }
  }, [businessesWithCoords, userLocation]);

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const { getCurrentLocation } = await import("@/lib/geocoding");
      const location = await getCurrentLocation();
      setUserLocation(location);
      setMapCenter([location.lat, location.lng]);
      setMapZoom(13);
      onLocationDetected?.(location.lat, location.lng);
    } catch (error: any) {
      console.error("Location detection failed:", error);
      // Show user-friendly error
      alert(
        "Unable to detect your location. Please allow location access or search by city."
      );
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-[500px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (businessesWithCoords.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-2">
              No businesses with location data available
            </p>
            <p className="text-sm text-muted-foreground">
              Businesses need to have their addresses geocoded to appear on the map.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          {businessesWithCoords.length} business
          {businessesWithCoords.length !== 1 ? "es" : ""} on map
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDetectLocation}
          disabled={isDetectingLocation}
        >
          {isDetectingLocation ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Detecting...
            </>
          ) : (
            <>
              <Navigation className="mr-2 h-4 w-4" />
              Use My Location
            </>
          )}
        </Button>
      </div>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div className="h-[500px] w-full rounded-lg overflow-hidden">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapViewUpdater center={mapCenter} zoom={mapZoom} />

              {/* User location marker */}
              {userLocation && (
                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={
                    new Icon({
                      iconUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIHN0cm9rZT0iIzEwYjk4MSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSIjMTBiOTgxIiBmaWxsLW9wYWNpdHk9IjAuMiIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI0IiBmaWxsPSIjMTBiOTgxIi8+Cjwvc3ZnPgo=",
                      iconSize: [24, 24],
                      iconAnchor: [12, 12],
                    })
                  }
                >
                  <Popup>Your Location</Popup>
                </Marker>
              )}

              {/* Business markers */}
              {businessesWithCoords.map((business) => {
                const distance =
                  userLocation &&
                  business.latitude &&
                  business.longitude
                    ? calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        business.latitude,
                        business.longitude
                      )
                    : null;

                return (
                  <Marker
                    key={business.id}
                    position={[business.latitude!, business.longitude!]}
                    icon={DefaultIcon}
                  >
                    <Popup>
                      <div className="min-w-[200px]">
                        <h3 className="font-semibold text-sm mb-1">
                          {business.business_name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          {business.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">
                                {business.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                          {distance !== null && (
                            <Badge variant="secondary" className="text-xs">
                              {formatDistance(distance)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {business.address}, {business.city}
                        </p>
                        <Button
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => navigate(`/business/${business.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Business list below map (for mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {businessesWithCoords.map((business) => {
          const distance =
            userLocation &&
            business.latitude &&
            business.longitude
              ? calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  business.latitude,
                  business.longitude
                )
              : null;

          return (
            <Card
              key={business.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/business/${business.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm">{business.business_name}</h3>
                  {distance !== null && (
                    <Badge variant="secondary" className="text-xs ml-2">
                      {formatDistance(distance)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {business.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">
                        {business.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {business.city}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {business.address}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

