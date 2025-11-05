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

interface Car {
  idUnico: string;
  name: string;
  model: string;
  year: number;
  licensePlate: string;
  mviVersion: string;
  spectromVersion: string;
  neuralNetwork: string;
  lastUpdate: string;
}

const mockCars: Car[] = [
  { idUnico: "CAR-001", name: "Inspection Vehicle 1", model: "Toyota Hilux", year: 2022, licensePlate: "ABC-1234", mviVersion: "v2.3.1", spectromVersion: "v1.8.2", neuralNetwork: "YOLOv5", lastUpdate: "11/04/2023 10:30:15" },
  { idUnico: "CAR-002", name: "Inspection Vehicle 2", model: "Ford Ranger", year: 2021, licensePlate: "XYZ-5678", mviVersion: "v2.2.5", spectromVersion: "v1.7.9", neuralNetwork: "YOLOv4", lastUpdate: "11/05/2023 14:22:40" },
  { idUnico: "CAR-003", name: "Inspection Vehicle 3", model: "Chevrolet S10", year: 2023, licensePlate: "DEF-9012", mviVersion: "v2.4.0", spectromVersion: "v1.9.1", neuralNetwork: "YOLOv5", lastUpdate: "11/06/2023 09:15:30" },
];

export default function Cars() {
  const [cars, setCars] = useState<Car[]>(mockCars);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Car | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    model: "", 
    year: new Date().getFullYear(), 
    licensePlate: "", 
    mviVersion: "", 
    spectromVersion: "", 
    neuralNetwork: "" 
  });

  const handleSort = (field: keyof Car) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleCreate = () => {
    setEditingCar(null);
    setFormData({ 
      name: "", 
      model: "", 
      year: new Date().getFullYear(), 
      licensePlate: "", 
      mviVersion: "", 
      spectromVersion: "", 
      neuralNetwork: "" 
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setFormData({ 
      name: car.name, 
      model: car.model, 
      year: car.year, 
      licensePlate: car.licensePlate, 
      mviVersion: car.mviVersion, 
      spectromVersion: car.spectromVersion, 
      neuralNetwork: car.neuralNetwork 
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setCars(cars.filter(c => c.idUnico !== deleteId));
      toast({ title: "Success", description: "Car deleted successfully" });
    }
    setIsDeleteDialogOpen(false);
    setDeleteId(null);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.model.trim() || !formData.licensePlate.trim()) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    if (editingCar) {
      setCars(cars.map(c => 
        c.idUnico === editingCar.idUnico 
          ? { ...c, ...formData, lastUpdate: new Date().toLocaleString() }
          : c
      ));
      toast({ title: "Success", description: "Car updated successfully" });
    } else {
      const newCar: Car = {
        idUnico: `CAR-${String(cars.length + 1).padStart(3, '0')}`,
        ...formData,
        lastUpdate: new Date().toLocaleString()
      };
      setCars([...cars, newCar]);
      toast({ title: "Success", description: "Car created successfully" });
    }
    setIsDialogOpen(false);
  };

  let filteredCars = cars.filter((car) =>
    Object.values(car).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (sortField) {
    filteredCars.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.ceil(filteredCars.length / entriesPerPage);
  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold mb-2">Cars</h1>
        <Button onClick={handleCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add New Car
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

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("idUnico")}>
                  <div className="flex items-center gap-1">
                    ID UNICO <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                  <div className="flex items-center gap-1">
                    NAME <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("model")}>
                  <div className="flex items-center gap-1">
                    MODEL <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("year")}>
                  <div className="flex items-center gap-1">
                    YEAR <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("licensePlate")}>
                  <div className="flex items-center gap-1">
                    LICENSE PLATE <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("mviVersion")}>
                  <div className="flex items-center gap-1">
                    MVI VERSION <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("spectromVersion")}>
                  <div className="flex items-center gap-1">
                    SPECTROM VERSION <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("neuralNetwork")}>
                  <div className="flex items-center gap-1">
                    NEURAL NETWORK <ArrowUpDown className="w-4 h-4" />
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
              {paginatedCars.map((car) => (
                <TableRow key={car.idUnico} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{car.idUnico}</TableCell>
                  <TableCell>{car.name}</TableCell>
                  <TableCell>{car.model}</TableCell>
                  <TableCell>{car.year}</TableCell>
                  <TableCell>{car.licensePlate}</TableCell>
                  <TableCell>{car.mviVersion}</TableCell>
                  <TableCell>{car.spectromVersion}</TableCell>
                  <TableCell>{car.neuralNetwork}</TableCell>
                  <TableCell className="text-muted-foreground">{car.lastUpdate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleEdit(car)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" onClick={() => handleDelete(car.idUnico)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
            Showing {(currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, filteredCars.length)} of {filteredCars.length} entries
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCar ? "Edit Car" : "Create New Car"}</DialogTitle>
            <DialogDescription>
              {editingCar ? "Update the car details below." : "Fill in the details for the new car."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter car name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Enter model"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                  placeholder="Enter year"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licensePlate">License Plate *</Label>
                <Input
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                  placeholder="Enter license plate"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mviVersion">MVI Version</Label>
                <Input
                  id="mviVersion"
                  value={formData.mviVersion}
                  onChange={(e) => setFormData({ ...formData, mviVersion: e.target.value })}
                  placeholder="Enter MVI version"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spectromVersion">Spectrom Version</Label>
                <Input
                  id="spectromVersion"
                  value={formData.spectromVersion}
                  onChange={(e) => setFormData({ ...formData, spectromVersion: e.target.value })}
                  placeholder="Enter Spectrom version"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="neuralNetwork">Neural Network</Label>
                <Input
                  id="neuralNetwork"
                  value={formData.neuralNetwork}
                  onChange={(e) => setFormData({ ...formData, neuralNetwork: e.target.value })}
                  placeholder="Enter neural network"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {editingCar ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the car from the system.
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
