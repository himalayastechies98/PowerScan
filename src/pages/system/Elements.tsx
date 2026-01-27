import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Plus, ArrowUpDown, Edit, Trash2, RefreshCw } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProfileModal } from '@/components/ProfileModal';
import { supabase } from '@/lib/supabase';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Element {
  id: string;
  name: string;
  tag: string;
  index: number;
  lastUpdate: string;
}

export default function Elements() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [elements, setElements] = useState<Element[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [sortField, setSortField] = useState<keyof Element | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<Element | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', tag: '', index: 0 });
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

  // Fetch elements from Supabase with server-side pagination, search, and sorting
  const fetchElements = async () => {
    setIsLoading(true);
    try {
      // Map frontend field names to database column names
      const fieldMapping: Record<string, string> = {
        'id': 'id',
        'name': 'name',
        'tag': 'tag',
        'index': 'index',
        'lastUpdate': 'updated_at'
      };

      // Build query with count
      let query = supabase
        .from('elements')
        .select('*', { count: 'exact' });

      // Apply search filter (searches across multiple fields)
      if (debouncedSearchTerm.trim()) {
        query = query.or(`name.ilike.%${debouncedSearchTerm}%,tag.ilike.%${debouncedSearchTerm}%,index.eq.${isNaN(Number(debouncedSearchTerm)) ? -1 : Number(debouncedSearchTerm)}`);
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

      const mapped = (data || []).map((e: any) => ({
        id: e.id,
        name: e.name,
        tag: e.tag,
        index: e.index,
        lastUpdate: new Date(e.updated_at).toLocaleString()
      }));
      setElements(mapped);
    } catch (err: any) {
      console.error('Error fetching elements:', err);
      toast({ title: 'Error', description: err.message || 'Failed to load elements', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Single effect to fetch elements when any dependency changes
  useEffect(() => {
    fetchElements();
  }, [currentPage, entriesPerPage, sortField, sortDirection, debouncedSearchTerm]);

  const handleSort = (field: keyof Element) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.tag.trim()) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setIsCreating(true);
    try {
      if (editingElement) {
        const { error } = await supabase.from('elements').update({
          name: formData.name,
          tag: formData.tag,
          index: formData.index,
          updated_at: new Date().toISOString()
        }).eq('id', editingElement.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Element updated successfully' });
      } else {
        const { error } = await supabase.from('elements').insert({
          name: formData.name,
          tag: formData.tag,
          index: formData.index
        });
        if (error) throw error;
        toast({ title: 'Success', description: 'Element created successfully' });
      }
      setIsDialogOpen(false);
      setFormData({ name: '', tag: '', index: 0 });
      setEditingElement(null);
      fetchElements();
    } catch (err: any) {
      console.error('Error saving element:', err);
      toast({ title: 'Error', description: err.message || 'Failed to save element', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('elements').delete().eq('id', deleteId);
      if (error) throw error;
      toast({ title: 'Success', description: 'Element deleted successfully' });
      fetchElements();
    } catch (err: any) {
      console.error('Error deleting element:', err);
      toast({ title: 'Error', description: err.message || 'Failed to delete element', variant: 'destructive' });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  // Server-side pagination
  const totalPages = Math.ceil(totalCount / entriesPerPage);


  return (
    <div className="flex min-h-screen w-full">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpenProfile={() => setIsProfileOpen(true)} />
      <main className="flex-1 lg:ml-60 transition-all duration-300">
        <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <DashboardHeader />
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Elements</h1>
                <p className="text-muted-foreground">System Components Overview and Management</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={fetchElements} title="Refresh List">
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button onClick={() => { setEditingElement(null); setFormData({ name: '', tag: '', index: 0 }); setIsDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('create')}
                </Button>
              </div>
            </div>
            <Card className="p-6">
              <CardHeader className="flex flex-row items-center justify-between">
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
                  <Input className="w-64" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">{t('loading')}</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('id')}>ID <ArrowUpDown className="w-4 h-4 inline" /></TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>NAME <ArrowUpDown className="w-4 h-4 inline" /></TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('tag')}>TAG <ArrowUpDown className="w-4 h-4 inline" /></TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('index')}>INDEX <ArrowUpDown className="w-4 h-4 inline" /></TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('lastUpdate')}>LAST UPDATE <ArrowUpDown className="w-4 h-4 inline" /></TableHead>
                        <TableHead>ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {elements.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">No elements found</TableCell>
                        </TableRow>
                      ) : (
                        elements.map((element) => (
                          <TableRow key={element.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-mono text-xs">{element.id.substring(0, 8)}...</TableCell>
                            <TableCell className="font-medium">{element.name}</TableCell>
                            <TableCell>{element.tag}</TableCell>
                            <TableCell>{element.index}</TableCell>
                            <TableCell className="text-muted-foreground">{element.lastUpdate}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => { setEditingElement(element); setFormData({ name: element.name, tag: element.tag, index: element.index }); setIsDialogOpen(true); }}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => { setDeleteId(element.id); setIsDeleteDialogOpen(true); }}>
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
                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, totalCount)} of {totalCount} entries
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
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
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Dialog for create / edit */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingElement ? 'Edit Element' : 'Create New Element'}</DialogTitle>
                <DialogDescription>{editingElement ? 'Update the element details below.' : 'Fill in the details for the new element.'}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter element name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tag">Tag *</Label>
                    <Input id="tag" value={formData.tag} onChange={(e) => setFormData({ ...formData, tag: e.target.value })} placeholder="Enter element tag" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="index">Index</Label>
                    <Input id="index" type="number" value={formData.index} onChange={(e) => setFormData({ ...formData, index: parseInt(e.target.value) || 0 })} placeholder="Enter index" />
                  </div>
                </div>
                <Button onClick={handleSubmit} className="w-full" disabled={isCreating}>{isCreating ? t('loading') : editingElement ? 'Update' : 'Create'}</Button>
              </div>
            </DialogContent>
          </Dialog>
          {/* Delete confirmation */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone. It will permanently delete the element.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
