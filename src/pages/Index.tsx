import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FilterSection } from "@/components/dashboard/FilterSection";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { DataTable } from "@/components/dashboard/DataTable";
import { MapSection } from "@/components/dashboard/MapSection";
import { ManageClients } from "@/components/ManageClients";
import { ManageInspections } from "@/components/ManageInspections";
import { ProfileModal } from "@/components/ProfileModal";

const Index = () => {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isClient, isAdmin } = useAuth();

  const renderContent = () => {
    if (isAdmin) {
      switch (currentView) {
        case "clients":
          return <ManageClients />;
        case "dashboard":
        default:
          return (
            <>
              <FilterSection />
              <StatsCards />
              <ChartsSection />
              <DataTable />
              <MapSection />
            </>
          );
      }
    }

    if (isClient) {
      switch (currentView) {
        case "inspections":
          return <ManageInspections />;
        case "dashboard":
        default:
          return (
            <div className="mt-8 text-center">
              <p className="text-lg text-muted-foreground">
                {t('welcomeMessage')}
              </p>
            </div>
          );
      }
    }

    return null;
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={setCurrentView}
        onOpenProfile={() => setIsProfileOpen(true)}
        currentView={currentView}
      />

      <main className="flex-1 lg:ml-60 transition-all duration-300">
        <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <DashboardHeader />
          {renderContent()}

          <footer className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div>{t('copyright')}</div>
            <div>{t('version')}</div>
          </footer>
        </div>
      </main>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};

export default Index;
