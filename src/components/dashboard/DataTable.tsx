import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, Share2, FileText, BarChart3, Eye, Download, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const inspections = [
  {
    id: "INS-2023-1458",
    location: "North District - Sector 7",
    date: "Apr 5, 2025",
    type: "Thermal",
    status: "warning",
    temperature: "78.5°C",
  },
  {
    id: "INS-2023-1457",
    location: "East District - Main Line",
    date: "Apr 4, 2025",
    type: "Visual",
    status: "normal",
    temperature: "42.1°C",
  },
  {
    id: "INS-2023-1456",
    location: "South District - Junction B",
    date: "Apr 3, 2025",
    type: "Corona",
    status: "critical",
    temperature: "92.7°C",
  },
  {
    id: "INS-2023-1455",
    location: "West District - Substation 3",
    date: "Apr 3, 2025",
    type: "Lidar",
    status: "normal",
    temperature: "39.2°C",
  },
  {
    id: "INS-2023-1454",
    location: "North District - Tower 42",
    date: "Apr 2, 2025",
    type: "Thermal",
    status: "warning",
    temperature: "67.8°C",
  },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case "normal":
      return "default";
    case "warning":
      return "secondary";
    case "critical":
      return "destructive";
    default:
      return "default";
  }
};

export function DataTable() {
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-4">
        <CardTitle>Recent Inspections</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200 hidden sm:inline-flex">
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 hidden sm:inline-flex">
            <BarChart3 className="w-4 h-4 mr-2" />
            Power BI
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Location</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Temperature</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((inspection) => (
                <tr key={inspection.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 text-sm">{inspection.id}</td>
                  <td className="py-3 px-4 text-sm hidden md:table-cell">{inspection.location}</td>
                  <td className="py-3 px-4 text-sm hidden sm:table-cell">{inspection.date}</td>
                  <td className="py-3 px-4 text-sm">{inspection.type}</td>
                  <td className="py-3 px-4">
                    <Badge variant={getStatusVariant(inspection.status)} className="capitalize">
                      {inspection.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm hidden lg:table-cell">{inspection.temperature}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
          <p className="text-sm text-muted-foreground">Showing 1 to 5 of 125 entries</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="default" size="icon" className="h-8 w-8">
              1
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              2
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              3
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 hidden sm:inline-flex">
              ...
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 hidden sm:inline-flex">
              25
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
