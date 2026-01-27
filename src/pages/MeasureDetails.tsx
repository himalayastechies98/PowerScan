import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, ChevronDown, Home, BarChart3, Calendar, MapPin, ThermometerSun, Bell } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProfileModal } from "@/components/ProfileModal";
import { MapContainer, TileLayer, GeoJSON, useMap, ZoomControl } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/lib/supabase";
import * as toGeoJSON from "@tmcw/togeojson";
import { toast } from "sonner";

// MapController component to get map reference
function MapController({
  mapRef,
}: {
  mapRef: React.MutableRefObject<LeafletMap | null>;
}) {
  const map = useMap();
  mapRef.current = map;
  return null;
}

const measureData = [
  { id: "b74d9f44-a2b4-4d93-89c7-bf9fdf83993", address: "Rua Samo Antonio Jardim Carolina 78890-000 Sorriso", date: "30/09/2025", time: "20:35:44", action: "", hotspot: "30.83", reprocessedAt: "-" },
  { id: "5dc07ac7-0560-4ade-8232-bf28e70a6c85", address: "Rua das Hortensias Parque Universitário 78891-138 Sorriso", date: "30/09/2025", time: "21:15:52", action: "", hotspot: "29.66", reprocessedAt: "-" },
  { id: "ca334235-d348-4867-a141-00b7bb5c94a", address: "Rua Eça de Queiroz Taiamã 78891-138 Sorriso", date: "30/09/2025", time: "20:46:01", action: "", hotspot: "31.80", reprocessedAt: "-" },
  { id: "fe0e4ef3-c0bc-4f13-b1fc-807a6244fb94", address: "", date: "30/09/2025", time: "20:27:14", action: "", hotspot: "36.53", reprocessedAt: "-" },
  { id: "8c29239b-3ac5-4031-974f-b7f534b66b6b", address: "", date: "29/09/2025", time: "22:11:39", action: "", hotspot: "41.51", reprocessedAt: "-" },
  { id: "8e5d9a85-5e3c-41B7-9b05-7bf0f043ac3d", address: "Rua Santa Catarina de Alexandria Parque Universitário 78891-138 Sorriso", date: "30/09/2025", time: "21:24:01", action: "Immediate Action", hotspot: "80.00", reprocessedAt: "-" },
  { id: "45b7896b-2f77-4dcb-8bd8-ef7d723e0e69", address: "Rua Santa Catarina de Alexandria Parque Universitário 78891-138 Sorriso", date: "30/09/2025", time: "21:24:14", action: "Immediate Action", hotspot: "78.00", reprocessedAt: "-" },
  { id: "c52ba81e-b48c-4bf4-b248-2d4caa5c77b7", address: "-", date: "30/09/2025", time: "21:22:56", action: "Immediate Action", hotspot: "73.74", reprocessedAt: "-" },
  { id: "a43969b3-124e-4c8a-956d-c6ff64adba05", address: "Rua Santa Catarina de Alexandria Parque Universitário 78891-138 Sorriso", date: "30/09/2025", time: "21:22:11", action: "Scheduled Action", hotspot: "68.00", reprocessedAt: "-" },
  { id: "0a6266ac-33c8-4e8d-b296-2ccc80c76759", address: "Rua Euclides da Cunha Pinheiros 78891-138 Sorriso", date: "30/09/2025", time: "20:58:28", action: "Scheduled Action", hotspot: "41.29", reprocessedAt: "-" },
];

const layerOptions = [
  { id: "measures", label: "Measures" },
  { id: "hotspots", label: "Hotspots" },
  { id: "feeder", label: "Feeder" },
];

