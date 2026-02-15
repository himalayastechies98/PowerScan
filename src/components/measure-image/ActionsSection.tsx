import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Trash2, Save, Loader2 } from "lucide-react";
import { Marker } from "./ThermalCanvas";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ActionsSectionProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    markers?: Marker[];
    onUpdateMarker?: (id: string, updates: Partial<Marker>) => void;
    onDeleteMarker?: (id: string) => void;
    measureId?: string;
    onLoadMarkers?: (markers: Marker[]) => void;
}

export function ActionsSection({ isOpen, onOpenChange, markers = [], onUpdateMarker, onDeleteMarker, measureId, onLoadMarkers }: ActionsSectionProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Load saved markers from DB on mount / when measureId changes
    useEffect(() => {
        if (!measureId || !onLoadMarkers) return;

        const loadMarkers = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('measure_actions')
                    .select('*')
                    .eq('measure_id', measureId)
                    .order('marker_index', { ascending: true });

                if (error) {
                    console.error('Error loading markers:', error);
                    return;
                }

                if (data && data.length > 0) {
                    const loadedMarkers: Marker[] = data.map((row: any) => ({
                        id: row.id,
                        x: row.x,
                        y: row.y,
                        temperature: Number(row.temperature),
                        elementType: row.element_type || 'Electrical Asset',
                        finalAction: row.final_action || '',
                    }));
                    onLoadMarkers(loadedMarkers);
                }
            } catch (err) {
                console.error('Error loading markers:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadMarkers();
    }, [measureId]);

    // Save all markers to DB
    const handleSaveActions = async () => {
        if (!measureId) {
            toast.error("No measure selected");
            return;
        }

        setIsSaving(true);
        try {
            // Delete existing markers for this measure
            const { error: deleteError } = await supabase
                .from('measure_actions')
                .delete()
                .eq('measure_id', measureId);

            if (deleteError) {
                console.error('Error clearing old markers:', deleteError);
                toast.error("Failed to save actions");
                setIsSaving(false);
                return;
            }

            // Insert current markers
            if (markers.length > 0) {
                const rows = markers.map((marker, index) => ({
                    measure_id: measureId,
                    marker_index: index + 1,
                    x: marker.x,
                    y: marker.y,
                    temperature: marker.temperature,
                    element_type: marker.elementType,
                    final_action: marker.finalAction || '',
                }));

                const { error: insertError } = await supabase
                    .from('measure_actions')
                    .insert(rows);

                if (insertError) {
                    console.error('Error saving markers:', insertError);
                    toast.error("Failed to save actions");
                    setIsSaving(false);
                    return;
                }
            }

            toast.success(`${markers.length} action${markers.length !== 1 ? 's' : ''} saved successfully`);
        } catch (err) {
            console.error('Error saving actions:', err);
            toast.error("Failed to save actions");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Collapsible open={isOpen} onOpenChange={onOpenChange}>
            <Card>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 border-b">
                    <h3 className="text-base font-semibold text-primary">Actions</h3>
                    <div className="flex items-center gap-3">
                        {markers.length > 0 && (
                            <span className="text-xs text-muted-foreground">{markers.length} element{markers.length > 1 ? 's' : ''}</span>
                        )}
                        <ChevronDown className={`w-5 h-5 transition-transform ${!isOpen && "rotate-180"}`} />
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="p-3">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                                <span className="text-sm text-muted-foreground">Loading saved actions...</span>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-2 px-3 text-xs font-semibold w-8">#</th>
                                                <th className="text-left py-2 px-3 text-xs font-semibold">ELEMENT</th>
                                                <th className="text-left py-2 px-3 text-xs font-semibold">POSITION</th>
                                                <th className="text-left py-2 px-3 text-xs font-semibold">TEMPERATURE</th>
                                                <th className="text-left py-2 px-3 text-xs font-semibold">FINAL ACTION</th>
                                                <th className="text-left py-2 px-3 text-xs font-semibold w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {markers.length === 0 ? (
                                                <tr className="border-b hover:bg-muted/30">
                                                    <td className="py-2 px-3" colSpan={6}>
                                                        <div className="text-xs text-muted-foreground text-center">
                                                            No markers placed. Click "Add Marker" in the toolbar above to add elements.
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                markers.map((marker, index) => (
                                                    <tr key={marker.id} className="border-b hover:bg-muted/30">
                                                        <td className="py-2 px-3">
                                                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                                                                {index + 1}
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-3">
                                                            <select
                                                                value={marker.elementType}
                                                                onChange={(e) => onUpdateMarker?.(marker.id, { elementType: e.target.value })}
                                                                className="w-full h-8 px-2 text-sm bg-background border rounded focus:outline-none focus:ring-2 focus:ring-ring"
                                                            >
                                                                <option value="Electrical Asset">Electrical Asset</option>
                                                                <option value="Transformer">Transformer</option>
                                                                <option value="Connector">Connector</option>
                                                                <option value="Insulator">Insulator</option>
                                                                <option value="Switch">Switch</option>
                                                                <option value="Cable Joint">Cable Joint</option>
                                                                <option value="Other">Other</option>
                                                            </select>
                                                        </td>
                                                        <td className="py-2 px-3 font-mono text-xs text-muted-foreground">
                                                            [{marker.x}, {marker.y}]
                                                        </td>
                                                        <td className="py-2 px-3">
                                                            <span className={`font-mono font-semibold ${marker.temperature > 50 ? 'text-red-600' : marker.temperature > 35 ? 'text-orange-600' : 'text-foreground'}`}>
                                                                {marker.temperature.toFixed(1)}°C
                                                            </span>
                                                        </td>
                                                        <td className="py-2 px-3">
                                                            <select
                                                                value={marker.finalAction}
                                                                onChange={(e) => onUpdateMarker?.(marker.id, { finalAction: e.target.value })}
                                                                className="w-full h-8 px-2 text-sm bg-background border rounded focus:outline-none focus:ring-2 focus:ring-ring"
                                                            >
                                                                <option value="">Select action...</option>
                                                                <option value="immediate">Immediate replacement</option>
                                                                <option value="scheduled">Scheduled maintenance</option>
                                                                <option value="monitor">Continue monitoring</option>
                                                                <option value="none">No action required</option>
                                                            </select>
                                                        </td>
                                                        <td className="py-2 px-3">
                                                            <button
                                                                onClick={() => onDeleteMarker?.(marker.id)}
                                                                className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                                                title="Remove marker"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Save Actions Button */}
                                {markers.length > 0 && (
                                    <div className="flex justify-end mt-3 pt-3 border-t">
                                        <button
                                            onClick={handleSaveActions}
                                            disabled={isSaving}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm font-medium transition-colors"
                                        >
                                            {isSaving ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
                                            {isSaving ? 'Saving...' : 'Save Actions'}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}
