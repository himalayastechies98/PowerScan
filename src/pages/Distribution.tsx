import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProfileModal } from "@/components/ProfileModal";
import { DistributionFilters } from "@/components/distribution/DistributionFilters";
import { DistributionTable } from "@/components/distribution/DistributionTable";
import { AddInspectionModal } from "@/components/distribution/AddInspectionModal";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface DistributionRecord {
  id: string;
  name: string;
  ea: string;
  feeder: string;
  feederId: string | null;
  status: string;
  vehicle: string;
  carId: string | null;
  measures: { red: number; yellow: number };
  type: string;
  lastMeasure: string;
}

export default function Distribution() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(() => {
    const today = new Date();
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(today.getDate() - 60);
    return { from: sixtyDaysAgo, to: today };
  });
  const [inspections, setInspections] = useState("");
  const [cars, setCars] = useState("");
  const [feeders, setFeeders] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    feeder: "",
    car: ""
  });
  const [inspectionsData, setInspectionsData] = useState<DistributionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInspections = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('inspections')
        .select(`
          id_unico,
          name,
          ea,
          feeder_id,
          car_id,
          status,
          measures_red,
          measures_yellow,
          inspection_type,
          last_measure_date,
          feeders:feeder_id(name),
          cars:car_id(name, model)
        `)
        .order('created_at', { ascending: false });

      // Apply filters if selected
      if (cars) {
        query = query.eq('car_id', cars);
      }
      if (feeders) {
        query = query.eq('feeder_id', feeders);
      }
      if (inspections) {
        query = query.eq('id_unico', inspections);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mapped: DistributionRecord[] = (data || []).map((i: any) => ({
        id: i.id_unico,
        name: i.name,
        ea: i.ea || '-',
        feeder: i.feeders?.name || '-',
        feederId: i.feeder_id,
        status: i.status,
        vehicle: i.cars ? `${i.cars.name} ${i.cars.model}` : '-',
        carId: i.car_id,
        measures: { red: i.measures_red || 0, yellow: i.measures_yellow || 0 },
        type: 'Thermo - T',
        lastMeasure: i.last_measure_date || '-',
      }));

      setInspectionsData(mapped);
    } catch (error) {
      console.error('Error fetching inspections:', error);
      toast.error('Failed to load inspections');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch inspections on mount
  useEffect(() => {
    fetchInspections();
  }, []);

  // Auto-filter when cars, feeders, or inspections selection changes
  useEffect(() => {
    fetchInspections();
  }, [cars, feeders, inspections]);

  const filteredData = inspectionsData.filter((record) =>
    Object.values(record).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleClear = () => {
    const today = new Date();
    setDateRange({ from: today, to: today });
    setInspections("");
    setCars("");
    setFeeders("");
    setSearchTerm("");
  };

  const handleAddInspection = async () => {
    if (!formData.name || !formData.feeder || !formData.car) return;

    try {
      const { error } = await supabase.from('inspections').insert({
        name: formData.name,
        feeder_id: formData.feeder,
        car_id: formData.car,
        status: 'Pendiente',
      });

      if (error) throw error;

      toast.success('Inspection created successfully');
      fetchInspections();
      setIsAddModalOpen(false);
      setFormData({ name: "", feeder: "", car: "" });
    } catch (error) {
      console.error('Error creating inspection:', error);
      toast.error('Failed to create inspection');
    }
  };

  const handleDeleteInspection = async (id: string) => {
    try {
      const { error } = await supabase.from('inspections').delete().eq('id_unico', id);

      if (error) throw error;

      toast.success('Inspection deleted successfully');
      fetchInspections();
    } catch (error) {
      console.error('Error deleting inspection:', error);
      toast.error('Failed to delete inspection');
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setModalMode('add');
    setEditingId(null);
    setFormData({ name: "", feeder: "", car: "" });
  };

  const handleEditInspection = (id: string) => {
    const inspection = inspectionsData.find((i) => i.id === id);
    if (!inspection) return;

    setFormData({
      name: inspection.name,
      feeder: inspection.feederId || "",
      car: inspection.carId || "",
    });
    setEditingId(id);
    setModalMode('edit');
    setIsAddModalOpen(true);
  };

  const handleUpdateInspection = async () => {
    if (!formData.name || !formData.feeder || !formData.car || !editingId) return;

    try {
      const { error } = await supabase
        .from('inspections')
        .update({
          name: formData.name,
          feeder_id: formData.feeder,
          car_id: formData.car,
        })
        .eq('id_unico', editingId);

      if (error) throw error;

      toast.success('Inspection updated successfully');
      fetchInspections();
      handleCloseModal();
    } catch (error) {
      console.error('Error updating inspection:', error);
      toast.error('Failed to update inspection');
    }
  };

  const handleModalSubmit = () => {
    if (modalMode === 'edit') {
      handleUpdateInspection();
    } else {
      handleAddInspection();
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('inspections')
      .update({ status: newStatus })
      .eq('id_unico', id);

    if (error) {
      throw error;
    }

    // Refresh the data
    fetchInspections();
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
            {/* Filter Section */}
            <DistributionFilters
              dateRange={dateRange}
              setDateRange={setDateRange}
              inspections={inspections}
              setInspections={setInspections}
              cars={cars}
              setCars={setCars}
              feeders={feeders}
              setFeeders={setFeeders}
              onClear={handleClear}
              onAdd={() => setIsAddModalOpen(true)}
            />

            {/* Table Section */}
            <DistributionTable
              data={filteredData}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onDeleteInspection={handleDeleteInspection}
              onEditInspection={handleEditInspection}
              onStatusChange={handleStatusChange}
              isLoading={isLoading}
            />
          </div>

          <footer className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div>{t('copyright')}</div>
            <div>{t('version')}</div>
          </footer>
        </div>
      </main>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Add/Edit Distribution Inspection Modal */}
      <AddInspectionModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        formData={formData}
        onFormChange={setFormData}
        onAdd={handleModalSubmit}
        mode={modalMode}
      />
    </div>
  );
}
