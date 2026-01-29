import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DistributionActionMenu } from "./DistributionActionMenu";

interface DistributionRecord {
    id: string;
    name: string;
    ea: string;
    feeder: string;
    feederId: string | null;
    status: string;
    vehicle: string;
    carId: string | null;
    measures: { red: number; yellow: number };
    type: string;
    lastMeasure: string;
}

interface DistributionTableProps {
    data: DistributionRecord[];
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    onDeleteInspection: (id: string) => void;
    onEditInspection: (id: string) => void;
    onStatusChange: (id: string, newStatus: string) => Promise<void>;
    isLoading?: boolean;
}

export function DistributionTable({
    data,
    searchTerm,
    setSearchTerm,
    onDeleteInspection,
    onEditInspection,
    onStatusChange,
    isLoading = false,
}: DistributionTableProps) {
    const navigate = useNavigate();
    const [entriesPerPage, setEntriesPerPage] = useState("10");
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(data.length / parseInt(entriesPerPage));
    const paginatedData = data.slice(
        (currentPage - 1) * parseInt(entriesPerPage),
        currentPage * parseInt(entriesPerPage)
    );

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "finalizada": return "bg-green-500/10 text-green-700 dark:text-green-400";
            case "en progreso": return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
            case "pendiente": return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
            default: return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
        }
    };

    return (
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
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8">
                                    No data found
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium">{record.name}</TableCell>
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
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/distribution/measures/${record.id}`)}
                                            >
                                                Open
                                            </Button>
                                            <DistributionActionMenu
                                                recordId={record.id}
                                                status={record.status}
                                                onDelete={onDeleteInspection}
                                                onEdit={onEditInspection}
                                                onStatusChange={onStatusChange}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
                <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * parseInt(entriesPerPage)) + 1} to{" "}
                    {Math.min(currentPage * parseInt(entriesPerPage), data.length)} of{" "}
                    {data.length} entries
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
    );
}
