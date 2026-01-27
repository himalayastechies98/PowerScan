import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface Car {
  idUnico: string;
  name: string;
  model: string;
  year: number;
  licensePlate: string;
  lastUpdate: string;
}

export default function Cars() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [sortField, setSortField] = useState<keyof Car | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', model: '', year: new Date().getFullYear(), licensePlate: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch cars from Supabase with server-side pagination, search, and sorting
  const fetchCars = async () => {
    setIsLoading(true);
    try {
      // Map frontend field names to database column names
      const fieldMapping: Record<string, string> = {
        'idUnico': 'id_unico',
        'name': 'name',
        'model': 'model',
        'year': 'year',
        'licensePlate': 'license_plate',
        'lastUpdate': 'updated_at'
      };

      // Build query with count
      let query = supabase
        .from('cars')
        .select('*', { count: 'exact' });

      // Apply search filter (searches across multiple fields)
      if (debouncedSearchTerm.trim()) {
        query = query.or(`id_unico.ilike.%${debouncedSearchTerm}%,name.ilike.%${debouncedSearchTerm}%,model.ilike.%${debouncedSearchTerm}%,license_plate.ilike.%${debouncedSearchTerm}%,year.eq.${isNaN(Number(debouncedSearchTerm)) ? 0 : Number(debouncedSearchTerm)}`);
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

      const mapped = (data || []).map((c: any) => ({
        idUnico: c.id_unico,
        name: c.name,
        model: c.model,
        year: c.year,
        licensePlate: c.license_plate,
        lastUpdate: new Date(c.updated_at).toLocaleString()
      }));

      setCars(mapped);
    } catch (err: any) {
      console.error('Error fetching cars:', err);
      toast({ title: 'Error', description: err.message || 'Failed to load cars', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

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

  // Single effect to fetch cars when any dependency changes
  useEffect(() => {
    fetchCars();
  }, [currentPage, entriesPerPage, sortField, sortDirection, debouncedSearchTerm]);

  const handleSort = (field: keyof Car) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.model.trim() || !formData.licensePlate.trim()) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setIsCreating(true);
    try {
      if (editingCar) {
        const { error } = await supabase.from('cars').update({
          name: formData.name,
          model: formData.model,
          year: formData.year,
          license_plate: formData.licensePlate,
          updated_at: new Date().toISOString()
        }).eq('id_unico', editingCar.idUnico);
        if (error) throw error;
        toast({ title: 'Success', description: 'Car updated successfully' });
      } else {
        // Get the current max ID to generate a new unique ID
        const { data: existingCars } = await supabase
          .from('cars')
          .select('id_unico')
          .order('id_unico', { ascending: false })
          .limit(1);

        let nextNumber = 1;
        if (existingCars && existingCars.length > 0) {
          const lastId = existingCars[0].id_unico;
          const match = lastId.match(/CAR-(\d+)/);
          if (match) {
            nextNumber = parseInt(match[1]) + 1;
          }
        }

        const newId = `CAR-${String(nextNumber).padStart(3, '0')}`;
        const { error } = await supabase.from('cars').insert({
          id_unico: newId,
          name: formData.name,
          model: formData.model,
          year: formData.year,
          license_plate: formData.licensePlate
        });
        if (error) throw error;
        toast({ title: 'Success', description: 'Car created successfully' });
      }
      setIsDialogOpen(false);
      setFormData({ name: '', model: '', year: new Date().getFullYear(), licensePlate: '' });
      setEditingCar(null);
      fetchCars();
    } catch (err: any) {
      console.error('Error saving car:', err);
      toast({ title: 'Error', description: err.message || 'Failed to save car', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('cars').delete().eq('id_unico', deleteId);
      if (error) throw error;
      toast({ title: 'Success', description: 'Car deleted successfully' });

      // Check if we need to go back a page after deletion
      const newTotalCount = totalCount - 1;
      const newTotalPages = Math.ceil(newTotalCount / entriesPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      } else {
        fetchCars();
      }
    } catch (err: any) {
      console.error('Error deleting car:', err);
      toast({ title: 'Error', description: err.message || 'Failed to delete car', variant: 'destructive' });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

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
              <h1 className="text-3xl font-bold mb-2">Cars</h1>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={fetchCars} title="Refresh List">
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button onClick={() => { setEditingCar(null); setFormData({ name: '', model: '', year: new Date().getFullYear(), licensePlate: '' }); setIsDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('create')}
                </Button>
              </div>
            </div>
            <Card className="p-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show</span>
                  <Select value={String(entriesPerPage)} onValueChange={(val) => { setEntriesPerPage(Number(val)); setCurrentPage(1); }}>
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
                        <TableHead className="cursor-pointer" onClick={() => handleSort('idUnico')}>ID UNICO <ArrowUpDown className="w-4 h-4 inline" /></TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>Name <ArrowUpDown className="w-4 h-4 inline" /></TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('model')}>Model <ArrowUpDown className="w-4 h-4 inline" /></TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('year')}>Year <ArrowUpDown className="w-4 h-4 inline" /></TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('licensePlate')}>License Plate <ArrowUpDown className="w-4 h-4 inline" /></TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('lastUpdate')}>Last Update <ArrowUpDown className="w-4 h-4 inline" /></TableHead>
                        <TableHead>ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cars.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">No cars found</TableCell>
                        </TableRow>
                      ) : (
                        cars.map((car) => (
                          <TableRow key={car.idUnico} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium">{car.idUnico}</TableCell>
                            <TableCell>{car.name}</TableCell>
                            <TableCell>{car.model}</TableCell>
                            <TableCell>{car.year}</TableCell>
                            <TableCell>{car.licensePlate}</TableCell>
                            <TableCell className="text-muted-foreground">{car.lastUpdate}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => { setEditingCar(car); setFormData({ name: car.name, model: car.model, year: car.year, licensePlate: car.licensePlate }); setIsDialogOpen(true); }}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => { setDeleteId(car.idUnico); setIsDeleteDialogOpen(true); }}>
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
                    Showing {totalCount === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, totalCount)} of {totalCount} entries
                  </div>
                  {totalPages > 1 && (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      {(() => {
                        const maxVisible = 5;
                        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                        if (endPage - startPage + 1 < maxVisible) {
                          startPage = Math.max(1, endPage - maxVisible + 1);
                        }
                        const pages = [];
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <Button
                              key={i}
                              variant={currentPage === i ? "default" : "outline"}
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
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Dialog for create / edit */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingCar ? 'Edit Car' : 'Create New Car'}</DialogTitle>
                  <DialogDescription>{editingCar ? 'Update the car details below.' : 'Fill in the details for the new car.'}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter car name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model *</Label>
                      <Input id="model" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} placeholder="Enter model" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input id="year" type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })} placeholder="Enter year" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="licensePlate">License Plate *</Label>
                      <Input id="licensePlate" value={formData.licensePlate} onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })} placeholder="Enter license plate" />
                    </div>
                  </div>
                  <Button onClick={handleSubmit} className="w-full" disabled={isCreating}>{isCreating ? t('loading') : editingCar ? 'Update' : 'Create'}</Button>
                </div>
              </DialogContent>
            </Dialog>
            {/* Delete confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone. It will permanently delete the car.</AlertDialogDescription>
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
        </div>
      </main>
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}
