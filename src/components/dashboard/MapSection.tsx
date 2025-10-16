// @ts-nocheck - react-leaflet v4.2.1 types compatibility
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, Maximize2, MoreVertical } from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const locations = [
  { lat: 29.39, lng: 76.97, name: "North District - Sector 7", status: "warning", temp: "78.5°C", type: "Thermal", id: "INS-2023-1458" },
  { lat: 29.42, lng: 77.0, name: "East District - Main Line", status: "normal", temp: "42.1°C", type: "Visual", id: "INS-2023-1457" },
  { lat: 29.36, lng: 76.94, name: "South District - Junction B", status: "critical", temp: "92.7°C", type: "Corona", id: "INS-2023-1456" },
  { lat: 29.4, lng: 76.9, name: "West District - Substation 3", status: "normal", temp: "39.2°C", type: "Lidar", id: "INS-2023-1455" },
  { lat: 29.44, lng: 76.98, name: "North District - Tower 42", status: "warning", temp: "67.8°C", type: "Thermal", id: "INS-2023-1454" },
  { lat: 29.37, lng: 77.02, name: "East District - Sector 12", status: "normal", temp: "45.3°C", type: "Visual", id: "INS-2023-1453" },
  { lat: 29.35, lng: 76.96, name: "South District - Tower 18", status: "critical", temp: "88.9°C", type: "Thermal", id: "INS-2023-1452" },
  { lat: 29.41, lng: 76.92, name: "West District - Line 5", status: "warning", temp: "72.4°C", type: "Corona", id: "INS-2023-1451" },
];

const getMarkerColor = (status: string) => {
  switch (status) {
    case "critical":
      return "#e53935";
    case "warning":
      return "#ffa000";
    case "normal":
      return "#43a047";
    default:
      return "#1976d2";
  }
};

export function MapSection() {
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Inspection Locations</CardTitle>
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
        <div className="h-[400px] rounded-lg overflow-hidden">
          <MapContainer
            center={[29.39, 76.97]}
            zoom={11}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {locations.map((loc, idx) => (
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
                radius={8}
              >
                <Popup>
                  <div className="text-sm">
                    <strong className="block mb-1">{loc.name}</strong>
                    <div>
                      <b>ID:</b> {loc.id}
                    </div>
                    <div>
                      <b>Type:</b> {loc.type}
                    </div>
                    <div>
                      <b>Temperature:</b> {loc.temp}
                    </div>
                    <div>
                      <b>Status:</b>{" "}
                      <span style={{ color: getMarkerColor(loc.status), fontWeight: "bold" }}>
                        {loc.status.charAt(0).toUpperCase() + loc.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}
