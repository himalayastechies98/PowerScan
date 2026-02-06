import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ChevronRight, Loader2, Flame, MapPin, Thermometer } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { cn } from "@/lib/utils";

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "Ação Imediata":
      return { variant: "destructive" as const, label: "Immediate Action", color: "bg-red-500" };
    case "Ação Programada":
      return { variant: "secondary" as const, label: "Scheduled Action", color: "bg-orange-500" };
    case "Sem Ação":
      return { variant: "default" as const, label: "No Action", color: "bg-green-500" };
    default:
      return { variant: "outline" as const, label: "Not Defined", color: "bg-gray-500" };
  }
};

export function DataTable() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { recentMeasures, stats } = useDashboardData();

  if (stats.loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6 flex items-center justify-center h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          {t('recentActivity')}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary"
          onClick={() => navigate('/distribution')}
        >
          {t('viewAll')}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        {recentMeasures.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('noRecentActivity')}
          </div>
        ) : (
          <div className="space-y-3">
            {recentMeasures.map((measure, index) => {
              const badge = getSeverityBadge(measure.severity);
              return (
                <div
                  key={measure.id || index}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
                  onClick={() => navigate(`/distribution`)}
                >
                  {/* Thermal Image Placeholder */}
                  <div className="w-16 h-12 rounded-md bg-gradient-to-r from-blue-900 via-purple-600 to-orange-500 flex-shrink-0 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <Thermometer className="w-5 h-5 text-white/80" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {measure.feeder || `Feeder ${index + 1}`}
                      </span>
                      {measure.id && (
                        <span className="text-xs text-muted-foreground">
                          #{measure.id.substring(0, 8)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{measure.location}</span>
                    </div>
                  </div>

                  {/* Temperature */}
                  <div className="text-right flex-shrink-0">
                    <div className={cn(
                      "text-sm font-semibold",
                      measure.temperature && measure.temperature > 60 ? "text-red-500" : "text-foreground"
                    )}>
                      {measure.temperature ? `${measure.temperature.toFixed(1)}°C` : '-'}
                    </div>
                    <Badge variant={badge.variant} className="text-xs mt-1">
                      {badge.label}
                    </Badge>
                  </div>

                  {/* Action */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
