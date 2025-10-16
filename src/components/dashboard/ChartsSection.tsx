import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, MoreVertical } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const lineChartData = [
  { month: "Jan", Normal: 145, Warning: 25, Critical: 8 },
  { month: "Feb", Normal: 152, Warning: 28, Critical: 12 },
  { month: "Mar", Normal: 168, Warning: 32, Critical: 10 },
  { month: "Apr", Normal: 175, Warning: 30, Critical: 15 },
  { month: "May", Normal: 180, Warning: 35, Critical: 18 },
  { month: "Jun", Normal: 195, Warning: 38, Critical: 14 },
  { month: "Jul", Normal: 202, Warning: 42, Critical: 16 },
  { month: "Aug", Normal: 215, Warning: 45, Critical: 20 },
  { month: "Sep", Normal: 225, Warning: 48, Critical: 22 },
  { month: "Oct", Normal: 238, Warning: 52, Critical: 18 },
];

const pieChartData = [
  { name: "Overheating", value: 42 },
  { name: "Corona Discharge", value: 28 },
  { name: "Structural Damage", value: 15 },
  { name: "Vegetation", value: 8 },
  { name: "Corrosion", value: 5 },
  { name: "Other", value: 2 },
];

const COLORS = [
  "hsl(4, 90%, 58%)",
  "hsl(38, 100%, 50%)",
  "hsl(207, 90%, 54%)",
  "hsl(123, 43%, 45%)",
  "hsl(280, 64%, 52%)",
  "hsl(0, 0%, 46%)",
];

export function ChartsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Line Chart */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Inspection Results Trend</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px"
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="Normal" stroke="hsl(123, 43%, 45%)" strokeWidth={2} />
                <Line type="monotone" dataKey="Warning" stroke="hsl(38, 100%, 50%)" strokeWidth={2} />
                <Line type="monotone" dataKey="Critical" stroke="hsl(4, 90%, 58%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Issue Types Distribution</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px"
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
