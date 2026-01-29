import { useState, useRef, useEffect, useCallback } from 'react';
import { getColorForValue, PaletteName } from '@/utils/palettes';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair } from 'lucide-react';

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

interface ThermalCanvasProps {
    thermalData: ThermalData | null;
    palette: PaletteName;
    minRange: number;
    maxRange: number;
    onHoverTemp: (info: TempHoverInfo | null) => void;
}

export function ThermalCanvas({
    thermalData,
    palette,
    minRange,
    maxRange,
    onHoverTemp,
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

    // Fit image to container - fixed 52% initial scale, centered
    const centerImage = useCallback(() => {
        if (thermalData && containerRef.current) {
            const container = containerRef.current;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            if (containerWidth > 0 && containerHeight > 0) {
                // Fixed 52% initial scale
                const fitScale = 0.52;

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
            className="w-full h-full relative overflow-hidden bg-muted cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
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
                    <Crosshair className="w-3 h-3 text-green-600" />
                    <span className="text-[10px] font-medium uppercase tracking-wide">Measuring</span>
                </div>
            )}

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
