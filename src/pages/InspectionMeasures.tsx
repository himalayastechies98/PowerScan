import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProfileModal } from "@/components/ProfileModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ThermometerSun } from "lucide-react";
import { toast } from "sonner";

interface MeasureImage {
    name: string;
    value: string;
}

interface InspectionMeasure {
    id_unico: string;
    registro_num: number;
    data_criacao: number;
    localizacao: string;
    temp1_c: number | null;
    images: MeasureImage[];
    created_at: string;
}

export default function InspectionMeasuresTable() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [measures, setMeasures] = useState<InspectionMeasure[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        if (id) {
            fetchMeasures();
        }
    }, [id]);

    const fetchMeasures = async () => {
        try {
            setLoading(true);

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
            setLoading(false);
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

    return (
        <div className="flex min-h-screen w-full">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onOpenProfile={() => setIsProfileOpen(true)}
            />

            <main className="flex-1 lg:ml-60 transition-all duration-300">
                <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

                <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
                    <DashboardHeader />

                    <div className="space-y-6">
                        {/* Header */}
                        <Card className="p-4">
                            <div className="flex items-center gap-2">
                                <ThermometerSun className="h-5 w-5 text-yellow-600" />
                                <h2 className="text-lg font-semibold">Measures - Car - Thermographic</h2>
                            </div>
                        </Card>

                        {/* Table Card */}
                        <Card className="p-6">
                            {/* Controls */}
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-sm">Show</span>
                                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                                    <SelectTrigger className="w-20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span className="text-sm">entries</span>
                            </div>

                            {/* Table */}
                            {loading ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Loading measures...
                                </div>
                            ) : measures.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No measures found for this inspection.
                                    <Button
                                        className="mt-4 block mx-auto"
                                        onClick={() => navigate(`/upload/${id}`)}
                                    >
                                        Upload Measures
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ID</TableHead>
                                                <TableHead>ADDRESS</TableHead>
                                                <TableHead>DATE</TableHead>
                                                <TableHead>ACTION</TableHead>
                                                <TableHead>HOTSPOT</TableHead>

                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {measures.slice(0, pageSize).map((measure) => (
                                                <TableRow key={measure.id_unico}>
                                                    <TableCell className="font-mono text-xs">
                                                        {measure.id_unico.substring(0, 20)}...
                                                    </TableCell>
                                                    <TableCell>{measure.localizacao || '-'}</TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            {excelDateToJS(measure.data_criacao)}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {measure.data_criacao ? measure.data_criacao.toFixed(4) : '-'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-center">
                                                            🔔
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {measure.temp1_c ? measure.temp1_c.toFixed(2) : '-'}
                                                    </TableCell>

                                                    <TableCell>
                                                        <Button
                                                            size="sm"
                                                            className="bg-yellow-500 hover:bg-yellow-600 text-black"
                                                        >
                                                            Open
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {/* Pagination Info */}
                            {!loading && measures.length > 0 && (
                                <div className="mt-4 text-sm text-muted-foreground">
                                    Showing {Math.min(pageSize, measures.length)} of {measures.length} entries
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </main>

            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </div>
    );
}
