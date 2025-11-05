import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, ChevronDown, Download, RefreshCw, FileText, Upload, FolderOpen, Copy, Edit, Trash2, Bell, MapPin, Sparkles, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DistributionRecord {
  id: string;
  name: string;
  ea: string;
  feeder: string;
  status: string;
  vehicle: string;
  measures: { red: number; yellow: number };
  type: string;
  lastMeasure: string;
}

const dummyData: DistributionRecord[] = [
  { id: "1", name: "2025 EMT - RSI", ea: "RSI_088009_2014237", feeder: "FDR-001", status: "Finalizada", vehicle: "SW4", measures: { red: 5, yellow: 97 }, type: "Thermo-T", lastMeasure: "2025-10-28" },
  { id: "2", name: "2025 EMT - RSI", ea: "RSI_088009_2014238", feeder: "FDR-002", status: "En Progreso", vehicle: "SW5", measures: { red: 12, yellow: 45 }, type: "Visual", lastMeasure: "2025-10-29" },
  { id: "3", name: "2025 EMT - RSI", ea: "RSI_088009_2014239", feeder: "FDR-003", status: "Finalizada", vehicle: "SW4", measures: { red: 3, yellow: 120 }, type: "Thermo-T", lastMeasure: "2025-10-27" },
  { id: "4", name: "2025 EMT - RSI", ea: "RSI_088009_2014240", feeder: "FDR-004", status: "Pendiente", vehicle: "SW6", measures: { red: 8, yellow: 67 }, type: "Híbrido", lastMeasure: "2025-10-26" },
  { id: "5", name: "2025 EMT - RSI", ea: "RSI_088009_2014241", feeder: "FDR-005", status: "Finalizada", vehicle: "SW4", measures: { red: 2, yellow: 89 }, type: "Visual", lastMeasure: "2025-10-30" },
  { id: "6", name: "2025 EMT - RSI", ea: "RSI_088009_2014242", feeder: "FDR-001", status: "En Progreso", vehicle: "SW7", measures: { red: 15, yellow: 34 }, type: "Thermo-T", lastMeasure: "2025-10-25" },
  { id: "7", name: "2025 EMT - RSI", ea: "RSI_088009_2014243", feeder: "FDR-006", status: "Finalizada", vehicle: "SW5", measures: { red: 1, yellow: 156 }, type: "Visual", lastMeasure: "2025-10-24" },
  { id: "8", name: "2025 EMT - RSI", ea: "RSI_088009_2014244", feeder: "FDR-007", status: "Finalizada", vehicle: "SW4", measures: { red: 7, yellow: 78 }, type: "Thermo-T", lastMeasure: "2025-10-23" },
];

interface DistributionProps {
  onNavigate?: (view: string) => void;
}

export default function Distribution({ onNavigate }: DistributionProps) {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({ from: new Date(2025, 7, 31), to: new Date(2025, 9, 30) });
  const [inspections, setInspections] = useState("");
  const [actions, setActions] = useState("");
  const [elements, setElements] = useState("");
  const [cars, setCars] = useState("");
  const [feeders, setFeeders] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = dummyData.filter((record) =>
    Object.values(record).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / parseInt(entriesPerPage));
  const paginatedData = filteredData.slice(
    (currentPage - 1) * parseInt(entriesPerPage),
    currentPage * parseInt(entriesPerPage)
  );

  const handleClear = () => {
    setInspections("");
    setActions("");
    setElements("");
    setCars("");
    setFeeders("");
    setSearchTerm("");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "finalizada": return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "en progreso": return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "pendiente": return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      default: return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        Home &gt; Inspections &gt; Distribution
      </div>

      {/* Filter Section */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from && dateRange.to
                    ? `${format(dateRange.from, "MM/dd/yyyy")} - ${format(dateRange.to, "MM/dd/yyyy")}`
                    : "Select date range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => range?.from && range?.to && setDateRange(range as { from: Date; to: Date })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Inspections</label>
            <Input
              placeholder="Enter inspections"
              value={inspections}
              onChange={(e) => setInspections(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Actions</label>
            <Input
              placeholder="Enter actions"
              value={actions}
              onChange={(e) => setActions(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Elements</label>
            <Input
              placeholder="Enter elements"
              value={elements}
              onChange={(e) => setElements(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Cars</label>
            <Input
              placeholder="Enter cars"
              value={cars}
              onChange={(e) => setCars(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Feeders</label>
            <Input
              placeholder="Enter feeders"
              value={feeders}
              onChange={(e) => setFeeders(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <Button>Filter</Button>
            <Button>Add</Button>
            <Button>Export Car</Button>
          </div>
          <Button variant="link" onClick={handleClear} className="text-primary">
            Clear
          </Button>
        </div>
      </Card>

      {/* Table Section */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Show</span>
            <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm">entries</span>
          </div>

          <div className="w-full sm:w-64">
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>EA</TableHead>
                <TableHead>Feeder</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Measures</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Last Measure</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.name}</TableCell>
                  <TableCell>{record.ea}</TableCell>
                  <TableCell>{record.feeder}</TableCell>
                  <TableCell>
                    <Badge className={cn("font-normal", getStatusColor(record.status))}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.vehicle}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                          {record.measures.red}
                        </div>
                        <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs">
                          {record.measures.yellow}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{record.type}</TableCell>
                  <TableCell>{record.lastMeasure}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Open
                      </Button>
                      <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Action <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reprocess
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          Inspection Report
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onNavigate?.("inspections/distribution/upload")}>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FolderOpen className="mr-2 h-4 w-4" />
                          Re-Open
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Id
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <Bell className="mr-2 h-4 w-4" />
                            Alarms
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem>View Alarms</DropdownMenuItem>
                            <DropdownMenuItem>Configure Alarms</DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <MapPin className="mr-2 h-4 w-4" />
                            Addresses
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem>View Addresses</DropdownMenuItem>
                            <DropdownMenuItem>Edit Addresses</DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <Sparkles className="mr-2 h-4 w-4" />
                            AI
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem>AI Analysis</DropdownMenuItem>
                            <DropdownMenuItem>AI Suggestions</DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuItem>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Update Counters
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * parseInt(entriesPerPage)) + 1} to{" "}
            {Math.min(currentPage * parseInt(entriesPerPage), filteredData.length)} of{" "}
            {filteredData.length} entries
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