export default function MeasureDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [statisticsOpen, setStatisticsOpen] = useState(true);
  const [measuresOpen, setMeasuresOpen] = useState(true);
  const [mapOpen, setMapOpen] = useState(true);
  const [mapType, setMapType] = useState<"satellite" | "streets">("streets");
  const [selectedLayers, setSelectedLayers] = useState<string[]>(["measures", "feeder"]);
  const mapRef = useRef<LeafletMap | null>(null);
  const [feederGeoJson, setFeederGeoJson] = useState<any>(null);
  const [feederBounds, setFeederBounds] = useState<[[number, number], [number, number]] | null>(null);
  const [feederId, setFeederId] = useState<string | null>(null);
  const [isLoadingFeeder, setIsLoadingFeeder] = useState(false);
  const [feederName, setFeederName] = useState<string>("-");
  const [feederLength, setFeederLength] = useState<number>(0);
  const [measures, setMeasures] = useState<any[]>([]);
  const [isLoadingMeasures, setIsLoadingMeasures] = useState(false);

  // Fetch inspection measures
  useEffect(() => {
    if (id) {
      fetchInspectionMeasures();
    }
  }, [id]);

  const fetchInspectionMeasures = async () => {
    try {
      setIsLoadingMeasures(true);

      const { data, error } = await supabase
        .from('inspection_measure')
        .select('*')
        .eq('inspection_id', id)
        .order('registro_num', { ascending: true });

      if (error) {
        console.error('Error fetching measures:', error);
        toast.error('Failed to load measures');
        return;
      }

      setMeasures(data || []);
    } catch (err) {
      console.error('Error:', err);
      toast.error('An error occurred while loading measures');
    } finally {
      setIsLoadingMeasures(false);
    }
  };

  // Convert Excel date serial number to readable date
  const excelDateToJS = (excelDate: number) => {
    if (!excelDate) return '-';
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const totalPages = Math.ceil(measures.length / parseInt(entriesPerPage));
  const paginatedData = measures.slice(
    (currentPage - 1) * parseInt(entriesPerPage),
    currentPage * parseInt(entriesPerPage)
  );

  const toggleLayer = (id: string) => {
    setSelectedLayers((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  // Helper function to extract all coordinates from geometry
  const getAllCoordinates = (geometry: any): number[][] => {
    const coords: number[][] = [];

    const extract = (geom: any) => {
      if (geom.type === "Point") return;
      if (geom.type === "LineString") coords.push(...geom.coordinates);
      else if (geom.type === "Polygon")
        geom.coordinates.forEach((ring: number[][]) => coords.push(...ring));
      else if (
        geom.type === "MultiLineString" ||
        geom.type === "MultiPolygon"
      ) {
        geom.coordinates.forEach((part: any) => {
          part.forEach((sub: any) => coords.push(...sub));
        });
      } else if (geom.type === "GeometryCollection")
        geom.geometries.forEach((g: any) => extract(g));
    };

    extract(geometry);
    return coords;
  };

  // Calculate feeder length using Haversine formula
  const calculateFeederLength = (geoJson: any): number => {
    if (!geoJson?.features) return 0;

    const toRadians = (degrees: number) => degrees * (Math.PI / 180);

    const haversineDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ): number => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    let totalLength = 0;

    const calculateLineStringDistance = (coordinates: number[][]): number => {
      let distance = 0;
      for (let i = 0; i < coordinates.length - 1; i++) {
        const [lon1, lat1] = coordinates[i];
        const [lon2, lat2] = coordinates[i + 1];
        distance += haversineDistance(lat1, lon1, lat2, lon2);
      }
      return distance;
    };

    geoJson.features.forEach((feature: any) => {
      const geometry = feature.geometry;

      if (!geometry) return;

      if (geometry.type === "LineString") {
        // Single LineString: array of coordinates
        totalLength += calculateLineStringDistance(geometry.coordinates);
      } else if (geometry.type === "MultiLineString") {
        // MultiLineString: array of LineStrings
        geometry.coordinates.forEach((lineString: number[][]) => {
          totalLength += calculateLineStringDistance(lineString);
        });
      }
    });

    return totalLength;
  };

  // Load feeder data when component mounts
  useEffect(() => {
    const loadFeederData = async () => {
      if (!id) return;

      setIsLoadingFeeder(true);
      try {
        // 1. Get the inspection to find the feeder_id
        const { data: inspection, error: inspectionError } = await supabase
          .from('inspections')
          .select('feeder_id, feeders:feeder_id(id_unico, name, kml_file_path)')
          .eq('id_unico', id)
          .single();

        if (inspectionError) throw inspectionError;

        // Extract feeder info (handle potential array/object structure)
        const feederInfo = inspection?.feeders as any;
        const feederData = Array.isArray(feederInfo) ? feederInfo[0] : feederInfo;

        if (!feederData?.kml_file_path) {
          console.log('No feeder or KML file found for this inspection');
          return;
        }

        setFeederId(feederData.id_unico);
        setFeederName(feederData.name || "-");

        // 2. Download the KML file from storage
        const { data: kmlFile, error: downloadError } = await supabase.storage
          .from('feeder-kml-files')
          .download(feederData.kml_file_path);

        if (downloadError) throw downloadError;

        // 3. Convert KML to GeoJSON
        const text = await kmlFile.text();
        const doc = new DOMParser().parseFromString(text, 'text/xml');
        const geoJson = toGeoJSON.kml(doc);

        if (geoJson?.features?.length > 0) {
          const lineFeatures = geoJson.features.filter(
            (f: any) =>
              f.geometry?.type === "LineString" ||
              f.geometry?.type === "MultiLineString" ||
              f.geometry?.type === "Polygon" ||
              f.geometry?.type === "MultiPolygon"
          );

          const filteredGeoJson = {
            ...geoJson,
            features: lineFeatures,
          };

          setFeederGeoJson(filteredGeoJson);

          // Calculate and set feeder length
          const length = calculateFeederLength(filteredGeoJson);
          setFeederLength(length);

          // 4. Calculate bounds
          const all: number[][] = [];
          lineFeatures.forEach((f: any) => {
            if (f.geometry) all.push(...getAllCoordinates(f.geometry));
          });

          if (all.length > 0) {
            const lats = all.map((c) => c[1]);
            const lngs = all.map((c) => c[0]);
            const bounds: [[number, number], [number, number]] = [
              [Math.min(...lats), Math.min(...lngs)],
              [Math.max(...lats), Math.max(...lngs)],
            ];
            setFeederBounds(bounds);

            // 5. Zoom to bounds
            if (mapRef.current) {
              setTimeout(() => {
                mapRef.current?.fitBounds(bounds, {
                  paddingTopLeft: [80, 80],
                  paddingBottomRight: [80, 80],
                  animate: true,
                });
              }, 500);
            }
          }
        }
      } catch (error) {
        console.error('Error loading feeder data:', error);
        toast.error('Failed to load feeder data');
      } finally {
        setIsLoadingFeeder(false);
      }
    };

    loadFeederData();
  }, [id]);

  const getActionBadge = (action: string) => {
    if (action === "Immediate Action") {
      return <Badge className="bg-destructive hover:bg-destructive/90 text-white">{t('immediateAction')}</Badge>;
    } else if (action === "Scheduled Action") {
      return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">{t('scheduledAction')}</Badge>;
    }
    return null;
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <div className="flex-1 flex flex-col lg:ml-60 transition-all duration-300">
        <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          <DashboardHeader
            breadcrumbs={[
              { label: t('home'), path: "/" },
              { label: t('inspections'), path: "/distribution" },
              { label: t('distribution'), path: "/distribution" }
            ]}
            title={t('dashboardTitle')}
            subtitle={t('dashboardSubtitle')}
          />
        </div>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-6 space-y-6 overflow-auto max-w-[1600px] mx-auto w-full">{/* Main content */}
          <div className="space-y-6">

            {/* Statistics Section */}
            <Collapsible open={statisticsOpen} onOpenChange={setStatisticsOpen}>
              <Card>
                <CardHeader>
                  <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-70">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      {t('statistics')}
                    </CardTitle>
                    {statisticsOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Charts row removed - both Feeder/Inspection and Actions charts were deleted */}

                      {/* Right Panel - Statistics Cards */}
                      <div className="lg:col-span-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Inspection Statistics */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                              <BarChart3 className="w-4 h-4 text-primary" />
                              {t('inspectionStatistics')}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                              <span className="text-sm font-medium">{t('feederName')}</span>
                              <span className="text-sm text-muted-foreground">{feederName}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                              <span className="text-sm font-medium">{t('feederLength')}</span>
                              <span className="text-sm text-muted-foreground">
                                {feederLength > 0 ? `${feederLength.toFixed(2)} km` : '-'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                              <span className="text-sm font-medium">{t('distanceTraveled')}</span>
                              <span className="text-sm text-muted-foreground">20.97 km</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                              <span className="text-sm font-medium">{t('firstMeasure')}</span>
                              <span className="text-sm text-muted-foreground">30/09/2025 23:17:22</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                              <span className="text-sm font-medium">{t('lastMeasure')}</span>
                              <span className="text-sm text-muted-foreground">01/10/2025 01:29:04</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                              <span className="text-sm font-medium">{t('totalMeasures')}</span>
                              <span className="text-sm text-muted-foreground">891</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-sm font-medium">{t('totalTime')}</span>
                              <span className="text-sm text-muted-foreground">0d 1h 10min 5s</span>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Daily Statistics */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                              <BarChart3 className="w-4 h-4 text-primary" />
                              {t('dailyStatistics')}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-sm font-medium">30/09/2025</span>
                              <span className="text-sm text-muted-foreground">20.97 km • 1h 10min 5s</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Measures Table */}
            <Collapsible open={measuresOpen} onOpenChange={setMeasuresOpen}>
              <Card>
                <CardHeader>
                  <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-70">
                    <CardTitle className="flex items-center gap-2">
                      <ThermometerSun className="w-5 h-5 text-primary" />
                      {t('measuresCarThermographic')}
                    </CardTitle>
                    {measuresOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{t('show')}</span>
                        <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-sm">{t('entries')}</span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('id')}</TableHead>
                            <TableHead>{t('address')}</TableHead>
                            <TableHead>{t('dateLabel')}</TableHead>
                            <TableHead>{t('actionLabel')}</TableHead>
                            <TableHead>{t('hotspot')}</TableHead>
                            <TableHead>{t('reprocessedAt')}</TableHead>
                            <TableHead className="text-right">{t('actionColumn')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoadingMeasures ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8">
                                Loading measures...
                              </TableCell>
                            </TableRow>
                          ) : paginatedData.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8">
                                No measures found for this inspection.
                              </TableCell>
                            </TableRow>
                          ) : (
                            paginatedData.map((measure) => (
                              <TableRow key={measure.id_unico}>
                                <TableCell className="font-mono text-xs">
                                  {measure.id_unico?.substring(0, 20)}...
                                </TableCell>
                                <TableCell>{measure.localizacao || "-"}</TableCell>
                                <TableCell>
                                  <div>{excelDateToJS(measure.data_criacao)}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {measure.data_criacao ? measure.data_criacao.toFixed(4) : '-'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Bell className="w-4 h-4 text-muted-foreground" />
                                </TableCell>
                                <TableCell>
                                  {measure.temp1_c ? measure.temp1_c.toFixed(2) : '-'}
                                </TableCell>
                                <TableCell>-</TableCell>
                                <TableCell className="text-right">
                                  <Button size="sm" onClick={() => navigate(`/measure-image/${measure.id_unico}`)}>
                                    {t('open')}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        {t('showing')} {(currentPage - 1) * parseInt(entriesPerPage) + 1} {t('to')}{" "}
                        {Math.min(currentPage * parseInt(entriesPerPage), measures.length)} {t('of')} {measures.length} {t('entries')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                          {t('previous')}
                        </Button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
                          {t('next')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Map Section */}
            <Collapsible open={mapOpen} onOpenChange={setMapOpen}>
              <Card>
                <CardHeader>
                  <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-70">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      {t('map')}
                    </CardTitle>
                    {mapOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <div className="h-[600px] rounded-lg overflow-hidden relative">
                      <MapContainer
                        {...({
                          center: [-12.8797, -55.4906],
                          zoom: 14,
                          scrollWheelZoom: true,
                          zoomControl: false,
                          style: { height: "100%", width: "100%" },
                        } as any)}
                      >
                        <MapController mapRef={mapRef} />

                        <ZoomControl position="topleft" />

                        <TileLayer
                          url={
                            mapType === "satellite"
                              ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                              : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                          }
                          {...({ attribution: "© CARTO | © OpenStreetMap" } as any)}
                        />


                        {/* Render feeder line if loaded and layer is selected */}
                        {feederGeoJson && selectedLayers.includes("feeder") && (
                          <GeoJSON
                            key={feederId}
                            data={feederGeoJson}
                            {...({
                              pathOptions: {
                                color: "#0d6efd",
                                weight: 3,
                                opacity: 0.9,
                              },
                              pointToLayer: () => null,
                            } as any)}
                          />
                        )}
                      </MapContainer>

                      {/* Map Controls Panel */}
                      <div className="absolute top-4 right-4 bg-card/95 rounded-md shadow-md p-3 space-y-3 text-sm w-48 z-[1000] border">
                        <div>
                          <Label className="text-xs font-semibold">Map Type</Label>
                          <RadioGroup value={mapType} onValueChange={(val: any) => setMapType(val)}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="satellite" id="satellite" />
                              <Label htmlFor="satellite" className="cursor-pointer">
                                Satellite
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="streets" id="streets" />
                              <Label htmlFor="streets" className="cursor-pointer">
                                Streets
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <Label className="text-xs font-semibold">Layers</Label>
                          <div className="max-h-52 overflow-y-auto space-y-1 mt-1">
                            {layerOptions.map((l) => (
                              <div key={l.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={l.id}
                                  checked={selectedLayers.includes(l.id)}
                                  onCheckedChange={() => toggleLayer(l.id)}
                                />
                                <Label htmlFor={l.id} className="cursor-pointer text-sm">
                                  {l.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        </main>

        <footer className="border-t bg-background py-4 px-6">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} MVI. {t('allRightsReserved')}
          </p>
        </footer>
      </div>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}