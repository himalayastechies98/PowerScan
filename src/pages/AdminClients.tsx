import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProfileModal } from '@/components/ProfileModal';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

interface Client {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export default function AdminClients() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newClient, setNewClient] = useState({
    email: '',
    fullName: '',
    password: '',
  });

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      // Only show toast for actual errors, not just empty lists
      if (error.code === '42P01') {
        toast.error("Database table 'profiles' not found. Please run 'npm run db:setup'");
      } else {
        toast.error('Failed to load clients');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // Create a temporary client to sign up the new user without logging out the admin
      const tempSupabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false, // Don't save session to local storage
          },
        }
      );

      const { data, error } = await tempSupabase.auth.signUp({
        email: newClient.email,
        password: newClient.password,
        options: {
          data: {
            full_name: newClient.fullName,
            role: 'client',
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Client created successfully');
        setIsDialogOpen(false);
        setNewClient({ email: '', fullName: '', password: '' });
        // Wait a moment for trigger to run then refresh
        setTimeout(fetchClients, 1000);
      }
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast.error(error.message || 'Failed to create client');
    } finally {
      setIsCreating(false);
    }
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('manageClients')}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={fetchClients} title="Refresh List">
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        {t('createClient')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('createClient')}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateClient} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="clientEmail">{t('clientEmail')}</Label>
                          <Input
                            id="clientEmail"
                            type="email"
                            value={newClient.email}
                            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="clientName">{t('clientName')}</Label>
                          <Input
                            id="clientName"
                            type="text"
                            value={newClient.fullName}
                            onChange={(e) => setNewClient({ ...newClient, fullName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="clientPassword">{t('temporaryPassword')}</Label>
                          <div className="relative">
                            <Input
                              id="clientPassword"
                              type={showPassword ? "text" : "password"}
                              value={newClient.password}
                              onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isCreating}>
                          {isCreating ? t('loading') : t('create')}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">{t('loading')}</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('clientName')}</TableHead>
                        <TableHead>{t('email')}</TableHead>
                        <TableHead>Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                            No clients found
                          </TableCell>
                        </TableRow>
                      ) : (
                        clients.map((client) => (
                          <TableRow key={client.id}>
                            <TableCell>{client.full_name || '-'}</TableCell>
                            <TableCell>{client.email}</TableCell>
                            <TableCell>{new Date(client.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
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
