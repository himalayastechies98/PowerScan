import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface DashboardHeaderProps {
  breadcrumbs?: Array<{ label: string; path?: string }>;
  title?: string;
  subtitle?: string;
}

export function DashboardHeader({ breadcrumbs: customBreadcrumbs, title: customTitle, subtitle: customSubtitle }: DashboardHeaderProps = {}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const getDefaultBreadcrumbs = () => {
    const pathname = location.pathname;
    const breadcrumbs = [{ label: t('home'), path: '/' }];

    if (pathname === '/') return breadcrumbs;

    if (pathname.startsWith('/distribution')) {
      breadcrumbs.push({ label: t('inspections'), path: '/distribution' });
      breadcrumbs.push({ label: t('distribution'), path: '/distribution' });
      if (pathname === '/upload') {
        breadcrumbs.push({ label: t('upload'), path: '/upload' });
      }
    } else if (pathname === '/upload') {
      breadcrumbs.push({ label: t('inspections'), path: '/distribution' });
      breadcrumbs.push({ label: t('distribution'), path: '/distribution' });
      breadcrumbs.push({ label: t('upload'), path: '/upload' });
    } else if (pathname.startsWith('/system/')) {
      breadcrumbs.push({ label: t('system'), path: '/system/elements' });
      const page = pathname.split('/')[2];
      breadcrumbs.push({ label: t(page), path: pathname });
    } else if (pathname === '/feeders') {
      breadcrumbs.push({ label: t('system'), path: '/system/elements' });
      breadcrumbs.push({ label: t('feeders'), path: '/feeders' });
    } else if (pathname === '/clients') {
      breadcrumbs.push({ label: t('clients'), path: '/clients' });
    } else if (pathname === '/inspections') {
      breadcrumbs.push({ label: t('inspections'), path: '/inspections' });
    } else if (pathname === '/profile') {
      breadcrumbs.push({ label: t('profile'), path: '/profile' });
    } else if (pathname.includes('/measure-details') || pathname.includes('/measure-image')) {
      breadcrumbs.push({ label: t('inspections'), path: '/distribution' });
      breadcrumbs.push({ label: t('distribution'), path: '/distribution' });
    }

    return breadcrumbs;
  };

  const breadcrumbs = customBreadcrumbs || getDefaultBreadcrumbs();

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="w-4 h-4" />}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-foreground font-medium">{crumb.label}</span>
            ) : (
              <button
                onClick={() => navigate(crumb.path)}
                className="hover:text-foreground transition-colors cursor-pointer"
              >
                {crumb.label}
              </button>
            )}
          </div>
        ))}
      </div>
      <h1 className="text-3xl font-bold mb-2">{customTitle || t('dashboardTitle')}</h1>
      <p className="text-muted-foreground">
        {customSubtitle || t('dashboardSubtitle')}
      </p>
    </div>
  );
}
