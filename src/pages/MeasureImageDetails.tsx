import { useState } from "react";
import { useParams } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { ProfileModal } from "@/components/ProfileModal";
import { useMeasureData } from "@/hooks/useMeasureData";
import {
    MeasuresSidebar,
    ImagesSection,
    InformationSection,
    ActionsSection,
    TopActionBar,
    LocationMapSection
} from "@/components/measure-image";
import { Marker } from "@/components/measure-image/ThermalCanvas";

export default function MeasureImageDetails() {
    const { id } = useParams();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [imagesOpen, setImagesOpen] = useState(true);
    const [informationOpen, setInformationOpen] = useState(true);
    const [locationMapOpen, setLocationMapOpen] = useState(false);
    const [actionsOpen, setActionsOpen] = useState(true);
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [markers, setMarkers] = useState<Marker[]>([]);

    // Use custom hook for data fetching
    const {
        currentMeasure,
        allMeasures,
        measureImages,
        loading,
        loadingMore,
        hasMore,
        listRef,
        handleScroll,
        inspectionId,
        updateCurrentMeasure
    } = useMeasureData(id);

    // Handler for updating a single marker
    const handleUpdateMarker = (markerId: string, updates: Partial<Marker>) => {
        setMarkers(prev => prev.map(m =>
            m.id === markerId ? { ...m, ...updates } : m
        ));
    };

    // Handler for deleting a marker
    const handleDeleteMarker = (markerId: string) => {
        setMarkers(prev => prev.filter(m => m.id !== markerId));
    };

    return (
        <div className="min-h-screen flex w-full bg-background">
            {/* Main Navigation Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onOpenProfile={() => setIsProfileOpen(true)}
            />

            {/* Measures List Sidebar */}
            <MeasuresSidebar
                measures={allMeasures}
                currentMeasureId={id}
                loading={loading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                listRef={listRef}
                onScroll={handleScroll}
            />

            {/* Main Content */}
            <div className="flex-1 lg:ml-[504px] flex flex-col">
                <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 overflow-auto">
                    <div className="p-3 space-y-3">
                        {/* Top Action Bar */}
                        <TopActionBar
                            inspectionId={inspectionId}
                            measure={currentMeasure}
                            measureImages={measureImages}
                        />

                        {/* Images Section */}
                        <ImagesSection
                            isOpen={imagesOpen}
                            onOpenChange={setImagesOpen}
                            measureImages={measureImages}
                            markers={markers}
                            onMarkersChange={setMarkers}
                            maxTemperature={currentMeasure?.temp1_c}
                            minTemperature={currentMeasure?.temp_minima_c}
                        />

                        {/* Information Section */}
                        <InformationSection
                            isOpen={informationOpen}
                            onOpenChange={setInformationOpen}
                            measure={currentMeasure}
                            onMeasureUpdated={updateCurrentMeasure}
                        />

                        {/* Actions Section */}
                        <ActionsSection
                            isOpen={actionsOpen}
                            onOpenChange={setActionsOpen}
                            markers={markers}
                            onUpdateMarker={handleUpdateMarker}
                            onDeleteMarker={handleDeleteMarker}
                            measureId={id}
                            onLoadMarkers={setMarkers}
                        />

                        {/* Location Map Section */}
                        <LocationMapSection
                            isOpen={locationMapOpen}
                            onOpenChange={setLocationMapOpen}
                            measure={currentMeasure}
                        />
                    </div>
                </main>
            </div>

            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </div>
    );
}
