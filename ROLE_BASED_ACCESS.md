# 🔐 Role-Based Access Control

This document explains the role-based dashboard and routing system.

## User Roles

The application supports two roles:
- **Admin**: Full access to all features
- **Client**: Limited access to client-specific features

## Login Flow

### Admin User Login
When an admin logs in:
1. System fetches user profile from database
2. Detects `role: 'admin'`
3. **Redirects to**: `/` (Admin Dashboard)
4. Has access to all admin features

### Client User Login
When a client logs in:
1. System fetches user profile from database
2. Detects `role: 'client'`
3. **Redirects to**: `/inspections` (Client Dashboard)
4. Has limited access to client features only

## Route Access Control

### Admin-Only Routes (AdminRoute)
These pages are **only accessible to admins**. If a client tries to access, they're redirected to `/inspections`:

- `/` - Admin Dashboard
- `/distribution` - Distribution Network
- `/distribution/measures/:id` - Measure Details
- `/measure-image/:id` - Measure Image Details
- `/upload` - Upload Measures
- `/feeders` - Feeders Management
- `/clients` - Client Management
- `/system/elements` - Elements Configuration
- `/system/lamps` - Lamps Configuration
- `/system/cars` - Cars Management
- `/system/actions` - Actions Configuration
- `/system/methods` - Methods Configuration
- `/system/alarms` - Alarms Configuration

### Accessible to All Authenticated Users (ProtectedRoute)
These pages are accessible to **both admins and clients**:

- `/inspections` - Client/Inspection Dashboard
- `/profile` - User Profile

### Public Routes
- `/login` - Login page (public)

## How It Works

### 1. AuthContext
Located at `src/contexts/AuthContext.tsx`

- Fetches user profile from `profiles` table
- Extracts the `role` field
- Provides `isAdmin` and `isClient` booleans

```typescript
isAdmin: profile?.role === 'admin'
isClient: profile?.role === 'client'
```

### 2. ProtectedRoute Component
Located at `src/components/ProtectedRoute.tsx`

**ProtectedRoute**: Ensures user is authenticated
```typescript
if (!session) redirect to /login
```

**AdminRoute**: Ensures user is authenticated AND is an admin
```typescript
if (!session) redirect to /login
if (role !== 'admin') redirect to /inspections
```

### 3. App Routing
Located at `src/App.tsx`

Routes are wrapped with appropriate guards:
```typescript
// Admin only
<Route path="/" element={<AdminRoute><Index /></AdminRoute>} />

// All authenticated users
<Route path="/inspections" element={<ProtectedRoute><ClientInspections /></ProtectedRoute>} />
```

## Testing

### Test as Admin
```
Email: sarah.davis@example.com
Password: client123
Expected: Redirects to / (Admin Dashboard)
```

### Test as Client
```
Email: john.doe@example.com
Password: client123
Expected: Redirects to /inspections (Client Dashboard)
```

## Menu/Sidebar Considerations

Your sidebar/navigation menu should also respect roles:

```typescript
import { useAuth } from '@/contexts/AuthContext';

function Sidebar() {
  const { isAdmin, isClient } = useAuth();
  
  return (
    <>
      {isAdmin && (
        <>
          <MenuItem to="/" label="Dashboard" />
          <MenuItem to="/distribution" label="Distribution" />
          <MenuItem to="/clients" label="Clients" />
          {/* Other admin menus */}
        </>
      )}
      
      {/* Available to all */}
      <MenuItem to="/inspections" label="Inspections" />
      <MenuItem to="/profile" label="Profile" />
    </>
  );
}
```

## Security Notes

✅ **Database-Driven**: Roles are fetched from the `profiles` table in real-time
✅ **Route Protection**: AdminRoute component prevents unauthorized access
✅ **Automatic Redirects**: Users are sent to appropriate dashboards based on role
⚠️ **Remember**: Frontend routing is for UX only. Always validate permissions on the backend/database level using Row Level Security (RLS)

## Troubleshooting

**Issue**: User logs in but role is not detected
- **Solution**: Ensure `profiles` table has the user's record with correct `role` field

**Issue**: Client can access admin routes
- **Solution**: Ensure routes use `<AdminRoute>` wrapper instead of `<ProtectedRoute>`

**Issue**: Login redirects to wrong page
- **Solution**: Check `Login.tsx` useEffect for role-based navigation logic

## Future Enhancements

Consider adding:
- More granular permissions (beyond just admin/client)
- Permission-based access (e.g., `canEditCars`, `canViewReports`)
- Role management page for admins
- Audit logs for access attempts
