import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus } from "lucide-react";
import { MapContainer, TileLayer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

interface Feeder {
  id: string;
  feeder: string;
  ea: string;
  region: string;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Feeders</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Feeder List */}
        <div className="col-span-3 space-y-4">
          <div>
            <Label className="text-sm mb-2 block">Search:</Label>
            <Input
              placeholder="Search feeders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>FEEDER</TableHead>
                  <TableHead>EA</TableHead>
                  <TableHead>REGION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFeeders.map((feeder) => (
                  <TableRow key={feeder.id} className="cursor-pointer hover:bg-muted/50">
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
        <div className="col-span-9 relative">
          <Card className="h-[700px] overflow-hidden">
            <MapContainer
              {...({
                center: [40.7128, -74.0060],
                zoom: 13,
                scrollWheelZoom: true,
                style: { height: "100%", width: "100%" }
              } as any)}
            >
              <TileLayer
                url={
                  mapType === "satellite"
                    ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
              />
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
