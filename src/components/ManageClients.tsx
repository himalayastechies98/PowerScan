import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { mockUsers } from '@/data/mockData';

interface Client {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export function ManageClients() {
  const { t } = useTranslation();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    email: '',
    fullName: '',
    password: '',
  });

  useEffect(() => {
    const clientUsers = mockUsers
      .filter(u => u.role === 'client')
      .map(u => ({
        ...u,
        created_at: new Date().toISOString()
      }));
    setClients(clientUsers);
    setIsLoading(false);
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    setTimeout(() => {
      toast.success(t('clientCreatedMock'));
      setIsDialogOpen(false);
      setNewClient({ email: '', fullName: '', password: '' });
      setIsCreating(false);
    }, 500);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('manageClients')}</CardTitle>
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
                <Input
                  id="clientPassword"
                  type="password"
                  value={newClient.password}
                  onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? t('loading') : t('create')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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
                <TableHead>{t('createdAt')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.full_name || '-'}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{new Date(client.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
