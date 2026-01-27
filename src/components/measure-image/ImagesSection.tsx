import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Eye, Triangle } from "lucide-react";
import { ImagePanel } from "./ImagePanel";
import { ThermalCanvas, TempHoverInfo } from "./ThermalCanvas";
import { useThermalData } from "@/hooks/useThermalData";
import { PALETTES, PaletteName } from "@/utils/palettes";

import { MeasureImage } from "@/hooks/useMeasureData";

interface ImagesSectionProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    measureImages: MeasureImage[];
}

export function ImagesSection({ isOpen, onOpenChange, measureImages }: ImagesSectionProps) {
    // Image assignment logic:
    // - Find image with type 'thermal'
    // - Find image with type 'optical'
    // - Fallback to index if types are not distinct or both are 'optical' (legacy)

    // Try to find by explicit type first
    let thermalImage = measureImages.find(img => img.type === 'thermal');
    let opticalImage = measureImages.find(img => img.type === 'optical');

    // Fallback logic if everything is 'optical' or type is missing (legacy data)
    // If we have 2 images and we didn't find a thermal one, assume the second one is thermal
    if (!thermalImage && measureImages.length > 1) {
        thermalImage = measureImages[1];
        // Ensure optical matches the first one if we forced the second one to be thermal
        if (!opticalImage) opticalImage = measureImages[0];
    } else if (!opticalImage && measureImages.length > 0) {
        // If we have at least 1 image and didn't find specific optical, make the first one optical (unless it's the thermal one)
        if (measureImages[0] !== thermalImage) {
            opticalImage = measureImages[0];
        }
    }

    const thermalImageSrc = thermalImage?.url || null;
    const opticalImageSrc = opticalImage?.url || null;

    // Thermal processing state
    const { thermalData, loading: thermalLoading, error: thermalError, fetchThermalData } = useThermalData();
    const [palette, setPalette] = useState<PaletteName>('iron');
    const [hoverInfo, setHoverInfo] = useState<TempHoverInfo | null>(null);

    // Fetch thermal data when image source changes
    useEffect(() => {
        if (thermalImageSrc) {
            fetchThermalData(thermalImageSrc);
        }
    }, [thermalImageSrc, fetchThermalData]);

    return (
        <Collapsible open={isOpen} onOpenChange={onOpenChange}>
            <Card>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 border-b">
                    <h3 className="text-base font-semibold text-primary">Images</h3>
                    <ChevronDown className={`w-5 h-5 transition-transform ${!isOpen && "rotate-180"}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="p-0">
                        {/* Temperature Scale Bar and Toolbar */}
                        <TemperatureToolbar
                            palette={palette}
                            onPaletteChange={setPalette}
                            hoverInfo={hoverInfo}
                            minTemp={thermalData?.minTemp}
                            maxTemp={thermalData?.maxTemp}
                        />

                        {/* Images Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 h-[400px]">
                            {/* Thermal Image Panel */}
                            <div className="border-r relative h-full">
                                {thermalLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 text-white">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium">Processing Thermal Data...</span>
                                        </div>
                                    </div>
                                )}
                                {thermalError && (
                                    <div className="absolute top-2 left-2 right-2 bg-red-500/90 text-white p-2 rounded text-xs z-20">
                                        Error: {thermalError}
                                    </div>
                                )}

                                {/* If we have parsed thermal data, show Canvas. Otherwise show the static image fallback */}
                                {thermalData ? (
                                    <ThermalCanvas
                                        thermalData={thermalData}
                                        palette={palette}
                                        minRange={thermalData.minTemp}
                                        maxRange={thermalData.maxTemp}
                                        onHoverTemp={setHoverInfo}
                                    />
                                ) : (
                                    <ImagePanel
                                        imageSrc={thermalImageSrc}
                                        altText="Thermal Image"
                                        placeholderText="No thermal image"
                                        showThermalPlaceholder={true}
                                    />
                                )}
                            </div>

                            {/* Optical Image Panel */}
                            <div className="h-full">
                                <ImagePanel
                                    imageSrc={opticalImageSrc}
                                    altText="Optical Image"
                                    placeholderText="No optical image"
                                    showThermalPlaceholder={false}
                                />
                            </div>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}

interface TemperatureToolbarProps {
    palette: PaletteName;
    onPaletteChange: (p: PaletteName) => void;
    hoverInfo: TempHoverInfo | null;
    minTemp?: number;
    maxTemp?: number;
}

function TemperatureToolbar({ palette, onPaletteChange, hoverInfo, minTemp, maxTemp }: TemperatureToolbarProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <div className="px-4 py-3 bg-white border-b flex items-center justify-between z-30 relative">
            {/* Temperature Scale / Readout */}
            <div className="flex items-center gap-4">
                {hoverInfo ? (
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-md border">
                        <span className="text-xs text-muted-foreground font-medium">Cursor:</span>
                        <span className="text-sm font-bold text-primary">{hoverInfo.temperature.toFixed(2)}°C</span>
                        <span className="text-[10px] text-muted-foreground">({hoverInfo.x}, {hoverInfo.y})</span>
                    </div>
                ) : (
                    <div className="text-xs text-muted-foreground italic">
                        Hover image to measure
                    </div>
                )}

                {minTemp !== undefined && maxTemp !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 font-medium border-l pl-4">
                        <span>Range:</span>
                        <span className="bg-blue-100 text-blue-700 px-1.5 rounded">{minTemp.toFixed(1)}°</span>
                        <span>-</span>
                        <span className="bg-red-100 text-red-700 px-1.5 rounded">{maxTemp.toFixed(1)}°</span>
                    </div>
                )}
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-1.5">
                {/* Palette Selector */}
                <div className="relative">
                    <button
                        className="h-9 px-3 flex items-center gap-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-sm font-medium text-gray-700"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <span>Palette: {PALETTES.find(p => p.id === palette)?.name}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    {dropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-lg py-1 z-50">
                                {PALETTES.map((p) => (
                                    <button
                                        key={p.id}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${palette === p.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                                            }`}
                                        onClick={() => {
                                            onPaletteChange(p.id);
                                            setDropdownOpen(false);
                                        }}
                                    >
                                        {/* Color preview dot */}
                                        <div className={`w-3 h-3 rounded-full border border-black/10`}
                                            style={{
                                                background: p.id === 'iron' ? 'linear-gradient(to right, purple, red, yellow)' :
                                                    p.id === 'rainbow' ? 'linear-gradient(to right, blue, green, red)' :
                                                        p.id === 'whiteHot' ? 'linear-gradient(to right, black, white)' :
                                                            p.id === 'blackHot' ? 'linear-gradient(to right, white, black)' : 'gray'
                                            }}
                                        />
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Legacy buttons (kept for visual consistency if needed, or can be removed) */}
                <button className="h-9 w-9 flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-600" title="Reset View">
                    <Eye className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
