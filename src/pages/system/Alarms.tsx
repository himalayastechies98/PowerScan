import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, Edit, Trash2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface Alarm {
  id: string;
  element: string;
  method: string;
  action: string;
  min: number;
  max: number;
  lastUpdate: string;
}

const mockAlarms: Alarm[] = [
  { id: "ALM-001", element: "Capacitor", method: "Thermal Analysis", action: "Immediate Repair", min: 50, max: 85, lastUpdate: "11/04/2023 10:45:30" },
  { id: "ALM-002", element: "Transformer", method: "Load Calculation", action: "Schedule Inspection", min: 60, max: 90, lastUpdate: "11/04/2023 11:30:15" },
  { id: "ALM-003", element: "Chave Óleo", method: "Thermal Analysis", action: "Monitor Status", min: 45, max: 80, lastUpdate: "11/05/2023 09:55:40" },
  { id: "ALM-004", element: "Regulator", method: "Efficiency Rating", action: "Replace Component", min: 55, max: 88, lastUpdate: "11/06/2023 14:50:20" },
  { id: "ALM-005", element: "Recloser", method: "Power Factor", action: "Clean Equipment", min: 40, max: 75, lastUpdate: "11/07/2023 16:30:45" },
];

export default function Alarms() {
  const [alarms, setAlarms] = useState<Alarm[]>(mockAlarms);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Alarm | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    element: "", 
    method: "", 
    action: "", 
    min: 0, 
    max: 0 
  });

  const handleSort = (field: keyof Alarm) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleCreate = () => {
    setEditingAlarm(null);
    setFormData({ element: "", method: "", action: "", min: 0, max: 0 });
    setIsDialogOpen(true);
  };

  const handleEdit = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setFormData({ 
      element: alarm.element, 
      method: alarm.method, 
      action: alarm.action, 
      min: alarm.min, 
      max: alarm.max 
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setAlarms(alarms.filter(a => a.id !== deleteId));
      toast({ title: "Success", description: "Alarm deleted successfully" });
    }
    setIsDeleteDialogOpen(false);
    setDeleteId(null);
  };

  const handleSubmit = () => {
    if (!formData.element.trim() || !formData.method.trim() || !formData.action.trim()) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    if (editingAlarm) {
      setAlarms(alarms.map(a => 
        a.id === editingAlarm.id 
          ? { ...a, ...formData, lastUpdate: new Date().toLocaleString() }
          : a
      ));
      toast({ title: "Success", description: "Alarm updated successfully" });
    } else {
      const newAlarm: Alarm = {
        id: `ALM-${String(alarms.length + 1).padStart(3, '0')}`,
        ...formData,
        lastUpdate: new Date().toLocaleString()
      };
      setAlarms([...alarms, newAlarm]);
      toast({ title: "Success", description: "Alarm created successfully" });
    }
    setIsDialogOpen(false);
  };

  let filteredAlarms = alarms.filter((alarm) =>
    Object.values(alarm).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (sortField) {
    filteredAlarms.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.ceil(filteredAlarms.length / entriesPerPage);
  const paginatedAlarms = filteredAlarms.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold mb-2">Alarms</h1>
        <Button onClick={handleCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add New Alarm
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select value={String(entriesPerPage)} onValueChange={(val) => setEntriesPerPage(Number(val))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">entries</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Search:</span>
            <Input
              className="w-64"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("element")}>
                  <div className="flex items-center gap-1">
                    ELEMENT <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("method")}>
                  <div className="flex items-center gap-1">
                    METHOD <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("action")}>
                  <div className="flex items-center gap-1">
                    ACTION <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("min")}>
                  <div className="flex items-center gap-1">
                    MIN <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("max")}>
                  <div className="flex items-center gap-1">
                    MAX <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("lastUpdate")}>
                  <div className="flex items-center gap-1">
                    LAST UPDATE <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead>ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAlarms.map((alarm) => (
                <TableRow key={alarm.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{alarm.element}</TableCell>
                  <TableCell>{alarm.method}</TableCell>
                  <TableCell>{alarm.action}</TableCell>
                  <TableCell>{alarm.min}°C</TableCell>
                  <TableCell>{alarm.max}°C</TableCell>
                  <TableCell className="text-muted-foreground">{alarm.lastUpdate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleEdit(alarm)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" onClick={() => handleDelete(alarm.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, filteredAlarms.length)} of {filteredAlarms.length} entries
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAlarm ? "Edit Alarm" : "Create New Alarm"}</DialogTitle>
            <DialogDescription>
              {editingAlarm ? "Update the alarm details below." : "Fill in the details for the new alarm."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="element">Element *</Label>
              <Input
                id="element"
                value={formData.element}
                onChange={(e) => setFormData({ ...formData, element: e.target.value })}
                placeholder="Enter element"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">Method *</Label>
              <Input
                id="method"
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                placeholder="Enter method"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="action">Action *</Label>
              <Input
                id="action"
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                placeholder="Enter action"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min">Min (°C)</Label>
                <Input
                  id="min"
                  type="number"
                  value={formData.min}
                  onChange={(e) => setFormData({ ...formData, min: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter min"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max">Max (°C)</Label>
                <Input
                  id="max"
                  type="number"
                  value={formData.max}
                  onChange={(e) => setFormData({ ...formData, max: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter max"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {editingAlarm ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the alarm from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
