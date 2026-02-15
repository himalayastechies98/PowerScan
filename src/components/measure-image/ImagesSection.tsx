import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Thermometer, Camera, Palette, Maximize2, Download, Settings2, MapPin } from "lucide-react";
import { ImagePanel } from "./ImagePanel";
import { ThermalCanvas, TempHoverInfo, Marker } from "./ThermalCanvas";
import { useThermalData } from "@/hooks/useThermalData";
import { PALETTES, PaletteName } from "@/utils/palettes";

import { MeasureImage } from "@/hooks/useMeasureData";

// Professional Skeleton Loading Component
function ImageSkeleton({ variant }: { variant: 'thermal' | 'optical' }) {
    return (
        <div className="absolute inset-0 z-40 overflow-hidden">
            {/* Skeleton Background */}
            <div className={`absolute inset-0 ${variant === 'thermal' ? 'bg-slate-200 dark:bg-slate-800' : 'bg-slate-100 dark:bg-slate-700'}`} />

            {/* Shimmer Animation */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]">
                <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent skew-x-[-20deg]" />
            </div>

            {/* Content Skeleton */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
                {/* Image placeholder */}
                <div className={`w-3/4 h-48 rounded-lg ${variant === 'thermal' ? 'bg-slate-300 dark:bg-slate-700' : 'bg-slate-200 dark:bg-slate-600'}`} />

                {/* Label skeleton */}
                <div className="flex flex-col items-center gap-2">
                    <div className="h-3 w-32 rounded bg-slate-300 dark:bg-slate-600" />
                    <div className="h-2 w-20 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
            </div>

            {/* Pulse ring effect in center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                    <div className={`w-16 h-16 rounded-full ${variant === 'thermal' ? 'bg-red-500/20' : 'bg-blue-500/20'} animate-ping`} />
                    <div className={`absolute inset-0 w-16 h-16 rounded-full ${variant === 'thermal' ? 'bg-red-500/30' : 'bg-blue-500/30'} animate-pulse flex items-center justify-center`}>
                        {variant === 'thermal' ? (
                            <Thermometer className="w-6 h-6 text-red-500" />
                        ) : (
                            <Camera className="w-6 h-6 text-blue-500" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ImagesSectionProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    measureImages: MeasureImage[];
    markers?: Marker[];
    onMarkersChange?: (markers: Marker[]) => void;
    maxTemperature?: number | null; // temp1_c from measure
    minTemperature?: number | null; // temp_minima_c from measure
}

export function ImagesSection({ isOpen, onOpenChange, measureImages, markers: externalMarkers, onMarkersChange, maxTemperature, minTemperature }: ImagesSectionProps) {
    // Track previous images to detect changes
    const prevImagesRef = useRef<string>("");
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showContent, setShowContent] = useState(true);

    let thermalImage = measureImages.find(img => img.type === 'thermal');
    let opticalImage = measureImages.find(img => img.type === 'optical');

    if (!thermalImage && measureImages.length > 1) {
        thermalImage = measureImages[1];
        if (!opticalImage) opticalImage = measureImages[0];
    } else if (!opticalImage && measureImages.length > 0) {
        if (measureImages[0] !== thermalImage) {
            opticalImage = measureImages[0];
        }
    }

    const thermalImageSrc = thermalImage?.url || null;
    const opticalImageSrc = opticalImage?.url || null;

    const { thermalData, loading: thermalLoading, error: thermalError, fetchThermalData } = useThermalData();
    const [palette, setPalette] = useState<PaletteName>('iron');
    const [hoverInfo, setHoverInfo] = useState<TempHoverInfo | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [manualMinTemp, setManualMinTemp] = useState<number | null>(null);
    const [manualMaxTemp, setManualMaxTemp] = useState<number | null>(null);
    const [isEditingRange, setIsEditingRange] = useState(false);
    const [markers, setMarkersInternal] = useState<Marker[]>([]);
    const [isAddingMarker, setIsAddingMarker] = useState(false);

    // Use external markers if provided, otherwise use internal state
    const currentMarkers = externalMarkers ?? markers;
    const setMarkers = (newMarkers: Marker[] | ((prev: Marker[]) => Marker[])) => {
        const resolvedMarkers = typeof newMarkers === 'function' ? newMarkers(currentMarkers) : newMarkers;
        if (onMarkersChange) {
            onMarkersChange(resolvedMarkers);
        } else {
            setMarkersInternal(resolvedMarkers);
        }
    };

    // Handle adding a new marker
    const handleAddMarker = (markerData: Omit<Marker, 'id' | 'elementType' | 'finalAction'>) => {
        const newMarker: Marker = {
            ...markerData,
            id: `marker-${Date.now()}`,
            elementType: 'Electrical Asset',
            finalAction: '',
        };
        setMarkers([...currentMarkers, newMarker]);
        setIsAddingMarker(false); // Exit marker mode after placing
    };

    // Detect when measure images change and trigger smooth transition
    useEffect(() => {
        const currentKey = measureImages.map(img => img.url).join(',');

        if (prevImagesRef.current && prevImagesRef.current !== currentKey) {
            // Phase 1: Hide content and show skeleton
            setShowContent(false);
            setIsTransitioning(true);

            // Phase 2: After skeleton displays, fade in new content
            const timer = setTimeout(() => {
                setShowContent(true);
                setIsTransitioning(false);
            }, 600);

            return () => clearTimeout(timer);
        }

        prevImagesRef.current = currentKey;
    }, [measureImages]);

    useEffect(() => {
        if (thermalImageSrc) {
            // Pass the actual max temperature from measure for proper calibration
            fetchThermalData(thermalImageSrc, maxTemperature ?? undefined);
        }
    }, [thermalImageSrc, fetchThermalData, maxTemperature]);

    // Use manual values if set, otherwise use data from thermal API
    const minTemp = manualMinTemp ?? thermalData?.minTemp ?? 20;
    const maxTemp = manualMaxTemp ?? thermalData?.maxTemp ?? 100;

    // Reset manual values when thermal data or saved temps change
    useEffect(() => {
        if (thermalData) {
            // If saved temps exist, use them as the initial range
            setManualMinTemp(minTemperature != null ? Number(minTemperature) : null);
            setManualMaxTemp(maxTemperature != null ? Number(maxTemperature) : null);
        }
    }, [thermalData?.minTemp, thermalData?.maxTemp, maxTemperature, minTemperature]);

    return (
        <Collapsible open={isOpen} onOpenChange={onOpenChange}>
            <Card>
                {/* Section Header - Same as Information section */}
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 border-b">
                    <h3 className="text-base font-semibold text-primary">Image Analysis</h3>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{measureImages.length} images</span>
                        <ChevronDown className={`w-5 h-5 transition-transform ${!isOpen && "rotate-180"}`} />
                    </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <CardContent className="p-6">
                        {/* Main Toolbar */}
                        <div className="bg-muted/50 border-b px-4 py-2.5">
                            <div className="flex items-center justify-between">
                                {/* Left: Temperature Readout */}
                                <div className="flex items-center gap-6">
                                    {/* Current Temperature */}
                                    <div className="flex items-center gap-3">
                                        {hoverInfo ? (
                                            <>
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg border">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                    <span className="text-[11px] font-medium text-green-600 uppercase tracking-wide">Live</span>
                                                </div>
                                                <div className="text-2xl font-mono font-bold tracking-tight">
                                                    {hoverInfo.temperature.toFixed(1)}<span className="text-lg text-muted-foreground">°C</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    [{hoverInfo.x}, {hoverInfo.y}]
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">Hover to measure temperature</span>
                                        )}
                                    </div>

                                    {/* Temperature Range */}
                                    {thermalData && (
                                        <div className="flex items-center gap-2 pl-6 border-l">
                                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Range</span>
                                            <div className="flex items-center gap-1.5 text-sm font-mono">
                                                <span className="text-blue-600">{minTemp.toFixed(1)}°</span>
                                                <span className="text-muted-foreground">→</span>
                                                <span className="text-red-600">{maxTemp.toFixed(1)}°</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right: Controls */}
                                <div className="flex items-center gap-2">
                                    {/* Palette Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                            className="flex items-center gap-2 h-8 px-3 bg-background hover:bg-muted border rounded-lg text-sm transition-colors"
                                        >
                                            <div
                                                className="w-4 h-4 rounded-sm border"
                                                style={{
                                                    background: palette === 'iron' ? 'linear-gradient(135deg, #2d1b4e, #dc2626, #fbbf24)' :
                                                        palette === 'rainbow' ? 'linear-gradient(135deg, #3b82f6, #22c55e, #ef4444)' :
                                                            palette === 'whiteHot' ? 'linear-gradient(135deg, #0f172a, #f8fafc)' :
                                                                'linear-gradient(135deg, #f8fafc, #0f172a)'
                                                }}
                                            />
                                            <span>{PALETTES.find(p => p.id === palette)?.name}</span>
                                            <ChevronDown className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {dropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                                                <div className="absolute right-0 top-full mt-1 w-44 bg-popover border rounded-lg shadow-xl py-1 z-50">
                                                    {PALETTES.map((p) => (
                                                        <button
                                                            key={p.id}
                                                            onClick={() => { setPalette(p.id); setDropdownOpen(false); }}
                                                            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 transition-colors ${palette === p.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                                                        >
                                                            <div
                                                                className="w-5 h-5 rounded-sm border"
                                                                style={{
                                                                    background: p.id === 'iron' ? 'linear-gradient(135deg, #2d1b4e, #dc2626, #fbbf24)' :
                                                                        p.id === 'rainbow' ? 'linear-gradient(135deg, #3b82f6, #22c55e, #ef4444)' :
                                                                            p.id === 'whiteHot' ? 'linear-gradient(135deg, #0f172a, #f8fafc)' :
                                                                                'linear-gradient(135deg, #f8fafc, #0f172a)'
                                                                }}
                                                            />
                                                            {p.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="w-px h-6 bg-border" />

                                    {/* Add Marker Button */}
                                    <button
                                        onClick={() => setIsAddingMarker(!isAddingMarker)}
                                        className={`h-8 px-3 flex items-center gap-2 rounded-lg transition-colors ${isAddingMarker ? 'bg-red-500 text-white hover:bg-red-600' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                                        title="Add marker to thermal image"
                                    >
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-sm">{isAddingMarker ? 'Cancel' : 'Add Marker'}</span>
                                    </button>

                                    {currentMarkers.length > 0 && (
                                        <span className="text-xs text-muted-foreground">
                                            {currentMarkers.length} marker{currentMarkers.length > 1 ? 's' : ''}
                                        </span>
                                    )}

                                    <div className="w-px h-6 bg-border" />

                                    <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Fullscreen">
                                        <Maximize2 className="w-4 h-4" />
                                    </button>
                                    <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Download">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Dual Image Viewer */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 bg-slate-300 dark:bg-slate-600 relative">
                            {/* THERMAL PANEL */}
                            <div className="relative bg-muted min-h-[480px] ml-2.5">
                                {/* Skeleton Loading */}
                                {isTransitioning && <ImageSkeleton variant="thermal" />}

                                {/* Panel Label */}
                                <div className={`absolute top-3 left-3 z-20 flex items-center gap-2 px-2.5 py-1 bg-background/90 backdrop-blur-sm rounded border shadow-sm transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                                    <Thermometer className="w-3.5 h-3.5 text-red-500" />
                                    <span className="text-xs font-medium">Thermal</span>
                                    {thermalData && (
                                        <span className="text-[10px] text-muted-foreground font-mono">{thermalData.width}×{thermalData.height}</span>
                                    )}
                                </div>

                                {/* Loading thermal data */}
                                {thermalLoading && !isTransitioning && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-muted z-30">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="relative w-12 h-12">
                                                <div className="absolute inset-0 border-2 border-muted-foreground/20 rounded-full" />
                                                <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm">Processing thermal data</p>
                                                <p className="text-xs text-muted-foreground mt-1">Extracting temperature matrix...</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Error */}
                                {thermalError && (
                                    <div className="absolute top-14 left-3 right-3 z-30 bg-destructive/10 backdrop-blur-sm border border-destructive/50 rounded-lg p-3">
                                        <p className="text-sm text-destructive">{thermalError}</p>
                                    </div>
                                )}

                                {/* Thermal Image/Canvas */}
                                <div className={`h-full min-h-[480px] transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
                                    {thermalData ? (
                                        <ThermalCanvas
                                            thermalData={thermalData}
                                            palette={palette}
                                            minRange={minTemp}
                                            maxRange={maxTemp}
                                            onHoverTemp={setHoverInfo}
                                            markers={currentMarkers}
                                            onAddMarker={handleAddMarker}
                                            isAddingMarker={isAddingMarker}
                                        />
                                    ) : (
                                        <ImagePanel
                                            imageSrc={thermalImageSrc}
                                            altText="Thermal"
                                            placeholderText="No thermal image"
                                            variant="thermal"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* OPTICAL PANEL */}
                            <div className="relative bg-muted min-h-[480px]">
                                {/* Skeleton Loading */}
                                {isTransitioning && <ImageSkeleton variant="optical" />}

                                {/* Panel Label */}
                                <div className={`absolute top-3 left-3 z-20 flex items-center gap-2 px-2.5 py-1 bg-background/90 backdrop-blur-sm rounded border shadow-sm transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                                    <span className="text-xs font-medium">Optical</span>
                                    <span className="text-[10px] text-muted-foreground">RGB</span>
                                </div>

                                <div className={`h-full min-h-[480px] transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
                                    <ImagePanel
                                        imageSrc={opticalImageSrc}
                                        altText="Optical"
                                        placeholderText="No optical image"
                                        variant="optical"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Temperature Color Scale - Footer with Range Slider */}
                        {thermalData && (
                            <div className="bg-muted/50 border-t px-4 py-3">
                                <div className="flex flex-col gap-2">
                                    {/* Header row with Scale label and settings */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Palette className="w-4 h-4" />
                                            <span className="text-xs font-medium uppercase tracking-wide">Scale</span>
                                        </div>

                                        {/* Reset button */}
                                        {(manualMinTemp !== null || manualMaxTemp !== null) && (
                                            <button
                                                onClick={() => {
                                                    setManualMinTemp(null);
                                                    setManualMaxTemp(null);
                                                }}
                                                className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-background"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>

                                    {/* Temperature labels above scale bar */}
                                    <div className="flex items-center justify-between text-xs font-mono">
                                        {/* Min temp label */}
                                        <div className="bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                                            <span className="font-semibold text-blue-600">{minTemp.toFixed(1)}°C</span>
                                        </div>

                                        {/* Mid temp label */}
                                        <div className="bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded">
                                            <span className="font-semibold text-orange-600">{((minTemp + maxTemp) / 2).toFixed(1)}°C</span>
                                        </div>

                                        {/* Max temp label */}
                                        <div className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">{maxTemp.toFixed(1)}°C</span>
                                        </div>
                                    </div>

                                    {/* Range Slider with Color Gradient */}
                                    <div className="relative h-8 select-none">
                                        {/* Full gradient background (dimmed) */}
                                        <div
                                            className="absolute inset-x-0 top-1 h-5 rounded-sm border opacity-40"
                                            style={{
                                                background: palette === 'iron'
                                                    ? 'linear-gradient(to right, #1a0a2e, #4c1130, #7f1d1d, #dc2626, #f59e0b, #fde047)'
                                                    : palette === 'rainbow'
                                                        ? 'linear-gradient(to right, #1e3a8a, #0891b2, #16a34a, #facc15, #dc2626)'
                                                        : palette === 'whiteHot'
                                                            ? 'linear-gradient(to right, #020617, #334155, #94a3b8, #e2e8f0, #f8fafc)'
                                                            : 'linear-gradient(to right, #f8fafc, #e2e8f0, #94a3b8, #334155, #020617)'
                                            }}
                                        />

                                        {/* Selected range (bright) */}
                                        {(() => {
                                            const dataMin = thermalData?.minTemp ?? 0;
                                            const dataMax = thermalData?.maxTemp ?? 100;
                                            const range = dataMax - dataMin;
                                            const leftPercent = range > 0 ? ((minTemp - dataMin) / range) * 100 : 0;
                                            const rightPercent = range > 0 ? ((maxTemp - dataMin) / range) * 100 : 100;

                                            return (
                                                <div
                                                    className="absolute top-1 h-5 rounded-sm border-2 border-white shadow-lg"
                                                    style={{
                                                        left: `${Math.max(0, leftPercent)}%`,
                                                        right: `${Math.max(0, 100 - rightPercent)}%`,
                                                        background: palette === 'iron'
                                                            ? 'linear-gradient(to right, #1a0a2e, #4c1130, #7f1d1d, #dc2626, #f59e0b, #fde047)'
                                                            : palette === 'rainbow'
                                                                ? 'linear-gradient(to right, #1e3a8a, #0891b2, #16a34a, #facc15, #dc2626)'
                                                                : palette === 'whiteHot'
                                                                    ? 'linear-gradient(to right, #020617, #334155, #94a3b8, #e2e8f0, #f8fafc)'
                                                                    : 'linear-gradient(to right, #f8fafc, #e2e8f0, #94a3b8, #334155, #020617)'
                                                    }}
                                                />
                                            );
                                        })()}

                                        {/* Dual Range Inputs */}
                                        <input
                                            type="range"
                                            min={thermalData?.minTemp ?? 0}
                                            max={thermalData?.maxTemp ?? 100}
                                            step="0.1"
                                            value={minTemp}
                                            onChange={(e) => {
                                                const newMin = parseFloat(e.target.value);
                                                if (newMin < maxTemp - 1) {
                                                    setManualMinTemp(newMin);
                                                }
                                            }}
                                            className="absolute inset-x-0 top-0 h-8 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded [&::-webkit-slider-thumb]:cursor-ew-resize [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:rounded [&::-moz-range-thumb]:cursor-ew-resize [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg"
                                            style={{ zIndex: minTemp > (thermalData?.maxTemp ?? 100) - 10 ? 5 : 3 }}
                                        />
                                        <input
                                            type="range"
                                            min={thermalData?.minTemp ?? 0}
                                            max={thermalData?.maxTemp ?? 100}
                                            step="0.1"
                                            value={maxTemp}
                                            onChange={(e) => {
                                                const newMax = parseFloat(e.target.value);
                                                if (newMax > minTemp + 1) {
                                                    setManualMaxTemp(newMax);
                                                }
                                            }}
                                            className="absolute inset-x-0 top-0 h-8 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:rounded [&::-webkit-slider-thumb]:cursor-ew-resize [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:bg-red-500 [&::-moz-range-thumb]:rounded [&::-moz-range-thumb]:cursor-ew-resize [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg"
                                            style={{ zIndex: 4 }}
                                        />
                                    </div>

                                    {/* Temperature tick values below the bar */}
                                    <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                                        {Array.from({ length: 11 }).map((_, i) => {
                                            const dataMin = thermalData?.minTemp ?? 0;
                                            const dataMax = thermalData?.maxTemp ?? 100;
                                            const temp = dataMin + (dataMax - dataMin) * (i / 10);
                                            return (
                                                <span key={i} className="w-8 text-center">
                                                    {temp.toFixed(temp < 10 ? 1 : 0)}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible >
    );
}
