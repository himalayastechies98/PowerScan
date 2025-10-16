import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Profile() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsLoading(true);

    setTimeout(() => {
      toast.success(t('profileUpdated'));
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('profileTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('fullName')}</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t('role')}</Label>
              <Input
                id="role"
                type="text"
                value={t(profile?.role || 'client')}
                disabled
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('loading') : t('updateProfile')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
