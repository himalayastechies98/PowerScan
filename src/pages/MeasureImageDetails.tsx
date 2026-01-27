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
    TopActionBar
} from "@/components/measure-image";

export default function MeasureImageDetails() {
    const { id } = useParams();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [imagesOpen, setImagesOpen] = useState(true);
    const [informationOpen, setInformationOpen] = useState(true);
    const [actionsOpen, setActionsOpen] = useState(true);
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

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
        inspectionId
    } = useMeasureData(id);

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
                    <div className="p-4 space-y-3">
                        {/* Top Action Bar */}
                        <TopActionBar inspectionId={inspectionId} />

                        {/* Images Section */}
                        <ImagesSection
                            isOpen={imagesOpen}
                            onOpenChange={setImagesOpen}
                            measureImages={measureImages}
                        />

                        {/* Information Section */}
                        <InformationSection
                            isOpen={informationOpen}
                            onOpenChange={setInformationOpen}
                            measure={currentMeasure}
                        />

                        {/* Actions Section */}
                        <ActionsSection
                            isOpen={actionsOpen}
                            onOpenChange={setActionsOpen}
                        />
                    </div>
                </main>
            </div>

            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </div>
    );
}
