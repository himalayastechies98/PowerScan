import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Upload } from "lucide-react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import * as toGeoJSON from "@tmcw/togeojson";
import { toast } from "@/hooks/use-toast";
import "leaflet/dist/leaflet.css";

// Map reference component
function MapController({ mapRef }: { mapRef: React.MutableRefObject<LeafletMap | null> }) {
  const map = useMap();
  mapRef.current = map;
  return null;
}

interface Feeder {
  id: string;
  feeder: string;
  ea: string;
  region: string;
  coordinates?: [number, number];
}

const dummyFeeders: Feeder[] = [
  { id: "1", feeder: "001005", ea: "-", region: "-" },
  { id: "2", feeder: "001019", ea: "-", region: "-" },
  { id: "3", feeder: "001042", ea: "-", region: "-" },
  { id: "4", feeder: "001044", ea: "-", region: "-" },
  { id: "5", feeder: "045005", ea: "-", region: "-" },
  { id: "6", feeder: "045006", ea: "-", region: "-" },
  { id: "7", feeder: "045007", ea: "-", region: "-" },
  { id: "8", feeder: "056015", ea: "-", region: "-" },
  { id: "9", feeder: "069010", ea: "-", region: "-" },
  { id: "10", feeder: "069012", ea: "-", region: "-" },
];

const layerOptions = [
  { id: "condutores", label: "Condutores" },
  { id: "trafo", label: "Trafo" },
  { id: "regulator", label: "Regulator" },
  { id: "threePoleSwitch", label: "ThreePoleSwitch" },
  { id: "recloser", label: "Recloser" },
  { id: "oilSwitch", label: "OilSwitch" },
  { id: "singlePhaseOilSwitch", label: "SinglePhaseOilSwitch" },
  { id: "fuseSwitch", label: "FuseSwitch" },
  { id: "knifeSwitch", label: "KnifeSwitch" },
  { id: "capacitorBank", label: "CapacitorBank" },
  { id: "poles", label: "Poles" },
];

export default function Feeders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [mapType, setMapType] = useState("streets");
  const [selectedLayers, setSelectedLayers] = useState<string[]>(layerOptions.map(opt => opt.id));
  const [kmlData, setKmlData] = useState<any>(null);
  const [selectedFeeder, setSelectedFeeder] = useState<string | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredFeeders = dummyFeeders.filter((feeder) =>
    Object.values(feeder).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredFeeders.length / itemsPerPage);
  const paginatedFeeders = filteredFeeders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleLayer = (layerId: string) => {
    setSelectedLayers(prev =>
      prev.includes(layerId)
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  const handleKmlUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const kmlText = e.target?.result as string;
        const parser = new DOMParser();
        const kml = parser.parseFromString(kmlText, "text/xml");
        const geoJson = toGeoJSON.kml(kml);
        setKmlData(geoJson);
        toast({
          title: "KML file loaded",
          description: "The KML file has been successfully loaded on the map.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to parse KML file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleFeederClick = (feeder: Feeder) => {
    setSelectedFeeder(feeder.id);
    if (feeder.coordinates && mapRef.current) {
      mapRef.current.setView(feeder.coordinates, 15, {
        animate: true,
      });
    }
  };

  return (
    <div className="space-y-6 h-screen flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <h1 className="text-3xl font-bold">Feeders</h1>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".kml"
            onChange={handleKmlUpload}
            className="hidden"
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload KML
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* Left Sidebar - Feeder List */}
        <div className="col-span-3 space-y-4 flex flex-col overflow-hidden">
          <div>
            <Label className="text-sm mb-2 block">Search:</Label>
            <Input
              placeholder="Search feeders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card className="overflow-hidden flex-1 flex flex-col">
            <div className="overflow-auto flex-1">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>FEEDER</TableHead>
                    <TableHead>EA</TableHead>
                    <TableHead>REGION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFeeders.map((feeder) => (
                    <TableRow 
                      key={feeder.id} 
                      className={`cursor-pointer hover:bg-muted/50 ${selectedFeeder === feeder.id ? 'bg-primary/10' : ''}`}
                      onClick={() => handleFeederClick(feeder)}
                    >
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">{feeder.feeder}</TableCell>
                      <TableCell>{feeder.ea}</TableCell>
                      <TableCell>{feeder.region}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Map Area */}
        <div className="col-span-9 relative h-full">
          <Card className="h-full overflow-hidden">
            <MapContainer
              {...{
                center: [40.7128, -74.0060] as [number, number],
                zoom: 13,
                scrollWheelZoom: true,
                style: { height: "100%", width: "100%" }
              } as any}
            >
              <MapController mapRef={mapRef} />
              <TileLayer
                url={
                  mapType === "satellite"
                    ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
              />
              {kmlData && (
                <GeoJSON
                  data={kmlData}
                  pathOptions={{
                    color: "#2563eb",
                    weight: 3,
                    opacity: 0.8,
                  }}
                />
              )}
            </MapContainer>
          </Card>

          {/* Map Controls Overlay - Top Right */}
          <div className="absolute top-4 right-4 bg-white dark:bg-card rounded-lg shadow-lg p-4 space-y-4 max-w-xs z-[1000]">
            <div>
              <Label className="text-sm font-semibold mb-2 block">Map Type</Label>
              <RadioGroup value={mapType} onValueChange={setMapType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="satellite" id="satellite" />
                  <Label htmlFor="satellite" className="font-normal cursor-pointer">Satellite</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="streets" id="streets" />
                  <Label htmlFor="streets" className="font-normal cursor-pointer">Streets</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="border-t pt-3">
              <Label className="text-sm font-semibold mb-2 block">Layers</Label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {layerOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={selectedLayers.includes(option.id)}
                      onCheckedChange={() => toggleLayer(option.id)}
                    />
                    <Label
                      htmlFor={option.id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
