import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
    totalInspections: number;
    totalMeasures: number;
    hotspotsDetected: number;
    activeFeeders: number;
    loading: boolean;
    error: string | null;
}

interface MeasureBySeverity {
    name: string;
    value: number;
    color: string;
}

interface InspectionByMonth {
    month: string;
    count: number;
}

interface RecentMeasure {
    id: string;
    location: string;
    temperature: number | null;
    severity: string;
    date: string;
    feeder: string | null;
    latitude: number | null;
    longitude: number | null;
}

interface DashboardData {
    stats: DashboardStats;
    measuresBySeverity: MeasureBySeverity[];
    inspectionsByMonth: InspectionByMonth[];
    recentMeasures: RecentMeasure[];
    mapLocations: Array<{
        lat: number;
        lng: number;
        name: string;
        status: string;
        temp: string;
        id: string;
    }>;
}

export function useDashboardData(): DashboardData {
    const [stats, setStats] = useState<DashboardStats>({
        totalInspections: 0,
        totalMeasures: 0,
        hotspotsDetected: 0,
        activeFeeders: 0,
        loading: true,
        error: null,
    });

    const [measuresBySeverity, setMeasuresBySeverity] = useState<MeasureBySeverity[]>([]);
    const [inspectionsByMonth, setInspectionsByMonth] = useState<InspectionByMonth[]>([]);
    const [recentMeasures, setRecentMeasures] = useState<RecentMeasure[]>([]);
    const [mapLocations, setMapLocations] = useState<DashboardData['mapLocations']>([]);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                // Use type assertion for tables not in auto-generated types
                const supabaseAny = supabase as any;

                // Fetch total inspections
                const { count: inspectionsCount } = await supabase
                    .from('inspections')
                    .select('*', { count: 'exact', head: true });

                // Fetch total measures
                const { count: measuresCount } = await supabaseAny
                    .from('inspection_measure')
                    .select('*', { count: 'exact', head: true });

                // Fetch hotspots (measures with high temperature > 60°C)
                const { count: hotspotsCount } = await supabaseAny
                    .from('inspection_measure')
                    .select('*', { count: 'exact', head: true })
                    .gte('temp1_c', 60);

                // Fetch unique feeders
                const { data: feedersData } = await supabaseAny
                    .from('inspection_measure')
                    .select('alimentador')
                    .not('alimentador', 'is', null);

                const uniqueFeeders = new Set(feedersData?.map((f: any) => f.alimentador).filter(Boolean));

                setStats({
                    totalInspections: inspectionsCount || 0,
                    totalMeasures: measuresCount || 0,
                    hotspotsDetected: hotspotsCount || 0,
                    activeFeeders: uniqueFeeders.size,
                    loading: false,
                    error: null,
                });

                // Fetch measures by severity for pie chart
                const { data: severityData } = await supabaseAny
                    .from('inspection_measure')
                    .select('severidade');

                if (severityData) {
                    const severityCounts: Record<string, number> = {};
                    severityData.forEach((m: any) => {
                        const sev = m.severidade || 'Not Defined';
                        severityCounts[sev] = (severityCounts[sev] || 0) + 1;
                    });

                    const severityColors: Record<string, string> = {
                        'Ação Imediata': '#e53935',
                        'Ação Programada': '#ffa000',
                        'Sem Ação': '#43a047',
                        'Not Defined': '#9e9e9e',
                    };

                    setMeasuresBySeverity(
                        Object.entries(severityCounts).map(([name, value]) => ({
                            name,
                            value,
                            color: severityColors[name] || '#7c3aed',
                        }))
                    );
                }

                // Fetch inspections by month for bar chart
                const { data: inspectionsData } = await supabase
                    .from('inspections')
                    .select('created_at')
                    .order('created_at', { ascending: true });

                if (inspectionsData) {
                    const monthCounts: Record<string, number> = {};
                    inspectionsData.forEach(insp => {
                        if (insp.created_at) {
                            const date = new Date(insp.created_at);
                            const monthKey = date.toLocaleDateString('en', { month: 'short', year: '2-digit' });
                            monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
                        }
                    });

                    setInspectionsByMonth(
                        Object.entries(monthCounts).slice(-6).map(([month, count]) => ({
                            month,
                            count,
                        }))
                    );
                }

                // Fetch recent measures
                const { data: recentData } = await supabaseAny
                    .from('inspection_measure')
                    .select('id_unico, localizacao, temp1_c, severidade, data_criacao, alimentador, latitude, longitude')
                    .order('data_criacao', { ascending: false })
                    .limit(5);

                if (recentData) {
                    setRecentMeasures(
                        recentData.map((m: any) => ({
                            id: m.id_unico,
                            location: m.localizacao || 'Unknown Location',
                            temperature: m.temp1_c,
                            severity: m.severidade || 'Not Defined',
                            date: m.data_criacao ? new Date((m.data_criacao - 25569) * 86400 * 1000).toLocaleDateString() : '-',
                            feeder: m.alimentador,
                            latitude: m.latitude,
                            longitude: m.longitude,
                        }))
                    );
                }

                // Fetch map locations (measures with coordinates)
                const { data: mapData } = await supabaseAny
                    .from('inspection_measure')
                    .select('id_unico, localizacao, temp1_c, severidade, latitude, longitude')
                    .not('latitude', 'is', null)
                    .not('longitude', 'is', null)
                    .limit(50);

                if (mapData) {
                    setMapLocations(
                        mapData.map((m: any) => ({
                            lat: m.latitude!,
                            lng: m.longitude!,
                            name: m.localizacao || 'Measure Point',
                            status: getSeverityStatus(m.severidade),
                            temp: m.temp1_c ? `${m.temp1_c.toFixed(1)}°C` : '-',
                            id: m.id_unico.substring(0, 8),
                        }))
                    );
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setStats(prev => ({ ...prev, loading: false, error: 'Failed to load dashboard data' }));
            }
        }

        fetchDashboardData();
    }, []);

    return {
        stats,
        measuresBySeverity,
        inspectionsByMonth,
        recentMeasures,
        mapLocations,
    };
}

function getSeverityStatus(severidade: string | null): string {
    switch (severidade) {
        case 'Ação Imediata':
            return 'critical';
        case 'Ação Programada':
            return 'warning';
        case 'Sem Ação':
            return 'normal';
        default:
            return 'normal';
    }
}
