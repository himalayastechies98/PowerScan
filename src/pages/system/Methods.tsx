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

interface Method {
  id: string;
  name: string;
  formula: string;
  lastUpdate: string;
}

const mockMethods: Method[] = [
  { id: "MTH-001", name: "Thermal Analysis", formula: "ΔT = T_measured - T_ambient", lastUpdate: "11/04/2023 10:35:20" },
  { id: "MTH-002", name: "Load Calculation", formula: "P = V × I × √3 × cos(φ)", lastUpdate: "11/04/2023 11:25:45" },
  { id: "MTH-003", name: "Efficiency Rating", formula: "η = (P_out / P_in) × 100", lastUpdate: "11/05/2023 09:50:30" },
  { id: "MTH-004", name: "Power Factor", formula: "PF = cos(θ)", lastUpdate: "11/06/2023 14:40:15" },
  { id: "MTH-005", name: "Voltage Drop", formula: "V_drop = I × R × L", lastUpdate: "11/07/2023 16:25:50" },
];

export default function Methods() {
  const [methods, setMethods] = useState<Method[]>(mockMethods);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Method | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<Method | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", formula: "" });

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

  const confirmDelete = () => {
    if (deleteId) {
      setMethods(methods.filter(m => m.id !== deleteId));
      toast({ title: "Success", description: "Method deleted successfully" });
    }
    setIsDeleteDialogOpen(false);
    setDeleteId(null);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.formula.trim()) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    if (editingMethod) {
      setMethods(methods.map(m => 
        m.id === editingMethod.id 
          ? { ...m, ...formData, lastUpdate: new Date().toLocaleString() }
          : m
      ));
      toast({ title: "Success", description: "Method updated successfully" });
    } else {
      const newMethod: Method = {
        id: `MTH-${String(methods.length + 1).padStart(3, '0')}`,
        ...formData,
        lastUpdate: new Date().toLocaleString()
      };
      setMethods([...methods, newMethod]);
      toast({ title: "Success", description: "Method created successfully" });
    }
    setIsDialogOpen(false);
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

  return (
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
                <TableHead className="cursor-pointer" onClick={() => handleSort("formula")}>
                  <div className="flex items-center gap-1">
                    FORMULA <ArrowUpDown className="w-4 h-4" />
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
              {paginatedMethods.map((method) => (
                <TableRow key={method.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{method.id}</TableCell>
                  <TableCell>{method.name}</TableCell>
                  <TableCell className="font-mono text-sm">{method.formula}</TableCell>
                  <TableCell className="text-muted-foreground">{method.lastUpdate}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, filteredMethods.length)} of {filteredMethods.length} entries
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
  );
}
