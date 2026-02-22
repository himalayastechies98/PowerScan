import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { RotateCcw, FileDown, FileType, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Measure, MeasureImage } from "@/hooks/useMeasureData";

interface TopActionBarProps {
    inspectionId: string | null;
    measure?: Measure | null;
    measureImages?: MeasureImage[];
}

// Backend API URL - adjust as needed
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function TopActionBar({ inspectionId, measure, measureImages = [] }: TopActionBarProps) {
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const handleDownloadPDF = async () => {
        if (!measure) {
            toast.error("No measure data available");
            return;
        }

        setIsGeneratingPDF(true);

        try {
            // Find thermal and optical images
            const thermalImage = measureImages.find(img => img.type === 'thermal');
            const opticalImage = measureImages.find(img => img.type === 'optical');

            // Fetch measure actions from database
            const { data: actions } = await supabase
                .from('measure_actions')
                .select('*')
                .eq('measure_id', measure.id_unico)
                .order('marker_index', { ascending: true });

            // Map actions to elements format for the PDF table
            const elements = (actions || []).map((action: any) => ({
                numero_operativo: 'N/A',
                elemento: `(${action.marker_index}) ${action.element_type || '-'}`,
                temperatura: action.temperature ? `${action.temperature}` : '-',
                metodo: '-',
                calculada: '-',
                acao: action.final_action || '-'
            }));

            // Reverse-geocode lat/lon to get a human-readable address (same as InformationSection)
            let resolvedAddress = measure.localizacao || null;
            if (measure.latitude && measure.longitude) {
                try {
                    const geoRes = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${measure.latitude}&lon=${measure.longitude}&zoom=18&addressdetails=1`,
                        {
                            headers: {
                                'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
                                'User-Agent': 'PowerScan/1.0'
                            }
                        }
                    );
                    if (geoRes.ok) {
                        const geoData = await geoRes.json();
                        if (geoData.display_name) {
                            resolvedAddress = geoData.display_name;
                        }
                    }
                } catch {
                    // Silently fall back to raw localizacao value
                }
            }

            // Prepare request body matching the API schema
            const requestBody = {
                measure_data: {
                    id_unico: measure.id_unico,
                    inspection_id: measure.inspection_id,
                    registro_num: measure.registro_num,
                    localizacao: resolvedAddress,
                    latitude: measure.latitude,
                    longitude: measure.longitude,
                    temp1_c: measure.temp1_c,
                    data_criacao: measure.data_criacao,
                    alimentador: measure.alimentador,
                    inspetor: measure.inspetor,
                    regional: measure.regional,
                    severidade: measure.severidade,
                    observations: measure.observations,
                    vel_do_ar_na_inspecao_ms: measure.vel_do_ar_na_inspecao_ms,
                    umidade_relativa: measure.umidade_relativa,
                    carregamento: measure.carregamento,
                    nome_inspecao: measure.nome_inspecao
                },
                thermal_image_url: thermalImage?.url || null,
                optical_image_url: opticalImage?.url || null,
                client_company_logo_url: measure.client_company_logo
                    ? supabase.storage.from('inspection-measure-images').getPublicUrl(measure.client_company_logo).data.publicUrl
                    : null,
                language: i18n.language,
                elements: elements
            };

            const response = await fetch(`${API_BASE_URL}/api/pdf/${measure.id_unico}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Failed to generate PDF: ${response.status}`);
            }

            // Get the PDF blob
            const blob = await response.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `relatorio_medida_${measure.id_unico.slice(0, 8)}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("PDF downloaded successfully!");
        } catch (error) {
            console.error("PDF generation error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to generate PDF");
        } finally {
            setIsGeneratingPDF(false);
        }
    };


    return (
        <div className="flex items-center justify-between bg-muted/30 p-2.5 rounded-lg border">
            <div className="flex items-center gap-1.5">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => inspectionId && navigate(`/distribution/measures/${inspectionId}`)}
                >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Return to Inspection Measures
                </Button>
            </div>
            <div className="flex items-center gap-1.5">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF || !measure}
                >
                    {isGeneratingPDF ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <FileDown className="w-3.5 h-3.5 mr-1.5" />
                            PDF
                        </>
                    )}
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                    <FileType className="w-3.5 h-3.5 mr-1.5" />
                    TIFF
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    Optical
                </Button>
            </div>
        </div>
    );
}
