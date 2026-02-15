// @ts-nocheck - react-leaflet v4.2.1 types compatibility
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Measure } from "@/hooks/useMeasureData";

// Fix Leaflet map not rendering at full size inside collapsible containers
function MapResizer() {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
}

// Create a custom SVG pin icon
function createPinIcon(color: string, size: number = 36) {
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

interface LocationMapSectionProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    measure: Measure | null;
}

export function LocationMapSection({ isOpen, onOpenChange, measure }: LocationMapSectionProps) {
    const hasCoordinates = measure?.latitude && measure?.longitude;

    if (!hasCoordinates) return null;

    const pinColor = measure?.temp1_c ? "#ef4444" : "#3b82f6";

    return (
        <Collapsible open={isOpen} onOpenChange={onOpenChange}>
            <Card>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 border-b">
                    <h3 className="text-base font-semibold text-primary">Location</h3>
                    <ChevronDown className={`w-5 h-5 transition-transform ${!isOpen && "rotate-180"}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="p-6">
                        <div className="h-[350px] w-full rounded-b-lg overflow-hidden relative z-0">
                            <MapContainer
                                key={`${measure.latitude}-${measure.longitude}`}
                                center={[measure.latitude!, measure.longitude!]}
                                zoom={17}
                                scrollWheelZoom={true}
                                zoomControl={false}
                                style={{ height: "100%", width: "100%" }}
                            >
                                <MapResizer />
                                <ZoomControl position="topleft" />
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                    attribution="&copy; CARTO | &copy; OpenStreetMap"
                                />
                                <Marker
                                    position={[measure.latitude!, measure.longitude!]}
                                    icon={createPinIcon(pinColor)}
                                >
                                    <Popup>
                                        <div className="text-sm">
                                            <p><strong>Coordinates:</strong> {measure.latitude}, {measure.longitude}</p>
                                            {measure.temp1_c && <p><strong>Temperature:</strong> {measure.temp1_c.toFixed(2)}°C</p>}
                                            {measure.localizacao && <p><strong>Address:</strong> {measure.localizacao}</p>}
                                        </div>
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}
