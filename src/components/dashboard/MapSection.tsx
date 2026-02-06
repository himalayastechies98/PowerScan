// @ts-nocheck - react-leaflet v4.2.1 types compatibility
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, Maximize2, MoreVertical, Loader2, MapPin } from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useDashboardData } from "@/hooks/useDashboardData";

const getMarkerColor = (status: string) => {
  switch (status) {
    case "critical":
      return "#e53935";
    case "warning":
      return "#ffa000";
    case "normal":
      return "#43a047";
    default:
      return "#7c3aed";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "critical":
      return "Immediate Action";
    case "warning":
      return "Scheduled Action";
    case "normal":
      return "No Action";
    default:
      return "Not Defined";
  }
};

export function MapSection() {
  const { t } = useTranslation();
  const { mapLocations, stats } = useDashboardData();

  // Calculate center based on data or use default
  const getCenter = () => {
    if (mapLocations.length > 0) {
      const avgLat = mapLocations.reduce((sum, loc) => sum + loc.lat, 0) / mapLocations.length;
      const avgLng = mapLocations.reduce((sum, loc) => sum + loc.lng, 0) / mapLocations.length;
      return [avgLat, avgLng] as [number, number];
    }
    return [-25.42, -49.26] as [number, number]; // Default to Brazil
  };

  if (stats.loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6 flex items-center justify-center h-[450px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          {t('locationOverview')}
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Layers className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-muted-foreground">{t('immediateAction')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-sm text-muted-foreground">{t('scheduledAction')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-muted-foreground">{t('noAction')}</span>
          </div>
        </div>

        <div className="h-[400px] rounded-lg overflow-hidden border border-border">
          {mapLocations.length === 0 ? (
            <div className="h-full flex items-center justify-center bg-muted/50">
              <div className="text-center text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No location data available</p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={getCenter()}
              zoom={10}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {mapLocations.map((loc, idx) => (
                <CircleMarker
                  key={idx}
                  center={[loc.lat, loc.lng]}
                  pathOptions={{
                    fillColor: getMarkerColor(loc.status),
                    color: "#fff",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8,
                  }}
                  radius={10}
                >
                  <Popup>
                    <div className="text-sm min-w-[180px]">
                      <strong className="block mb-2 text-base">{loc.name}</strong>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ID:</span>
                          <span className="font-medium">{loc.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('temperature')}:</span>
                          <span className="font-medium">{loc.temp}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('status')}:</span>
                          <span
                            className="font-bold"
                            style={{ color: getMarkerColor(loc.status) }}
                          >
                            {getStatusLabel(loc.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
