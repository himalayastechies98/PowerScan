import { useState, useRef, useEffect, useCallback } from 'react';
import { getColorForValue, PaletteName } from '@/utils/palettes';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, MapPin } from 'lucide-react';

export interface ThermalData {
    width: number;
    height: number;
    minTemp: number;
    maxTemp: number;
    temperatures: number[];
}

export interface TempHoverInfo {
    x: number;
    y: number;
    temperature: number;
}

export interface Marker {
    id: string;
    x: number;
    y: number;
    temperature: number;
    elementType: string;
    finalAction: string;
}

interface ThermalCanvasProps {
    thermalData: ThermalData | null;
    palette: PaletteName;
    minRange: number;
    maxRange: number;
    onHoverTemp: (info: TempHoverInfo | null) => void;
    markers?: Marker[];
    onAddMarker?: (marker: Omit<Marker, 'id' | 'elementType' | 'finalAction'>) => void;
    isAddingMarker?: boolean;
}

export function ThermalCanvas({
    thermalData,
    palette,
    minRange,
    maxRange,
    onHoverTemp,
    markers = [],
    onAddMarker,
    isAddingMarker = false,
}: ThermalCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const renderThermal = useCallback(() => {
        if (!thermalData || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height, temperatures } = thermalData;
        canvas.width = width;
        canvas.height = height;

        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        const tempRange = maxRange - minRange;

        for (let i = 0; i < temperatures.length; i++) {
            const temp = temperatures[i];
            const normalized = tempRange > 0
                ? Math.max(0, Math.min(1, (temp - minRange) / tempRange))
                : 0.5;

            const [r, g, b] = getColorForValue(normalized, palette);

            const pixelIndex = i * 4;
            data[pixelIndex] = r;
            data[pixelIndex + 1] = g;
            data[pixelIndex + 2] = b;
            data[pixelIndex + 3] = 255;
        }

        ctx.putImageData(imageData, 0, 0);
    }, [thermalData, palette, minRange, maxRange]);

    useEffect(() => {
        renderThermal();
    }, [renderThermal]);

    const getTemperatureAtPosition = useCallback((clientX: number, clientY: number): TempHoverInfo | null => {
        if (!thermalData || !canvasRef.current || !containerRef.current) return null;

        const container = containerRef.current;
        const rect = container.getBoundingClientRect();

        const containerX = clientX - rect.left;
        const containerY = clientY - rect.top;

        const imageX = (containerX - offset.x) / scale;
        const imageY = (containerY - offset.y) / scale;

        const { width, height, temperatures } = thermalData;
        if (imageX < 0 || imageX >= width || imageY < 0 || imageY >= height) {
            return null;
        }

        const pixelX = Math.floor(imageX);
        const pixelY = Math.floor(imageY);
        const index = pixelY * width + pixelX;

        return {
            x: pixelX,
            y: pixelY,
            temperature: temperatures[index],
        };
    }, [thermalData, scale, offset]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const tempInfo = getTemperatureAtPosition(e.clientX, e.clientY);
        onHoverTemp?.(tempInfo);
    }, [getTemperatureAtPosition, onHoverTemp]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        onHoverTemp?.(null);
    }, [onHoverTemp]);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    // Handle click to add marker
    const handleClick = useCallback((e: React.MouseEvent) => {
        if (!isAddingMarker || !onAddMarker) return;

        const tempInfo = getTemperatureAtPosition(e.clientX, e.clientY);
        if (tempInfo) {
            onAddMarker({
                x: tempInfo.x,
                y: tempInfo.y,
                temperature: tempInfo.temperature,
            });
        }
    }, [isAddingMarker, onAddMarker, getTemperatureAtPosition]);

    // Fit image to container - calculate scale to fit while maintaining aspect ratio
    const centerImage = useCallback(() => {
        if (thermalData && containerRef.current) {
            const container = containerRef.current;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            if (containerWidth > 0 && containerHeight > 0) {
                // Calculate scale to fit image within container (with padding)
                const padding = 40; // pixels padding on each side
                const availableWidth = containerWidth - padding * 2;
                const availableHeight = containerHeight - padding * 2;

                const scaleX = availableWidth / thermalData.width;
                const scaleY = availableHeight / thermalData.height;

                // Use the smaller scale to ensure image fits in both dimensions
                const fitScale = Math.min(scaleX, scaleY, 1); // Cap at 100%

                const scaledWidth = thermalData.width * fitScale;
                const scaledHeight = thermalData.height * fitScale;

                // Center both horizontally and vertically
                const centerX = (containerWidth - scaledWidth) / 2;
                const centerY = (containerHeight - scaledHeight) / 2;

                setScale(fitScale);
                setOffset({ x: centerX, y: centerY });
            }
        }
    }, [thermalData]);

    useEffect(() => {
        centerImage();
    }, [centerImage]);

    // Button-only zoom with center-based scaling
    const handleZoomIn = useCallback(() => {
        if (!containerRef.current || !thermalData) return;

        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;

        const newScale = Math.min(scale * 1.25, 5);
        const scaleChange = newScale / scale;
        const newOffsetX = centerX - (centerX - offset.x) * scaleChange;
        const newOffsetY = centerY - (centerY - offset.y) * scaleChange;

        setScale(newScale);
        setOffset({ x: newOffsetX, y: newOffsetY });
    }, [scale, offset, thermalData]);

    const handleZoomOut = useCallback(() => {
        if (!containerRef.current || !thermalData) return;

        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;

        const newScale = Math.max(scale * 0.8, 0.25);
        const scaleChange = newScale / scale;
        const newOffsetX = centerX - (centerX - offset.x) * scaleChange;
        const newOffsetY = centerY - (centerY - offset.y) * scaleChange;

        setScale(newScale);
        setOffset({ x: newOffsetX, y: newOffsetY });
    }, [scale, offset, thermalData]);

    if (!thermalData) return null;

    return (
        <div
            ref={containerRef}
            className={`w-full h-full relative overflow-hidden bg-muted ${isAddingMarker ? 'cursor-cell' : 'cursor-crosshair'}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            onClick={handleClick}
        >
            <canvas
                ref={canvasRef}
                className="block absolute top-0 left-0"
                style={{
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                    transformOrigin: '0 0',
                    imageRendering: 'pixelated',
                }}
            />

            {/* Measuring indicator */}
            {isHovered && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-background/90 backdrop-blur-sm rounded border shadow-sm">
                    {isAddingMarker ? (
                        <>
                            <MapPin className="w-3 h-3 text-red-500" />
                            <span className="text-[10px] font-medium uppercase tracking-wide text-red-600">Click to place marker</span>
                        </>
                    ) : (
                        <>
                            <Crosshair className="w-3 h-3 text-green-600" />
                            <span className="text-[10px] font-medium uppercase tracking-wide">Measuring</span>
                        </>
                    )}
                </div>
            )}

            {/* Render markers */}
            {markers.map((marker, index) => {
                const screenX = marker.x * scale + offset.x;
                const screenY = marker.y * scale + offset.y;
                return (
                    <div
                        key={marker.id}
                        className="absolute z-10 cursor-pointer transition-transform hover:scale-110"
                        style={{
                            left: screenX,
                            top: screenY,
                            transform: 'translate(-50%, -100%)',
                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
                        }}
                        title={`${marker.elementType || 'Point'}: ${marker.temperature.toFixed(1)}°C`}
                    >
                        <svg width="18" height="24" viewBox="0 0 18 24" fill="none">
                            <defs>
                                <linearGradient id={`pin-grad-${index}`} x1="9" y1="0" x2="9" y2="24" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#ef4444" />
                                    <stop offset="1" stopColor="#b91c1c" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M9 0C4.03 0 0 4.03 0 9c0 5.25 9 15 9 15s9-9.75 9-15c0-4.97-4.03-9-9-9z"
                                fill={`url(#pin-grad-${index})`}
                                stroke="white"
                                strokeWidth="1.5"
                            />
                            <circle cx="9" cy="9" r="5" fill="white" />
                            <text
                                x="9"
                                y="12"
                                textAnchor="middle"
                                fill="#b91c1c"
                                fontSize="8"
                                fontWeight="700"
                                fontFamily="system-ui, -apple-system, sans-serif"
                            >
                                {index + 1}
                            </text>
                        </svg>
                    </div>
                );
            })}

            {/* Zoom Controls */}
            <div
                className={`absolute bottom-4 right-4 flex items-center gap-1 p-1 bg-background/90 backdrop-blur-sm rounded-lg border shadow-sm transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-50'}`}
            >
                <button onClick={handleZoomOut} className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <ZoomOut className="w-4 h-4" />
                </button>
                <button onClick={handleZoomIn} className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-border" />
                <button onClick={centerImage} className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            {/* Zoom level */}
            {scale !== 1 && (
                <div className="absolute bottom-4 left-4 px-2 py-1 bg-background/90 backdrop-blur-sm rounded text-xs font-mono border shadow-sm">
                    {Math.round(scale * 100)}%
                </div>
            )}
        </div>
    );
}
