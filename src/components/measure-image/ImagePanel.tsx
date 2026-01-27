import { Move, Maximize2 } from "lucide-react";

interface ImagePanelProps {
    imageSrc: string | null;
    altText: string;
    placeholderText: string;
    showThermalPlaceholder?: boolean;
}

export function ImagePanel({ imageSrc, altText, placeholderText, showThermalPlaceholder = false }: ImagePanelProps) {
    return (
        <div className="bg-slate-200 p-4 min-h-[350px] flex items-start gap-3">
            {/* Left Controls - Zoom */}
            <div className="flex flex-col gap-1 shrink-0">
                <button className="h-9 w-9 flex items-center justify-center bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-gray-700">
                    <span className="text-base font-bold">+</span>
                </button>
                <button className="h-9 w-9 flex items-center justify-center bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-gray-700">
                    <span className="text-base font-bold">−</span>
                </button>
            </div>

            {/* Image Container */}
            <div className="flex-1 flex items-center justify-center">
                <div className="relative w-full max-w-sm shadow-lg rounded overflow-hidden">
                    {imageSrc ? (
                        <img
                            src={imageSrc}
                            alt={altText}
                            className="w-full aspect-[4/3] object-cover"
                        />
                    ) : showThermalPlaceholder ? (
                        <div className="aspect-[4/3] bg-slate-300 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-12 h-12 border-2 border-gray-400 rounded-full mx-auto mb-2 flex items-center justify-center relative">
                                    <div className="w-0.5 h-8 bg-gray-400 absolute"></div>
                                    <div className="w-8 h-0.5 bg-gray-400 absolute"></div>
                                </div>
                                <span className="text-gray-500 text-sm">{placeholderText}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="aspect-[4/3] bg-gradient-to-b from-gray-600 to-gray-800 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">{placeholderText}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Controls */}
            <div className="flex flex-col gap-3 shrink-0">
                <div className="flex flex-col gap-1">
                    <button className="h-9 w-9 flex items-center justify-center bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-gray-700">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                    </button>
                    <button className="h-9 w-9 flex items-center justify-center bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-gray-700">
                        <Maximize2 className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex flex-col gap-1">
                    <button className="h-9 w-9 flex items-center justify-center bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-gray-700">
                        <Move className="w-4 h-4" />
                    </button>
                    <button className="h-9 w-9 flex items-center justify-center bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-gray-700">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
                            <path d="M22 21H7" />
                            <path d="m5 11 9 9" />
                        </svg>
                    </button>
                </div>
                {showThermalPlaceholder && (
                    <div className="flex flex-col gap-1">
                        <button className="h-9 w-9 flex items-center justify-center bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-gray-700">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                                <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                                <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                                <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
