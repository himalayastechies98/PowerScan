import { ChartBar as BarChart3, Chrome as Home, FileText, Map, Settings, Users, X, Upload, CircleUser as UserCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onOpenProfile: () => void;
  currentView: string;
}

export function Sidebar({ isOpen, onClose, onNavigate, onOpenProfile, currentView }: SidebarProps) {
  const { profile, signOut, isAdmin, isClient } = useAuth();
  const { t } = useTranslation();

  const getMenuSections = () => {
    if (isAdmin) {
      return [
        {
          title: t('main'),
          items: [
            { icon: Home, label: t('dashboard'), view: "dashboard" },
            { icon: Users, label: t('clients'), view: "clients" },
          ],
        },
      ];
    }

    if (isClient) {
      return [
        {
          title: t('main'),
          items: [
            { icon: Home, label: t('dashboard'), view: "dashboard" },
            { icon: Upload, label: t('inspections'), view: "inspections" },
          ],
        },
      ];
    }

    return [];
  };

  const menuSections = getMenuSections();

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 lg:hidden transition-opacity z-40 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-60 bg-sidebar border-r border-sidebar-border
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:z-30
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Close Button (Mobile) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-3 right-3 lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <span className="text-xl font-bold text-sidebar-primary-foreground">P</span>
            </div>
            <span className="text-xl font-semibold text-sidebar-foreground">PowerScan</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-6">
          {menuSections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.view;
                  return (
                    <Button
                      key={itemIdx}
                      variant={isActive ? "default" : "ghost"}
                      onClick={() => {
                        onNavigate(item.view);
                        onClose();
                      }}
                      className={`
                        w-full justify-start gap-3
                        ${isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border bg-sidebar">
          <div className="space-y-3">
            <button
              onClick={() => {
                onOpenProfile();
                onClose();
              }}
              className="w-full text-left space-y-1 hover:bg-sidebar-accent rounded-lg p-2 transition-colors"
            >
              <p className="text-sm font-medium text-sidebar-foreground">
                {profile?.full_name || profile?.email}
              </p>
              <p className="text-xs text-sidebar-foreground/60">{profile?.email}</p>
              <p className="text-xs text-sidebar-accent-foreground bg-sidebar-accent px-2 py-1 rounded w-fit">
                {t(profile?.role || 'client')}
              </p>
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="w-4 h-4" />
              {t('logout')}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
