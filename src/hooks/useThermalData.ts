import { useState, useCallback } from 'react';
import { ThermalData } from '@/components/measure-image/ThermalCanvas';

// Use environment variable, fallback to local for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const THERMAL_API_URL = `${API_BASE_URL}/api/thermal`;

export function useThermalData() {
    const [thermalData, setThermalData] = useState<ThermalData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchThermalData = useCallback(async (imageUrl: string, maxTemp?: number) => {
        if (!imageUrl) return;

        setLoading(true);
        setError(null);
        setThermalData(null);

        try {
            // 1. Fetch the image as a blob
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) {
                throw new Error('Failed to fetch image from storage');
            }
            const blob = await imageResponse.blob();

            // 2. Create FormData to send to Thermal API
            const formData = new FormData();
            // We need to give it a .jpg extension for the API validation
            const file = new File([blob], "thermal.jpg", { type: "image/jpeg" });
            formData.append('file', file);

            // 3. Build API URL with optional max_temp query param
            let apiUrl = THERMAL_API_URL;
            if (maxTemp !== undefined && maxTemp !== null) {
                apiUrl += `?max_temp=${maxTemp}`;
            }

            // 4. Send to Thermal API
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to process thermal image');
            }

            const data = await response.json();
            setThermalData(data);
        } catch (err) {
            console.error('Error fetching thermal data:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        thermalData,
        loading,
        error,
        fetchThermalData
    };
}
