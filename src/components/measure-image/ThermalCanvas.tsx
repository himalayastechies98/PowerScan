import { useState, useRef, useEffect, useCallback } from 'react';
import { getColorForValue, PaletteName } from '@/utils/palettes';

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

    // Zoom and pan state
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastPanPos, setLastPanPos] = useState({ x: 0, y: 0 });

    // Render thermal image to canvas
    const renderThermal = useCallback(() => {
        if (!thermalData || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height, temperatures } = thermalData;

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Create image data
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Temperature range for normalization
        const tempRange = maxRange - minRange;

        // Convert temperatures to colors
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
            data[pixelIndex + 3] = 255; // Alpha
        }

        ctx.putImageData(imageData, 0, 0);
    }, [thermalData, palette, minRange, maxRange]);

    // Render when data or settings change
    useEffect(() => {
        renderThermal();
    }, [renderThermal]);

    // Get temperature at mouse position
    const getTemperatureAtPosition = useCallback((clientX: number, clientY: number): TempHoverInfo | null => {
        if (!thermalData || !canvasRef.current || !containerRef.current) return null;

        const container = containerRef.current;
        const rect = container.getBoundingClientRect();

        // Get position relative to container
        const containerX = clientX - rect.left;
        const containerY = clientY - rect.top;

        // Account for zoom and pan
        const imageX = (containerX - offset.x) / scale;
        const imageY = (containerY - offset.y) / scale;

        // Check bounds
        const { width, height, temperatures } = thermalData;
        if (imageX < 0 || imageX >= width || imageY < 0 || imageY >= height) {
            return null;
        }

        // Get temperature value
        const pixelX = Math.floor(imageX);
        const pixelY = Math.floor(imageY);
        const index = pixelY * width + pixelX;

        return {
            x: pixelX,
            y: pixelY,
            temperature: temperatures[index],
        };
    }, [thermalData, scale, offset]);

    // Mouse event handlers
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isPanning) {
            const dx = e.clientX - lastPanPos.x;
            const dy = e.clientY - lastPanPos.y;
            setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            setLastPanPos({ x: e.clientX, y: e.clientY });
        }

        const tempInfo = getTemperatureAtPosition(e.clientX, e.clientY);
        onHoverTemp?.(tempInfo);
    }, [isPanning, lastPanPos, getTemperatureAtPosition, onHoverTemp]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button === 0) { // Left click
            setIsPanning(true);
            setLastPanPos({ x: e.clientX, y: e.clientY });
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsPanning(false);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsPanning(false);
        onHoverTemp?.(null);
    }, [onHoverTemp]);

    // Zoom with mouse wheel
    const handleWheel = useCallback((e: React.WheelEvent) => {
        // Prevent default only if we are inside the component (which we are)
        // But React synthetic events don't support preventDefault in the same way for passive listeners
        // Usually wheel events on container need to be handled carefully
        // For now we'll just handle the zoom logic

        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate zoom
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.1, Math.min(10, scale * zoomFactor));

        // Adjust offset to zoom towards mouse position
        const scaleChange = newScale / scale;
        const newOffsetX = mouseX - (mouseX - offset.x) * scaleChange;
        const newOffsetY = mouseY - (mouseY - offset.y) * scaleChange;

        setScale(newScale);
        setOffset({ x: newOffsetX, y: newOffsetY });
    }, [scale, offset]);

    // Fit to container on load
    useEffect(() => {
        if (thermalData && containerRef.current) {
            const container = containerRef.current;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            // Only fit if container has dimensions
            if (containerWidth > 0 && containerHeight > 0) {
                const scaleX = containerWidth / thermalData.width;
                const scaleY = containerHeight / thermalData.height;
                const fitScale = Math.min(scaleX, scaleY, 1);

                const centerX = (containerWidth - thermalData.width * fitScale) / 2;
                const centerY = (containerHeight - thermalData.height * fitScale) / 2;

                setScale(fitScale);
                setOffset({ x: centerX, y: centerY });
            }
        }
    }, [thermalData]);

    if (!thermalData) {
        return null; // Or a placeholder if preferred, but usually parent handles placeholder
    }

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative overflow-hidden bg-slate-900 cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
        >
            <canvas
                ref={canvasRef}
                className="block absolute top-0 left-0"
                style={{
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                    transformOrigin: '0 0',
                    imageRendering: 'pixelated', // Keep sharp pixels for thermal data
                }}
            />
            {/* Reset View Button */}
            <button
                className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-md z-10 transition-colors"
                onClick={(e) => {
                    e.stopPropagation();
                    // Re-trigger fit logic
                    if (thermalData && containerRef.current) {
                        const container = containerRef.current;
                        const containerWidth = container.clientWidth;
                        const containerHeight = container.clientHeight;
                        const scaleX = containerWidth / thermalData.width;
                        const scaleY = containerHeight / thermalData.height;
                        const fitScale = Math.min(scaleX, scaleY, 1);
                        const centerX = (containerWidth - thermalData.width * fitScale) / 2;
                        const centerY = (containerHeight - thermalData.height * fitScale) / 2;
                        setScale(fitScale);
                        setOffset({ x: centerX, y: centerY });
                    }
                }}
                title="Reset View"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                </svg>
            </button>
        </div>
    );
}
