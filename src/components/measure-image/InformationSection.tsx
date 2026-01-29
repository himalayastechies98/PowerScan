import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, Loader2 } from "lucide-react";
import { excelDateToJS, excelTimeToJS } from "@/utils/dateUtils";
import { Measure } from "@/hooks/useMeasureData";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface InformationSectionProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    measure: Measure | null;
    onMeasureUpdated?: (updatedMeasure: Measure) => void;
}

export function InformationSection({ isOpen, onOpenChange, measure, onMeasureUpdated }: InformationSectionProps) {
    const [observations, setObservations] = useState(measure?.observations || "");
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Update local state when measure changes
    useEffect(() => {
        setObservations(measure?.observations || "");
        setHasChanges(false);
    }, [measure?.id_unico]);

    const handleObservationsChange = (value: string) => {
        setObservations(value);
        setHasChanges(value !== (measure?.observations || ""));
    };

    const handleSave = async () => {
        if (!measure?.id_unico) {
            toast.error("No measure selected");
            return;
        }

        setIsSaving(true);
        try {
            const { data, error } = await supabase
                .from('inspection_measure')
                .update({ observations })
                .eq('id_unico', measure.id_unico)
                .select()
                .single();

            if (error) {
                console.error('Error saving observations:', error);
                toast.error("Failed to save observations");
                return;
            }

            toast.success("Observations saved successfully");
            setHasChanges(false);

            // Notify parent component of update
            if (onMeasureUpdated && data) {
                onMeasureUpdated(data as Measure);
            }
        } catch (err) {
            console.error('Error:', err);
            toast.error("An error occurred while saving");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Collapsible open={isOpen} onOpenChange={onOpenChange}>
            <Card>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 border-b">
                    <h3 className="text-base font-semibold text-primary">Information</h3>
                    <ChevronDown className={`w-5 h-5 transition-transform ${!isOpen && "rotate-180"}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-4 gap-x-8 gap-y-5">
                            {/* Row 1 */}
                            <div>
                                <div className="text-sm font-bold mb-1.5">Address</div>
                                <div className="text-sm">{measure?.localizacao || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">Camera</div>
                                <div className="text-sm">-</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">Inference</div>
                                <div className="text-sm">-</div>
                            </div>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="text-sm font-bold mb-1.5">Coordinates</div>
                                    <div className="text-sm">
                                        {measure?.latitude && measure?.longitude
                                            ? `${measure.latitude}, ${measure.longitude}`
                                            : '-'}
                                    </div>
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div>
                                <div className="text-sm font-bold mb-1.5">Date</div>
                                <div className="text-sm">
                                    {excelDateToJS(measure?.data_criacao)} {excelTimeToJS(measure?.data_criacao)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">Relative Humidity</div>
                                <div className="text-sm">-</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">Wind</div>
                                <div className="text-sm">{measure?.vel_do_ar_na_inspecao_ms ? `${measure.vel_do_ar_na_inspecao_ms} m/s` : '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">Temperature</div>
                                <div className="text-sm">
                                    {measure?.temp1_c ? `${measure.temp1_c.toFixed(2)}°C` : '-'}
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div>
                                <div className="text-sm font-bold mb-1.5">Detected Feeders</div>
                                <div className="text-sm">{measure?.alimentador || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">Inspector</div>
                                <div className="text-sm">{measure?.inspetor || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">Regional</div>
                                <div className="text-sm text-primary font-medium">{measure?.regional || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">Severity</div>
                                <div className="text-sm">{measure?.severidade || '-'}</div>
                            </div>

                            {/* Row 4 */}
                            <div className="col-span-3">
                                <div className="text-sm font-bold mb-1.5">Observations</div>
                                <textarea
                                    className="w-full h-24 px-3 py-2 text-sm border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="Enter observations about this measure..."
                                    value={observations}
                                    onChange={(e) => handleObservationsChange(e.target.value)}
                                />
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">Load</div>
                                <div className="flex items-center gap-3">
                                    <Slider value={[100]} max={100} className="flex-1" />
                                    <span className="text-sm font-semibold min-w-[45px]">100%</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <Button
                                variant="default"
                                size="sm"
                                className="h-9 px-4"
                                onClick={handleSave}
                                disabled={isSaving || !hasChanges}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>💾 Save</>
                                )}
                            </Button>
                            {hasChanges && (
                                <span className="ml-3 text-xs text-muted-foreground">Unsaved changes</span>
                            )}
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}
