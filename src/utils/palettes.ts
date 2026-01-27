/**
 * Thermal color palettes for FLIR-like visualization.
 * Each palette maps a normalized value (0-1) to RGB colors.
 */

export interface PaletteStop {
    pos: number;
    color: [number, number, number];
}

export type PaletteName = 'iron' | 'rainbow' | 'whiteHot' | 'blackHot' | 'arctic' | 'outdoor';

export interface PaletteDefinition {
    id: PaletteName;
    name: string;
    description: string;
}

// Palette color stops - each defines gradient points from cold to hot
const PALETTE_DEFINITIONS: Record<PaletteName, PaletteStop[]> = {
    iron: [
        { pos: 0.0, color: [0, 0, 0] },        // Black
        { pos: 0.2, color: [32, 0, 128] },     // Dark Blue/Purple
        { pos: 0.4, color: [128, 0, 128] },    // Purple
        { pos: 0.6, color: [200, 0, 0] },      // Red
        { pos: 0.8, color: [255, 128, 0] },    // Orange
        { pos: 0.9, color: [255, 255, 0] },    // Yellow
        { pos: 1.0, color: [255, 255, 255] },  // White
    ],
    rainbow: [
        { pos: 0.0, color: [0, 0, 128] },      // Dark Blue
        { pos: 0.2, color: [0, 0, 255] },      // Blue
        { pos: 0.35, color: [0, 255, 255] },   // Cyan
        { pos: 0.5, color: [0, 255, 0] },      // Green
        { pos: 0.65, color: [255, 255, 0] },   // Yellow
        { pos: 0.8, color: [255, 128, 0] },    // Orange
        { pos: 1.0, color: [255, 0, 0] },      // Red
    ],
    whiteHot: [
        { pos: 0.0, color: [0, 0, 0] },        // Black
        { pos: 1.0, color: [255, 255, 255] },  // White
    ],
    blackHot: [
        { pos: 0.0, color: [255, 255, 255] },  // White
        { pos: 1.0, color: [0, 0, 0] },        // Black
    ],
    arctic: [
        { pos: 0.0, color: [0, 0, 64] },       // Dark Blue
        { pos: 0.25, color: [0, 64, 128] },    // Navy
        { pos: 0.5, color: [0, 128, 192] },    // Blue
        { pos: 0.75, color: [128, 200, 255] }, // Light Blue
        { pos: 1.0, color: [255, 255, 255] },  // White
    ],
    outdoor: [
        { pos: 0.0, color: [0, 64, 0] },       // Dark Green
        { pos: 0.25, color: [0, 128, 0] },     // Green
        { pos: 0.5, color: [192, 192, 0] },    // Yellow-Green
        { pos: 0.75, color: [255, 128, 0] },   // Orange
        { pos: 1.0, color: [255, 0, 0] },      // Red
    ],
};

/**
 * Interpolate between two colors based on position.
 */
function interpolateColor(color1: [number, number, number], color2: [number, number, number], t: number): [number, number, number] {
    return [
        Math.round(color1[0] + (color2[0] - color1[0]) * t),
        Math.round(color1[1] + (color2[1] - color1[1]) * t),
        Math.round(color1[2] + (color2[2] - color1[2]) * t),
    ];
}

/**
 * Get RGB color for a normalized value (0-1) using the specified palette.
 */
export function getColorForValue(normalizedValue: number, paletteName: PaletteName): [number, number, number] {
    const stops = PALETTE_DEFINITIONS[paletteName] || PALETTE_DEFINITIONS.iron;

    // Clamp value to 0-1 range
    const value = Math.max(0, Math.min(1, normalizedValue));

    // Find the two stops to interpolate between
    for (let i = 0; i < stops.length - 1; i++) {
        if (value >= stops[i].pos && value <= stops[i + 1].pos) {
            const range = stops[i + 1].pos - stops[i].pos;
            const t = range === 0 ? 0 : (value - stops[i].pos) / range;
            return interpolateColor(stops[i].color, stops[i + 1].color, t);
        }
    }

    // Return last color if value is at maximum
    return stops[stops.length - 1].color;
}

/**
 * Available palette names with display labels.
 */
export const PALETTES: PaletteDefinition[] = [
    { id: 'iron', name: 'Iron', description: 'Classic thermal palette' },
    { id: 'rainbow', name: 'Rainbow', description: 'Full spectrum colors' },
    { id: 'whiteHot', name: 'White Hot', description: 'Grayscale, hot is white' },
    { id: 'blackHot', name: 'Black Hot', description: 'Grayscale, hot is black' },
    { id: 'arctic', name: 'Arctic', description: 'Blue to white tones' },
    { id: 'outdoor', name: 'Outdoor', description: 'Green to red vegetation style' },
];

export default PALETTE_DEFINITIONS;
