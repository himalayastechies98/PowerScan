import { useState, useRef, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Image as ImageIcon } from "lucide-react";

interface ImagePanelProps {
    imageSrc: string | null;
    altText: string;
    placeholderText: string;
    variant?: "thermal" | "optical";
}

export function ImagePanel({ imageSrc, altText, placeholderText, variant = "optical" }: ImagePanelProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    const isThermal = variant === "thermal";

    // Fit image to container - calculate scale to fit while maintaining aspect ratio
    const centerImage = useCallback(() => {
        if (!containerRef.current || imageNaturalSize.width === 0) return;

        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        if (containerWidth === 0 || containerHeight === 0) return;

        // Calculate scale to fit image within container (with padding)
        const padding = 40; // pixels padding on each side
        const availableWidth = containerWidth - padding * 2;
        const availableHeight = containerHeight - padding * 2;

        const scaleX = availableWidth / imageNaturalSize.width;
        const scaleY = availableHeight / imageNaturalSize.height;

        // Use the smaller scale to ensure image fits in both dimensions
        const fitScale = Math.min(scaleX, scaleY, 1); // Cap at 100%

        const scaledWidth = imageNaturalSize.width * fitScale;
        const scaledHeight = imageNaturalSize.height * fitScale;

        // Center both horizontally and vertically
        const centerX = (containerWidth - scaledWidth) / 2;
        const centerY = (containerHeight - scaledHeight) / 2;

        setScale(fitScale);
        setOffset({ x: centerX, y: centerY });
    }, [imageNaturalSize]);

    // Handle image load
    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        setIsImageLoaded(true);
    };

    // Center when image loads or container resizes
    useEffect(() => {
        if (isImageLoaded && imageNaturalSize.width > 0) {
            // Small delay to ensure container is properly sized
            const timer = setTimeout(() => {
                centerImage();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isImageLoaded, imageNaturalSize, centerImage]);

    // Reset when image source changes
    useEffect(() => {
        setIsImageLoaded(false);
        setImageNaturalSize({ width: 0, height: 0 });
        setScale(1);
        setOffset({ x: 0, y: 0 });
    }, [imageSrc]);

    // Button-based zoom
    const handleZoomIn = useCallback(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const centerX = container.clientWidth / 2;
        const centerY = container.clientHeight / 2;

        const newScale = Math.min(scale * 1.25, 5);
        const scaleChange = newScale / scale;
        const newOffsetX = centerX - (centerX - offset.x) * scaleChange;
        const newOffsetY = centerY - (centerY - offset.y) * scaleChange;

        setScale(newScale);
        setOffset({ x: newOffsetX, y: newOffsetY });
    }, [scale, offset]);

    const handleZoomOut = useCallback(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const centerX = container.clientWidth / 2;
        const centerY = container.clientHeight / 2;

        const newScale = Math.max(scale * 0.8, 0.25);
        const scaleChange = newScale / scale;
        const newOffsetX = centerX - (centerX - offset.x) * scaleChange;
        const newOffsetY = centerY - (centerY - offset.y) * scaleChange;

        setScale(newScale);
        setOffset({ x: newOffsetX, y: newOffsetY });
    }, [scale, offset]);

    return (
        <div
            ref={containerRef}
            className="h-full w-full relative overflow-hidden bg-muted"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {imageSrc ? (
                <>
                    {/* Image with transform-based positioning (same as ThermalCanvas) */}
                    <img
                        src={imageSrc}
                        alt={altText}
                        onLoad={handleImageLoad}
                        draggable={false}
                        className="absolute top-0 left-0 max-w-none pointer-events-none"
                        style={{
                            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                            transformOrigin: '0 0',
                            visibility: isImageLoaded ? 'visible' : 'hidden',
                        }}
                    />

                    {/* Zoom Controls */}
                    <div
                        className={`absolute bottom-4 right-4 flex items-center gap-1 p-1 rounded-lg bg-background/90 backdrop-blur-md border shadow-sm transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-50'}`}
                    >
                        <button
                            onClick={handleZoomOut}
                            className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleZoomIn}
                            className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        <div className="w-px h-5 bg-border" />
                        <button
                            onClick={centerImage}
                            className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Zoom indicator */}
                    {isImageLoaded && (
                        <div className="absolute bottom-4 left-4 px-2 py-1 rounded text-xs font-mono bg-background/90 border shadow-sm">
                            {Math.round(scale * 100)}%
                        </div>
                    )}
                </>
            ) : (
                /* Placeholder */
                <div className={`h-full w-full flex flex-col items-center justify-center gap-3 ${isThermal ? "text-slate-600" : "text-slate-400"}`}>
                    <div className={`p-4 rounded-xl ${isThermal ? "bg-slate-800/50 border border-slate-700/50" : "bg-white border border-slate-200 shadow-sm"}`}>
                        <ImageIcon className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm">{placeholderText}</p>
                </div>
            )}
        </div>
    );
}
