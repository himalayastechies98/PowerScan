import { Menu, Search, Bell, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useTranslation } from "react-i18next";

interface TopBarProps {
  onToggleSidebar: () => void;
}

export function TopBar({ onToggleSidebar }: TopBarProps) {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3">
      <div className="flex items-center gap-4">
        {/* Toggle Sidebar Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Search */}
        <div className="relative flex-1 max-w-xl hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('search')}
            className="pl-10"
          />
        </div>
{/* System Health */}
<div className="flex items-center gap-2 ml-auto mr-4">
  <span className="relative flex h-2.5 w-2.5">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
  </span>

  <span className="text-sm text-muted-foreground whitespace-nowrap">
    {t("system.health")}:
    <span className="text-green-500 font-medium ml-1">
      {t("system.normal")}
    </span>
  </span>
</div>


        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>
          <Button variant="ghost" size="icon">
            <Mail className="w-5 h-5" />
          </Button>
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
