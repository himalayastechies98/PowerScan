import { Bolt, AlertTriangle, Activity, Truck, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const stats = [
  {
    icon: Bolt,
    value: "2,547",
    label: "Total Inspections",
    trend: { value: "12%", isUp: true },
  },
  {
    icon: AlertTriangle,
    value: "186",
    label: "Identified Issues",
    trend: { value: "3%", isUp: false },
  },
  {
    icon: Activity,
    value: "98.7%",
    label: "Network Reliability",
    trend: { value: "0.5%", isUp: true },
  },
  {
    icon: Truck,
    value: "42",
    label: "Maintenance Dispatches",
    trend: { value: "8%", isUp: false },
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full" />
            <stat.icon className="w-8 h-8 text-primary mb-4" />
            <div className="text-3xl font-semibold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground mb-2">{stat.label}</div>
            <div
              className={cn(
                "flex items-center gap-1 text-sm",
                stat.trend.isUp ? "text-green-600" : "text-red-600"
              )}
            >
              {stat.trend.isUp ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{stat.trend.value} from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
