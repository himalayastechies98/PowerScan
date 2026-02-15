// @ts-nocheck - react-leaflet v4.2.1 types compatibility
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, Maximize2, MoreVertical, Loader2, MapPin } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useDashboardData } from "@/hooks/useDashboardData";

// Create a custom SVG pin icon for map markers
function createPinIcon(color: string, size: number = 30) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 1.3}" viewBox="0 0 24 32">
      <defs>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#00000040"/>
        </filter>
      </defs>
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="${color}" filter="url(#shadow)" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="11" r="5" fill="white" opacity="0.9"/>
      <circle cx="12" cy="11" r="3" fill="${color}"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size * 1.3],
    iconAnchor: [size / 2, size * 1.3],
    popupAnchor: [0, -(size * 1.3)],
  });
}

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
            <svg width="14" height="18" viewBox="0 0 24 32"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#e53935" stroke="white" strokeWidth="1.5" /><circle cx="12" cy="11" r="5" fill="white" opacity="0.9" /><circle cx="12" cy="11" r="3" fill="#e53935" /></svg>
            <span className="text-sm text-muted-foreground">{t('immediateAction')}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="14" height="18" viewBox="0 0 24 32"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#ffa000" stroke="white" strokeWidth="1.5" /><circle cx="12" cy="11" r="5" fill="white" opacity="0.9" /><circle cx="12" cy="11" r="3" fill="#ffa000" /></svg>
            <span className="text-sm text-muted-foreground">{t('scheduledAction')}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="14" height="18" viewBox="0 0 24 32"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#43a047" stroke="white" strokeWidth="1.5" /><circle cx="12" cy="11" r="5" fill="white" opacity="0.9" /><circle cx="12" cy="11" r="3" fill="#43a047" /></svg>
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
                <Marker
                  key={idx}
                  position={[loc.lat, loc.lng]}
                  icon={createPinIcon(getMarkerColor(loc.status))}
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
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
