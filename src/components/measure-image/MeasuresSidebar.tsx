import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Filter, ArrowUpDown, Grid, ThermometerSun, Triangle, Loader2 } from "lucide-react";
import { excelDateToJS, excelTimeToJS } from "@/utils/dateUtils";
import { Measure } from "@/hooks/useMeasureData";

interface MeasuresSidebarProps {
    measures: Measure[];
    currentMeasureId: string | undefined;
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    viewMode: "list" | "grid";
    onViewModeChange: (mode: "list" | "grid") => void;
    listRef: React.RefObject<HTMLDivElement>;
    onScroll: () => void;
}

export function MeasuresSidebar({
    measures,
    currentMeasureId,
    loading,
    loadingMore,
    hasMore,
    viewMode,
    onViewModeChange,
    listRef,
    onScroll
}: MeasuresSidebarProps) {
    const navigate = useNavigate();

    return (
        <div className="hidden lg:flex lg:flex-col w-72 border-r bg-card lg:ml-60 fixed left-0 top-0 bottom-0 pt-16">
            {/* Toolbar */}
            <div className="p-3 border-b space-y-2 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                        <Filter className="w-3.5 h-3.5 mr-1.5" />
                        Filter
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                        <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" />
                        Sort
                    </Button>
                    <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="sm"
                        className="px-2.5"
                        onClick={() => onViewModeChange(viewMode === "list" ? "grid" : "list")}
                    >
                        <Grid className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            {/* Measures List - Scrollable */}
            <div ref={listRef} onScroll={onScroll} className="flex-1 overflow-y-auto">
                {viewMode === "list" ? (
                    <ListView
                        measures={measures}
                        currentMeasureId={currentMeasureId}
                        loading={loading}
                        loadingMore={loadingMore}
                        hasMore={hasMore}
                        onNavigate={(id) => navigate(`/measure-image/${id}`)}
                    />
                ) : (
                    <GridView
                        measures={measures}
                        currentMeasureId={currentMeasureId}
                        loadingMore={loadingMore}
                        hasMore={hasMore}
                        onNavigate={(id) => navigate(`/measure-image/${id}`)}
                    />
                )}
            </div>
        </div>
    );
}

interface ListViewProps {
    measures: Measure[];
    currentMeasureId: string | undefined;
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    onNavigate: (id: string) => void;
}

function ListView({ measures, currentMeasureId, loading, loadingMore, hasMore, onNavigate }: ListViewProps) {
    return (
        <div className="divide-y">
            {measures.length === 0 && loading ? (
                <div className="p-3 text-sm text-muted-foreground text-center">
                    Loading...
                </div>
            ) : measures.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground text-center">
                    No measures found
                </div>
            ) : (
                measures.map((measure) => (
                    <div
                        key={measure.id_unico}
                        className={`p-3 cursor-pointer transition-colors ${measure.id_unico === currentMeasureId
                            ? "bg-primary/10 border-l-4 border-primary"
                            : "hover:bg-muted/50"
                            }`}
                        onClick={() => onNavigate(measure.id_unico)}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="text-sm font-bold text-primary">
                                    {String(measure.registro_num).padStart(3, '0')}
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {excelTimeToJS(measure.data_criacao)}
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                            {excelDateToJS(measure.data_criacao)}
                        </div>
                        <div className="flex items-center gap-2">
                            <ThermometerSun className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium">
                                Max: {measure.temp1_c ? `${measure.temp1_c.toFixed(2)}°C` : '-'}
                            </span>
                            {measure.temp1_c && measure.temp1_c > 40 && (
                                <Triangle className="w-3 h-3 text-red-500 fill-red-500" />
                            )}
                            {measure.temp1_c && measure.temp1_c > 35 && measure.temp1_c <= 40 && (
                                <Triangle className="w-3 h-3 text-orange-500 fill-orange-500" />
                            )}
                        </div>
                    </div>
                ))
            )}
            {loadingMore && (
                <div className="p-4 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading more...</span>
                </div>
            )}
            {!hasMore && measures.length > 0 && (
                <div className="p-3 text-xs text-muted-foreground text-center border-t">
                    All measures loaded
                </div>
            )}
        </div>
    );
}

interface GridViewProps {
    measures: Measure[];
    currentMeasureId: string | undefined;
    loadingMore: boolean;
    hasMore: boolean;
    onNavigate: (id: string) => void;
}

function GridView({ measures, currentMeasureId, loadingMore, hasMore, onNavigate }: GridViewProps) {
    return (
        <div className="p-3 grid grid-cols-2 gap-3">
            {measures.map((measure) => (
                <div
                    key={measure.id_unico}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${measure.id_unico === currentMeasureId
                        ? "bg-primary/10 border-primary"
                        : "bg-card border-border hover:border-primary/50"
                        }`}
                    onClick={() => onNavigate(measure.id_unico)}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-bold text-primary">
                            {String(measure.registro_num).padStart(3, '0')}
                        </div>
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-xs">👤</span>
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground mb-0.5">
                        {excelDateToJS(measure.data_criacao)}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                        {excelTimeToJS(measure.data_criacao)}
                    </div>
                    <div className="bg-muted/50 rounded px-2 py-1 mb-2">
                        <div className="text-xs font-semibold">
                            Max: {measure.temp1_c ? `${measure.temp1_c.toFixed(2)}°C` : '-'}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-xs">🌲</span>
                        {measure.temp1_c && measure.temp1_c > 35 && (
                            <Triangle className={`w-3 h-3 ${measure.temp1_c > 40
                                ? "text-red-500 fill-red-500"
                                : "text-orange-500 fill-orange-500"
                                }`} />
                        )}
                    </div>
                </div>
            ))}
            {loadingMore && (
                <div className="col-span-2 p-4 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading more...</span>
                </div>
            )}
            {!hasMore && measures.length > 0 && (
                <div className="col-span-2 p-3 text-xs text-muted-foreground text-center">
                    All measures loaded
                </div>
            )}
        </div>
    );
}
