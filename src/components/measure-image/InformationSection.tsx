import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { ChevronDown, Loader2, Map, MapPin, Upload, Thermometer, ThermometerSnowflake, ThermometerSun, X, Building2 } from "lucide-react";
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
    const { t } = useTranslation();
    const [observations, setObservations] = useState(measure?.observations || "");
    const [maxTemp, setMaxTemp] = useState<string>(measure?.temp1_c != null ? String(measure.temp1_c) : "");
    const [minTemp, setMinTemp] = useState<string>(measure?.temp_minima_c != null ? String(measure.temp_minima_c) : "");
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [address, setAddress] = useState<string | null>(null);
    const [addressLoading, setAddressLoading] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [logoUploading, setLogoUploading] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // Update local state when measure changes
    useEffect(() => {
        setObservations(measure?.observations || "");
        setMaxTemp(measure?.temp1_c != null ? String(measure.temp1_c) : "");
        setMinTemp(measure?.temp_minima_c != null ? String(measure.temp_minima_c) : "");
        setHasChanges(false);
        // Load logo URL if path exists
        if (measure?.client_company_logo) {
            const { data } = supabase.storage
                .from('inspection-measure-images')
                .getPublicUrl(measure.client_company_logo);
            setLogoUrl(data.publicUrl);
        } else {
            setLogoUrl(null);
        }
    }, [measure?.id_unico]);

    // Reverse geocoding to get address from coordinates
    useEffect(() => {
        const fetchAddress = async () => {
            if (!measure?.latitude || !measure?.longitude) {
                setAddress(null);
                return;
            }

            setAddressLoading(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${measure.latitude}&lon=${measure.longitude}&zoom=18&addressdetails=1`,
                    {
                        headers: {
                            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
                            'User-Agent': 'PowerScan/1.0'
                        }
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setAddress(data.display_name || null);
                } else {
                    setAddress(null);
                }
            } catch (error) {
                console.error('Error fetching address:', error);
                setAddress(null);
            } finally {
                setAddressLoading(false);
            }
        };

        fetchAddress();
    }, [measure?.latitude, measure?.longitude]);

    const handleObservationsChange = (value: string) => {
        setObservations(value);
        checkForChanges(value, maxTemp, minTemp);
    };

    const handleMaxTempChange = (value: string) => {
        setMaxTemp(value);
        checkForChanges(observations, value, minTemp);
    };

    const handleMinTempChange = (value: string) => {
        setMinTemp(value);
        checkForChanges(observations, maxTemp, value);
    };

    const checkForChanges = (obs: string, max: string, min: string) => {
        const obsChanged = obs !== (measure?.observations || "");
        const maxChanged = max !== (measure?.temp1_c != null ? String(measure.temp1_c) : "");
        const minChanged = min !== (measure?.temp_minima_c != null ? String(measure.temp_minima_c) : "");
        setHasChanges(obsChanged || maxChanged || minChanged);
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !measure?.id_unico) return;

        if (!file.type.startsWith('image/')) {
            toast.error(t('uploadImageError'));
            return;
        }

        setLogoUploading(true);
        try {
            const filePath = `client-logos/${measure.id_unico}/${file.name}`;

            const { error: uploadError } = await supabase.storage
                .from('inspection-measure-images')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                toast.error(t('uploadLogoError'));
                return;
            }

            // Save path to DB
            const { data: updatedMeasure, error: dbError } = await supabase
                .from('inspection_measure')
                .update({ client_company_logo: filePath })
                .eq('id_unico', measure.id_unico)
                .select()
                .single();

            if (dbError) {
                console.error('DB error:', dbError);
                toast.error(t('saveLogoRefError'));
                return;
            }

            if (updatedMeasure) {
                onMeasureUpdated(updatedMeasure);
            }

            const { data } = supabase.storage
                .from('inspection-measure-images')
                .getPublicUrl(filePath);
            setLogoUrl(data.publicUrl);
            toast.success(t('logoUploadedSuccess'));
        } catch (err) {
            console.error('Error:', err);
            toast.error("An error occurred while uploading");
        } finally {
            setLogoUploading(false);
            // Reset file input
            if (logoInputRef.current) logoInputRef.current.value = '';
        }
    };

    const handleRemoveLogo = async () => {
        if (!measure?.id_unico || !measure?.client_company_logo) return;

        try {
            await supabase.storage
                .from('inspection-measure-images')
                .remove([measure.client_company_logo]);

            const { data: updatedMeasure, error: dbError } = await supabase
                .from('inspection_measure')
                .update({ client_company_logo: null })
                .eq('id_unico', measure.id_unico)
                .select()
                .single();

            if (dbError) throw dbError;

            if (updatedMeasure) {
                onMeasureUpdated(updatedMeasure);
            }

            setLogoUrl(null);
            toast.success(t('logoRemovedSuccess'));
        } catch (err) {
            console.error('Error removing logo:', err);
            toast.error(t('removeLogoError'));
        }
    };

    const handleSave = async () => {
        if (!measure?.id_unico) {
            toast.error("No measure selected");
            return;
        }

        setIsSaving(true);
        try {
            // Validate: max temp should not be less than min temp
            if (maxTemp !== "" && minTemp !== "") {
                const maxVal = parseFloat(maxTemp);
                const minVal = parseFloat(minTemp);
                if (maxVal < minVal) {
                    toast.warning(t('maxMinTempWarning'));
                    setIsSaving(false);
                    return;
                }
            }

            const updatePayload: Record<string, any> = { observations };
            if (maxTemp !== "") updatePayload.temp1_c = parseFloat(maxTemp);
            else updatePayload.temp1_c = null;
            if (minTemp !== "") updatePayload.temp_minima_c = parseFloat(minTemp);
            else updatePayload.temp_minima_c = null;

            const { data, error } = await supabase
                .from('inspection_measure')
                .update(updatePayload)
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
                    <h3 className="text-base font-semibold text-primary">{t('information')}</h3>
                    <ChevronDown className={`w-5 h-5 transition-transform ${!isOpen && "rotate-180"}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-4 gap-x-8 gap-y-5">
                            {/* Row 1 */}
                            <div>
                                <div className="text-sm font-bold mb-1.5 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {t('location')}
                                </div>
                                <div className="text-sm">
                                    {addressLoading ? (
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            {t('loadingAddress')}
                                        </span>
                                    ) : address ? (
                                        <span className="text-foreground">{address}</span>
                                    ) : measure?.localizacao ? (
                                        measure.localizacao
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">{t('camera')}</div>
                                <div className="text-sm">-</div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <div className="text-sm font-bold mb-1.5">{t('coordinates')}</div>
                                    <div className="text-sm">
                                        {measure?.latitude && measure?.longitude
                                            ? `${measure.latitude}, ${measure.longitude}`
                                            : '-'}
                                    </div>
                                </div>
                                {measure?.latitude && measure?.longitude && (
                                    <a
                                        href={`https://maps.google.com/maps?q=&layer=c&cbll=${measure.latitude},${measure.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#2563EB] text-white hover:bg-[#1d4ed8] transition-colors shadow-sm mt-1"
                                        title={t('openInGoogleMaps')}
                                    >
                                        <Map className="w-5 h-5" />
                                    </a>
                                )}
                            </div>

                            {/* Row 2 */}
                            <div>
                                <div className="text-sm font-bold mb-1.5">{t('date')}</div>
                                <div className="text-sm">
                                    {excelDateToJS(measure?.data_criacao)} {excelTimeToJS(measure?.data_criacao)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">{t('relative_humidity')}</div>
                                <div className="text-sm">-</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">{t('wind')}</div>
                                <div className="text-sm">{measure?.vel_do_ar_na_inspecao_ms ? `${measure.vel_do_ar_na_inspecao_ms} m/s` : '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">{t('temperature')}</div>
                                <div className="text-sm">
                                    {measure?.temp1_c ? `${measure.temp1_c.toFixed(2)}°C` : '-'}
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div>
                                <div className="text-sm font-bold mb-1.5">{t('detectedFeeders')}</div>
                                <div className="text-sm">{measure?.alimentador || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">{t('inspector')}</div>
                                <div className="text-sm">{measure?.inspetor || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">{t('regional')}</div>
                                <div className="text-sm text-primary font-medium">{measure?.regional || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">{t('severity')}</div>
                                <div className="text-sm">{measure?.severidade || '-'}</div>
                            </div>

                            {/* Row 4 - Logo, Max Temp, Min Temp */}
                            <div>
                                <div className="text-sm font-bold mb-1.5 flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5" />
                                    {t('clientLogo')}
                                </div>
                                <div className="text-sm">
                                    {logoUrl ? (
                                        <div className="relative inline-block group">
                                            <img
                                                src={logoUrl}
                                                alt="Client logo"
                                                className="h-12 max-w-[120px] object-contain rounded border bg-white p-1"
                                            />
                                            <button
                                                onClick={handleRemoveLogo}
                                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                                title={t('removeLogo')}
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => logoInputRef.current?.click()}
                                            disabled={logoUploading}
                                            className="flex items-center gap-2 px-3 py-2 text-xs border border-dashed rounded-md hover:bg-muted/50 transition-colors text-muted-foreground"
                                        >
                                            {logoUploading ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Upload className="w-3.5 h-3.5" />
                                            )}
                                            {logoUploading ? t('uploading') : t('uploadLogo')}
                                        </button>
                                    )}
                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleLogoUpload}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5 flex items-center gap-1.5">
                                    <ThermometerSun className="w-3.5 h-3.5 text-red-500" />
                                    {t('maxTemp')}
                                </div>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-24 px-2 py-1 text-sm border rounded-md bg-background text-red-600 font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                                        placeholder="—"
                                        value={maxTemp}
                                        onChange={(e) => handleMaxTempChange(e.target.value)}
                                    />
                                    <span className="text-sm text-muted-foreground">°C</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5 flex items-center gap-1.5">
                                    <ThermometerSnowflake className="w-3.5 h-3.5 text-blue-500" />
                                    {t('minTemp')}
                                </div>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-24 px-2 py-1 text-sm border rounded-md bg-background text-blue-600 font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                                        placeholder="—"
                                        value={minTemp}
                                        onChange={(e) => handleMinTempChange(e.target.value)}
                                    />
                                    <span className="text-sm text-muted-foreground">°C</span>
                                </div>
                            </div>
                            <div /> {/* Empty 4th column */}

                            {/* Row 5 - Observations */}
                            <div className="col-span-4">
                                <div className="text-sm font-bold mb-1.5">{t('observations')}</div>
                                <textarea
                                    className="w-full h-24 px-3 py-2 text-sm border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder={t('observationsPlaceholder')}
                                    value={observations}
                                    onChange={(e) => handleObservationsChange(e.target.value)}
                                />
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
                                        {t('loading')}
                                    </>
                                ) : (
                                    <>💾 {t('save')}</>
                                )}
                            </Button>
                            {hasChanges && (
                                <span className="ml-3 text-xs text-muted-foreground">{t('unsavedChanges')}</span>
                            )}
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}
