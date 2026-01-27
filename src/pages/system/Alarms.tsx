import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProfileModal } from "@/components/ProfileModal";
import { supabase } from "@/lib/supabase";
import { InfiniteScrollElementSelect } from "@/components/InfiniteScrollElementSelect";
import { InfiniteScrollActionSelect } from "@/components/InfiniteScrollActionSelect";
import { InfiniteScrollMethodSelect } from "@/components/InfiniteScrollMethodSelect";

interface Alarm {
  id: string;
  name: string;
  element_id: string;
  action_id: string;
  method_id: string;
  min_value: number | null;
  max_value: number | null;
  created_at: string;
  updated_at: string;
  element?: { name: string; tag: string };
  action?: { name: string };
  method?: { name: string; formula: string };
}

export default function Alarms() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [sortField, setSortField] = useState<keyof Alarm | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    element_id: "",
    action_id: "",
    method_id: "",
    min_value: "",
    max_value: ""
  });

  // Fetch alarms from Supabase with joined data
  useEffect(() => {
    fetchAlarms();
  }, []);

  const fetchAlarms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alarms')
        .select(`
          *,
          element:elements(name, tag),
          action:actions(name),
          method:methods(name, formula)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlarms(data || []);
    } catch (error) {
      console.error('Error fetching alarms:', error);
      toast({ title: "Error", description: "Failed to load alarms", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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
    setFormData({
      name: "",
      element_id: "",
      action_id: "",
      method_id: "",
      min_value: "",
      max_value: ""
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setFormData({
      name: alarm.name,
      element_id: alarm.element_id,
      action_id: alarm.action_id,
      method_id: alarm.method_id,
      min_value: alarm.min_value?.toString() || "",
      max_value: alarm.max_value?.toString() || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('alarms')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({ title: "Success", description: "Alarm deleted successfully" });
      fetchAlarms();
    } catch (error) {
      console.error('Error deleting alarm:', error);
      toast({ title: "Error", description: "Failed to delete alarm", variant: "destructive" });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.element_id || !formData.action_id || !formData.method_id) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      const alarmData = {
        name: formData.name,
        element_id: formData.element_id,
        action_id: formData.action_id,
        method_id: formData.method_id,
        min_value: formData.min_value ? parseFloat(formData.min_value) : null,
        max_value: formData.max_value ? parseFloat(formData.max_value) : null,
        updated_at: new Date().toISOString()
      };

      if (editingAlarm) {
        // Update existing alarm
        const { error } = await supabase
          .from('alarms')
          .update(alarmData)
          .eq('id', editingAlarm.id);

        if (error) throw error;
        toast({ title: "Success", description: "Alarm updated successfully" });
      } else {
        // Create new alarm
        const { error } = await supabase
          .from('alarms')
          .insert([alarmData]);

        if (error) throw error;
        toast({ title: "Success", description: "Alarm created successfully" });
      }

      fetchAlarms();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving alarm:', error);
      toast({ title: "Error", description: "Failed to save alarm", variant: "destructive" });
    }
  };

  let filteredAlarms = alarms.filter((alarm) =>
    alarm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alarm.element?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alarm.action?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alarm.method?.name.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Calculate visible pagination buttons (max 5)
  const getVisiblePages = () => {
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <main className="flex-1 lg:ml-60 transition-all duration-300">
        <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <DashboardHeader />

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
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
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

              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="text-muted-foreground">Loading...</div>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                            <div className="flex items-center gap-1">
                              NAME <ArrowUpDown className="w-4 h-4" />
                            </div>
                          </TableHead>
                          <TableHead>ELEMENT</TableHead>
                          <TableHead>ACTION</TableHead>
                          <TableHead>METHOD</TableHead>
                          <TableHead>MIN VALUE</TableHead>
                          <TableHead>MAX VALUE</TableHead>
                          <TableHead>ACTIONS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedAlarms.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                              No alarms found
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedAlarms.map((alarm) => (
                            <TableRow key={alarm.id} className="hover:bg-muted/50 transition-colors">
                              <TableCell className="font-medium">{alarm.name}</TableCell>
                              <TableCell>
                                {alarm.element ? `${alarm.element.name} (${alarm.element.tag})` : 'N/A'}
                              </TableCell>
                              <TableCell>{alarm.action?.name || 'N/A'}</TableCell>
                              <TableCell>{alarm.method?.name || 'N/A'}</TableCell>
                              <TableCell>{alarm.min_value ?? 'N/A'}</TableCell>
                              <TableCell>{alarm.max_value ?? 'N/A'}</TableCell>
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
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {filteredAlarms.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, filteredAlarms.length)} of{filteredAlarms.length} entries
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
                      {getVisiblePages().map((page) => (
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
                        disabled={currentPage === totalPages || totalPages === 0}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingAlarm ? "Edit Alarm" : "Create New Alarm"}</DialogTitle>
                  <DialogDescription>
                    {editingAlarm ? "Update the alarm details below." : "Fill in the details for the new alarm."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter alarm name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="element">Element *</Label>
                    <InfiniteScrollElementSelect
                      value={formData.element_id}
                      onValueChange={(val) => setFormData({ ...formData, element_id: val })}
                      placeholder="Select an element..."
                      initialData={editingAlarm?.element ? { ...editingAlarm.element, id: editingAlarm.element_id } : null}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="action">Action *</Label>
                    <InfiniteScrollActionSelect
                      value={formData.action_id}
                      onValueChange={(val) => setFormData({ ...formData, action_id: val })}
                      placeholder="Select an action..."
                      initialData={editingAlarm?.action ? { ...editingAlarm.action, id: editingAlarm.action_id } : null}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="method">Method *</Label>
                    <InfiniteScrollMethodSelect
                      value={formData.method_id}
                      onValueChange={(val) => setFormData({ ...formData, method_id: val })}
                      placeholder="Select a method..."
                      initialData={editingAlarm?.method ? { ...editingAlarm.method, id: editingAlarm.method_id } : null}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min_value">Min Value</Label>
                      <Input
                        id="min_value"
                        type="number"
                        step="any"
                        value={formData.min_value}
                        onChange={(e) => setFormData({ ...formData, min_value: e.target.value })}
                        placeholder="Enter min value"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_value">Max Value</Label>
                      <Input
                        id="max_value"
                        type="number"
                        step="any"
                        value={formData.max_value}
                        onChange={(e) => setFormData({ ...formData, max_value: e.target.value })}
                        placeholder="Enter max value"
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

          <footer className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div>{t('copyright')}</div>
            <div>{t('version')}</div>
          </footer>
        </div>
      </main>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}
