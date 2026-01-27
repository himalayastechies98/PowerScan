import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const PAGE_SIZE = 20;

export interface Measure {
    id_unico: string;
    inspection_id: string;
    registro_num: number;
    data_criacao: number;
    temp1_c: number | null;
    localizacao: string | null;
    [key: string]: any;
}

export interface MeasureImage {
    url: string;
    type: 'thermal' | 'optical';
    fileName: string;
}

export interface UseMeasureDataReturn {
    currentMeasure: Measure | null;
    allMeasures: Measure[];
    measureImages: MeasureImage[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    listRef: React.RefObject<HTMLDivElement>;
    handleScroll: () => void;
    inspectionId: string | null;
}

export function useMeasureData(measureId: string | undefined): UseMeasureDataReturn {
    const [currentMeasure, setCurrentMeasure] = useState<Measure | null>(null);
    const [allMeasures, setAllMeasures] = useState<Measure[]>([]);
    const [measureImages, setMeasureImages] = useState<MeasureImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [inspectionId, setInspectionId] = useState<string | null>(null);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (measureId) {
            fetchMeasureData();
        }
    }, [measureId]);

    const fetchMeasureImages = async (inspId: string, registroNum: number, storedImages: any[] = []) => {
        try {
            const folderPath = `inspection_${inspId}/registro_${registroNum}`;
            console.log('Fetching images from folder:', folderPath);

            // Strategy 1: Use metadata from DB if available (Preferred: has 'type' info)
            if (storedImages && storedImages.length > 0) {
                const images: MeasureImage[] = storedImages.map((img: any) => {
                    const { data } = supabase.storage
                        .from('inspection-measure-images')
                        .getPublicUrl(`${folderPath}/${img.value}`);

                    return {
                        url: data.publicUrl,
                        type: img.type || 'optical', // Default to optical if missing
                        fileName: img.value
                    };
                });
                console.log('Images from DB metadata:', images);
                setMeasureImages(images);
                return;
            }

            // Strategy 2: Fallback to listing storage (Legacy support / Missing metadata)
            const { data: files, error } = await supabase.storage
                .from('inspection-measure-images')
                .list(folderPath);

            if (error) {
                console.error('Error fetching images:', error);
                return;
            }

            console.log('Files found in storage:', files);

            if (files && files.length > 0) {
                const images: MeasureImage[] = files
                    .filter(file => !file.name.startsWith('.'))
                    .map((file, index) => {
                        const { data } = supabase.storage
                            .from('inspection-measure-images')
                            .getPublicUrl(`${folderPath}/${file.name}`);

                        // Heuristic: If we have to guess, maybe name contains "IR" or it's the 2nd image?
                        // For now, default to optical unless we know better. 
                        // Or we could replicate the old logic: index 1 is thermal if 2 images exist.
                        let type: 'thermal' | 'optical' = 'optical';
                        if (files.length > 1 && index === 1) type = 'thermal';

                        return {
                            url: data.publicUrl,
                            type,
                            fileName: file.name
                        };
                    });

                console.log('Images from Storage list:', images);
                setMeasureImages(images);
            }
        } catch (err) {
            console.error('Error fetching images:', err);
        }
    };

    const fetchMeasureData = async () => {
        try {
            setLoading(true);

            // Clear previous images when measure changes
            setMeasureImages([]);

            const { data: measure, error: measureError } = await supabase
                .from('inspection_measure')
                .select('*')
                .eq('id_unico', measureId)
                .single();

            if (measureError) {
                console.error('Error fetching measure:', measureError);
                toast.error('Failed to load measure details');
                return;
            }

            setCurrentMeasure(measure);
            console.log('Selected Measure Details:', measure);

            if (measure?.inspection_id && measure?.registro_num) {
                await fetchMeasureImages(measure.inspection_id, measure.registro_num, measure.images);
            }

            // Only refetch measures list if inspection ID changed
            if (measure?.inspection_id && measure.inspection_id !== inspectionId) {
                setInspectionId(measure.inspection_id);
                setPage(0);
                setHasMore(true);
                await fetchMeasuresPage(measure.inspection_id, 0, true);
            }
        } catch (err) {
            console.error('Error:', err);
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const fetchMeasuresPage = async (inspId: string, pageNum: number, isInitial: boolean = false) => {
        try {
            if (isInitial) {
                setLoadingMore(false);
            } else {
                setLoadingMore(true);
            }

            const from = pageNum * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            const { data: measures, error: measuresError, count } = await supabase
                .from('inspection_measure')
                .select('*', { count: 'exact' })
                .eq('inspection_id', inspId)
                .order('registro_num', { ascending: true })
                .range(from, to);

            if (measuresError) {
                console.error('Error fetching measures:', measuresError);
                return;
            }

            if (isInitial) {
                setAllMeasures(measures || []);
            } else {
                setAllMeasures(prev => [...prev, ...(measures || [])]);
            }

            const totalFetched = (pageNum + 1) * PAGE_SIZE;
            setHasMore(count ? totalFetched < count : false);
            setPage(pageNum);

        } catch (err) {
            console.error('Error fetching measures page:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleScroll = useCallback(() => {
        if (!listRef.current || loadingMore || !hasMore || !inspectionId) return;

        const { scrollTop, scrollHeight, clientHeight } = listRef.current;

        if (scrollTop + clientHeight >= scrollHeight - 100) {
            fetchMeasuresPage(inspectionId, page + 1);
        }
    }, [loadingMore, hasMore, inspectionId, page]);

    return {
        currentMeasure,
        allMeasures,
        measureImages,
        loading,
        loadingMore,
        hasMore,
        listRef,
        handleScroll,
        inspectionId
    };
}
