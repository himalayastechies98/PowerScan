import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, Edit, Trash2, Plus, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProfileModal } from "@/components/ProfileModal";
import { supabase } from "@/lib/supabase";

interface Action {
  id: string;
  name: string;
  priority: number;
  lastUpdate: string;
}

export default function Actions() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [sortField, setSortField] = useState<keyof Action | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", priority: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // Fetch actions from Supabase with server-side pagination, search, and sorting
  const fetchActions = async () => {
    setIsLoading(true);
    try {
      // Map frontend field names to database column names
      const fieldMapping: Record<string, string> = {
        'id': 'id',
        'name': 'name',
        'priority': 'priority',
        'lastUpdate': 'updated_at'
      };

      // Build query with count
      let query = supabase
        .from('actions')
        .select('*', { count: 'exact' });

      // Apply search filter (searches across name and priority)
      if (debouncedSearchTerm.trim()) {
        query = query.or(`name.ilike.%${debouncedSearchTerm}%,priority.eq.${isNaN(Number(debouncedSearchTerm)) ? -1 : Number(debouncedSearchTerm)}`);
      }

      // Apply sorting
      if (sortField) {
        const dbColumn = fieldMapping[sortField];
        query = query.order(dbColumn, { ascending: sortDirection === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination using range
      const from = (currentPage - 1) * entriesPerPage;
      const to = from + entriesPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setTotalCount(count || 0);

      const mapped = (data || []).map((a: any) => ({
        id: a.id,
        name: a.name,
        priority: a.priority,
        lastUpdate: new Date(a.updated_at || a.created_at).toLocaleString()
      }));
      setActions(mapped);
    } catch (err: any) {
      console.error('Error fetching actions:', err);
      toast({ title: "Error", description: err.message || "Failed to load actions", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Single effect to fetch actions when any dependency changes
  useEffect(() => {
    fetchActions();
  }, [currentPage, entriesPerPage, sortField, sortDirection, debouncedSearchTerm]);

  const handleSort = (field: keyof Action) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleCreate = () => {
    setEditingAction(null);
    setFormData({ name: "", priority: 1 });
    setIsDialogOpen(true);
  };

  const handleEdit = (action: Action) => {
    setEditingAction(action);
    setFormData({ name: action.name, priority: action.priority });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('actions').delete().eq('id', deleteId);
      if (error) throw error;
      toast({ title: "Success", description: "Action deleted successfully" });
      fetchActions();
    } catch (err: any) {
      console.error('Error deleting action:', err);
      toast({ title: "Error", description: err.message || "Failed to delete action", variant: "destructive" });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    try {
      if (editingAction) {
        const { error } = await supabase.from('actions').update({
          name: formData.name,
          priority: formData.priority,
          updated_at: new Date().toISOString()
        }).eq('id', editingAction.id);

        if (error) throw error;
        toast({ title: "Success", description: "Action updated successfully" });
      } else {
        const { error } = await supabase.from('actions').insert({
          name: formData.name,
          priority: formData.priority
        });

        if (error) throw error;
        toast({ title: "Success", description: "Action created successfully" });
      }
      setIsDialogOpen(false);
      fetchActions();
    } catch (err: any) {
      console.error('Error saving action:', err);
      toast({ title: "Error", description: err.message || "Failed to save action", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  // Server-side pagination
  const totalPages = Math.ceil(totalCount / entriesPerPage);

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
              <div>
                <h1 className="text-3xl font-bold mb-2">Actions</h1>
                <p className="text-muted-foreground">System Actions Overview and Management</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={fetchActions} title="Refresh List">
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button onClick={handleCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('create')}
                </Button>
              </div>
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
                {isLoading ? (
                  <div className="text-center py-8">{t('loading')}</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer" onClick={() => handleSort("id")}>
                          <div className="flex items-center gap-1">
                            ID <ArrowUpDown className="w-4 h-4" />
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                          <div className="flex items-center gap-1">
                            NAME <ArrowUpDown className="w-4 h-4" />
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort("priority")}>
                          <div className="flex items-center gap-1">
                            PRIORITY <ArrowUpDown className="w-4 h-4" />
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
                      {actions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">No actions found</TableCell>
                        </TableRow>
                      ) : (
                        actions.map((action) => (
                          <TableRow key={action.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-mono text-xs">{action.id.substring(0, 8)}...</TableCell>
                            <TableCell className="font-medium">{action.name}</TableCell>
                            <TableCell>{action.priority}</TableCell>
                            <TableCell className="text-muted-foreground">{action.lastUpdate}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleEdit(action)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDelete(action.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, totalCount)} of {totalCount} entries
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
                  {(() => {
                    const pages = [];
                    const maxVisible = 5;
                    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                    let end = Math.min(totalPages, start + maxVisible - 1);
                    if (end - start < maxVisible - 1) {
                      start = Math.max(1, end - maxVisible + 1);
                    }
                    for (let i = start; i <= end; i++) {
                      pages.push(
                        <Button
                          key={i}
                          variant={currentPage === i ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(i)}
                        >
                          {i}
                        </Button>
                      );
                    }
                    return pages;
                  })()}
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
                  <DialogTitle>{editingAction ? "Edit Action" : "Create New Action"}</DialogTitle>
                  <DialogDescription>
                    {editingAction ? "Update the action details below." : "Fill in the details for the new action."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter action name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Input
                      id="priority"
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                      placeholder="Enter priority"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isCreating}>
                    {isCreating ? t('loading') : (editingAction ? "Update" : "Create")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the action from the system.
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
