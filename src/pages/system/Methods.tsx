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

interface Method {
  id: string;
  name: string;
  formula: string;
  created_at: string;
  updated_at: string;
}

export default function Methods() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [methods, setMethods] = useState<Method[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [sortField, setSortField] = useState<keyof Method | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<Method | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", formula: "" });

  // Fetch methods from Supabase
  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('methods')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMethods(data || []);
    } catch (error) {
      console.error('Error fetching methods:', error);
      toast({ title: "Error", description: "Failed to load methods", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof Method) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleCreate = () => {
    setEditingMethod(null);
    setFormData({ name: "", formula: "" });
    setIsDialogOpen(true);
  };

  const handleEdit = (method: Method) => {
    setEditingMethod(method);
    setFormData({ name: method.name, formula: method.formula });
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
        .from('methods')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({ title: "Success", description: "Method deleted successfully" });
      fetchMethods();
    } catch (error) {
      console.error('Error deleting method:', error);
      toast({ title: "Error", description: "Failed to delete method", variant: "destructive" });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.formula.trim()) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      if (editingMethod) {
        // Update existing method
        const { error } = await supabase
          .from('methods')
          .update({
            name: formData.name,
            formula: formData.formula,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingMethod.id);

        if (error) throw error;
        toast({ title: "Success", description: "Method updated successfully" });
      } else {
        // Create new method
        const { error } = await supabase
          .from('methods')
          .insert([{
            name: formData.name,
            formula: formData.formula
          }]);

        if (error) throw error;
        toast({ title: "Success", description: "Method created successfully" });
      }

      fetchMethods();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving method:', error);
      toast({ title: "Error", description: "Failed to save method", variant: "destructive" });
    }
  };

  let filteredMethods = methods.filter((method) =>
    Object.values(method).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (sortField) {
    filteredMethods.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.ceil(filteredMethods.length / entriesPerPage);
  const paginatedMethods = filteredMethods.slice(
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
              <h1 className="text-3xl font-bold mb-2">Methods</h1>
              <Button onClick={handleCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add New Method
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
                          <TableHead className="cursor-pointer" onClick={() => handleSort("formula")}>
                            <div className="flex items-center gap-1">
                              FORMULA <ArrowUpDown className="w-4 h-4" />
                            </div>
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort("updated_at")}>
                            <div className="flex items-center gap-1">
                              LAST UPDATE <ArrowUpDown className="w-4 h-4" />
                            </div>
                          </TableHead>
                          <TableHead>ACTIONS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedMethods.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              No methods found
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedMethods.map((method) => (
                            <TableRow key={method.id} className="hover:bg-muted/50 transition-colors">
                              <TableCell className="font-medium">{method.name}</TableCell>
                              <TableCell className="font-mono text-sm">{method.formula}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {new Date(method.updated_at).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => handleEdit(method)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" onClick={() => handleDelete(method.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
                      Showing {filteredMethods.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, filteredMethods.length)} of {filteredMethods.length} entries
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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingMethod ? "Edit Method" : "Create New Method"}</DialogTitle>
                  <DialogDescription>
                    {editingMethod ? "Update the method details below." : "Fill in the details for the new method."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter method name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="formula">Formula *</Label>
                    <Input
                      id="formula"
                      value={formData.formula}
                      onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                      placeholder="Enter formula"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {editingMethod ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the method from the system.
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
