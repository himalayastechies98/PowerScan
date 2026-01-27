import { ChartBar as BarChart3, Chrome as Home, FileText, Map, Settings, Users, X, Upload, CircleUser as UserCircle, LogOut, ChevronDown, ChevronRight, Zap, Radio, Box, Lightbulb, Car, Activity, Wrench, Plug, Wifi, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
}

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  subItems?: { label: string; path: string; icon?: any }[];
}

export function Sidebar({ isOpen, onClose, onOpenProfile }: SidebarProps) {
  const { profile, signOut, isAdmin, isClient } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);

  // Auto-expand parent menu based on current route
  useEffect(() => {
    const menuSections = getMenuSections();
    menuSections.forEach(section => {
      section.items.forEach(item => {
        if (item.subItems) {
          const isOnSubRoute = item.subItems.some(sub => location.pathname === sub.path);
          if (isOnSubRoute && !expandedMenus.includes(item.path)) {
            setExpandedMenus(prev => [...prev, item.path]);
          }
        }
      });
    });
  }, [location.pathname]);

  // Restore and save scroll position
  useEffect(() => {
    if (!scrollRef) return;

    const viewport = scrollRef.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (!viewport) return;

    // Restore scroll position
    const savedScroll = sessionStorage.getItem('sidebarScroll');
    if (savedScroll) {
      // Small timeout to allow layout to settle
      setTimeout(() => {
        viewport.scrollTop = parseInt(savedScroll, 10);
      }, 0);
    }

    const handleScroll = () => {
      sessionStorage.setItem('sidebarScroll', viewport.scrollTop.toString());
    };

    viewport.addEventListener('scroll', handleScroll);

    return () => {
      viewport.removeEventListener('scroll', handleScroll);
    };
  }, [scrollRef]);

  const toggleMenu = (path: string) => {
    setExpandedMenus(prev =>
      prev.includes(path)
        ? prev.filter(v => v !== path)
        : [...prev, path]
    );
  };

  const getMenuSections = () => {
    if (isAdmin) {
      return [
        {
          title: t('main'),
          items: [
            { icon: Home, label: t('dashboard'), path: "/" },
            {
              icon: Upload,
              label: t('inspections'),
              path: "inspections",
              subItems: [
                { label: t('distribution'), path: "/distribution", icon: Zap }
              ]
            },
            {
              icon: Settings,
              label: t('system'),
              path: "system",
              subItems: [
                { label: t('elements'), path: "/system/elements", icon: Box },
                { label: t('lamps'), path: "/system/lamps", icon: Lightbulb },
                { label: t('cars'), path: "/system/cars", icon: Car },
                { label: t('actions'), path: "/system/actions", icon: Activity },
                { label: t('methods'), path: "/system/methods", icon: Wrench },
                { label: t('feeders'), path: "/feeders", icon: Plug },
                { label: t('alarms'), path: "/system/alarms", icon: Bell },
              ]
            },
            { icon: Users, label: t('clients'), path: "/clients" },
          ],
        },
      ];
    }

    if (isClient) {
      return [
        {
          title: t('main'),
          items: [
            { icon: Home, label: t('dashboard'), path: "/" },
            { icon: Upload, label: t('inspections'), path: "/inspections" },
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
        className={`fixed inset-0 bg-black/50 lg:hidden transition-opacity z-40 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-60 bg-sidebar border-r border-sidebar-border flex flex-col
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
        <div className="p-4 border-b border-sidebar-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <span className="text-xl font-bold text-sidebar-primary-foreground">P</span>
            </div>
            <span className="text-xl font-semibold text-sidebar-foreground">PowerScan</span>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1" ref={setScrollRef}>
          <nav className="p-4 space-y-6">
            {menuSections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item, itemIdx) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
                    const isExpanded = expandedMenus.includes(item.path);
                    const hasSubItems = item.subItems && item.subItems.length > 0;

                    return (
                      <div key={itemIdx}>
                        <Button
                          variant={isActive && !hasSubItems ? "default" : "ghost"}
                          onClick={() => {
                            if (hasSubItems) {
                              toggleMenu(item.path);
                            } else {
                              navigate(item.path);
                              onClose();
                            }
                          }}
                          className={`
                          w-full justify-start gap-3
                          ${isActive && !hasSubItems
                              ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            }
                        `}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="flex-1 text-left">{item.label}</span>
                          {hasSubItems && (
                            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                        {hasSubItems && isExpanded && (
                          <div className="ml-7 mt-1 space-y-1">
                            {item.subItems!.map((subItem, subIdx) => {
                              const isSubActive = location.pathname === subItem.path;
                              const SubIcon = subItem.icon;
                              return (
                                <Button
                                  key={subIdx}
                                  variant={isSubActive ? "default" : "ghost"}
                                  onClick={() => {
                                    navigate(subItem.path);
                                    // Don't close sidebar on desktop, only on mobile
                                    if (window.innerWidth < 1024) {
                                      onClose();
                                    }
                                  }}
                                  className={`
                                  w-full justify-start text-sm gap-2
                                  ${isSubActive
                                      ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    }
                                `}
                                >
                                  {SubIcon && <SubIcon className="w-3.5 h-3.5" />}
                                  {subItem.label}
                                </Button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* User Info & Logout */}
        <div className="flex-shrink-0 p-4 border-t border-sidebar-border bg-sidebar">
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
