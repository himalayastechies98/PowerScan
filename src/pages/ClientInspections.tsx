import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import { mockInspections } from '@/data/mockData';

interface Inspection {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  inspection_type: string | null;
  status: string;
  inspection_date: string | null;
  created_at: string;
}

export default function ClientInspections() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newInspection, setNewInspection] = useState({
    title: '',
    description: '',
    location: '',
    inspectionType: '',
    inspectionDate: '',
  });

  useEffect(() => {
    if (user) {
      const userInspections = mockInspections.filter(i => i.client_id === user.id);
      setInspections(userInspections);
      setIsLoading(false);
    }
  }, [user]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUploading(true);

    setTimeout(() => {
      toast.success(t('uploadSuccess'));
      setIsDialogOpen(false);
      setNewInspection({
        title: '',
        description: '',
        location: '',
        inspectionType: '',
        inspectionDate: '',
      });
      setIsUploading(false);
    }, 500);
  };

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('myInspections')}</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                {t('uploadNew')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('uploadInspection')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{t('inspectionTitle')}</Label>
                  <Input
                    id="title"
                    value={newInspection.title}
                    onChange={(e) => setNewInspection({ ...newInspection, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t('inspectionDescription')}</Label>
                  <Textarea
                    id="description"
                    value={newInspection.description}
                    onChange={(e) => setNewInspection({ ...newInspection, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">{t('location')}</Label>
                    <Input
                      id="location"
                      value={newInspection.location}
                      onChange={(e) => setNewInspection({ ...newInspection, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">{t('inspectionType')}</Label>
                    <Input
                      id="type"
                      value={newInspection.inspectionType}
                      onChange={(e) => setNewInspection({ ...newInspection, inspectionType: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">{t('inspectionDate')}</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newInspection.inspectionDate}
                    onChange={(e) => setNewInspection({ ...newInspection, inspectionDate: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isUploading}>
                  {isUploading ? t('loading') : t('uploadInspection')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">{t('loading')}</div>
          ) : inspections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No inspections yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('inspectionTitle')}</TableHead>
                  <TableHead>{t('location')}</TableHead>
                  <TableHead>{t('inspectionType')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspections.map((inspection) => (
                  <TableRow key={inspection.id}>
                    <TableCell className="font-medium">{inspection.title}</TableCell>
                    <TableCell>{inspection.location || '-'}</TableCell>
                    <TableCell>{inspection.inspection_type || '-'}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                        {inspection.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {inspection.inspection_date
                        ? new Date(inspection.inspection_date).toLocaleDateString()
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
