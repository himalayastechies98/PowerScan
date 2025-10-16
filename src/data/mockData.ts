export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'client';
}

export interface Inspection {
  id: string;
  client_id: string;
  title: string;
  description: string;
  location: string;
  inspection_type: string;
  status: string;
  inspection_date: string;
  file_url?: string;
  created_at: string;
  updated_at: string;
}

export const mockUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@powerscan.com',
    full_name: 'Admin User',
    role: 'admin'
  },
  {
    id: 'client-1',
    email: 'client1@example.com',
    full_name: 'John Doe',
    role: 'client'
  },
  {
    id: 'client-2',
    email: 'client2@example.com',
    full_name: 'Jane Smith',
    role: 'client'
  }
];

export const mockInspections: Inspection[] = [
  {
    id: 'insp-1',
    client_id: 'client-1',
    title: 'Solar Panel Inspection - North Grid',
    description: 'Routine thermal inspection of solar panels',
    location: 'North Facility, Grid A',
    inspection_type: 'Thermal',
    status: 'completed',
    inspection_date: '2025-09-15T10:00:00Z',
    file_url: 'https://example.com/file1.pdf',
    created_at: '2025-09-10T08:00:00Z',
    updated_at: '2025-09-15T14:00:00Z'
  },
  {
    id: 'insp-2',
    client_id: 'client-1',
    title: 'Wind Turbine Blade Analysis',
    description: 'Structural integrity check using drone imagery',
    location: 'East Wind Farm, Turbine 12',
    inspection_type: 'Visual',
    status: 'pending',
    inspection_date: '2025-10-08T09:00:00Z',
    created_at: '2025-10-01T12:00:00Z',
    updated_at: '2025-10-01T12:00:00Z'
  },
  {
    id: 'insp-3',
    client_id: 'client-2',
    title: 'Transmission Line Survey',
    description: 'High voltage line inspection',
    location: 'South Region, Line 45',
    inspection_type: 'Thermal',
    status: 'in-progress',
    inspection_date: '2025-10-05T07:00:00Z',
    created_at: '2025-09-28T10:00:00Z',
    updated_at: '2025-10-05T08:00:00Z'
  },
  {
    id: 'insp-4',
    client_id: 'client-2',
    title: 'Substation Equipment Check',
    description: 'Annual maintenance inspection',
    location: 'Central Substation',
    inspection_type: 'Visual',
    status: 'completed',
    inspection_date: '2025-09-20T11:00:00Z',
    file_url: 'https://example.com/file4.pdf',
    created_at: '2025-09-15T09:00:00Z',
    updated_at: '2025-09-20T16:00:00Z'
  }
];

export const credentials = {
  admin: { email: 'admin@powerscan.com', password: 'admin123' },
  client1: { email: 'client1@example.com', password: 'client123' },
  client2: { email: 'client2@example.com', password: 'client123' }
};
