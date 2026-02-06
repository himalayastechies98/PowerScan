import { useTranslation } from "react-i18next";
import { Bolt, Flame, Activity, Zap, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/useDashboardData";

export function StatsCards() {
  const { t } = useTranslation();
  const { stats } = useDashboardData();

  const statsConfig = [
    {
      icon: Bolt,
      value: stats.totalInspections,
      label: t('totalInspections'),
      subtitle: `+2 ${t('today')}`,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Activity,
      value: stats.totalMeasures.toLocaleString(),
      label: t('totalMeasures'),
      subtitle: `+120 ${t('thisWeek')}`,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Flame,
      value: stats.hotspotsDetected,
      label: t('hotspotsDetected'),
      subtitle: `+3 ${t('newItems')}`,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Zap,
      value: stats.activeFeeders,
      label: t('activeFeeders'),
      subtitle: t('allSystemsLive'),
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  if (stats.loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardContent className="p-6 flex items-center justify-center h-[140px]">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsConfig.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className={`absolute -top-4 -right-4 w-24 h-24 ${stat.bgColor} rounded-full opacity-50 group-hover:opacity-70 transition-opacity`} />
            <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground mb-2">{stat.label}</div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>{stat.subtitle}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
