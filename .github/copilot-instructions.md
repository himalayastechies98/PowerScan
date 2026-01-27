# React Vision Maker - Copilot Instructions

## Project Overview

**React Vision Maker** is a React + TypeScript + Vite dashboard application for power distribution inspection management. It features role-based access control (admin/client), multi-language support (EN/ES/PT), and dark/light theme switching. Developed with Lovable AI and backed by Supabase.

## Architecture & Tech Stack

### Core Stack
- **Framework**: React 18+ (with React Router for navigation)
- **Language**: TypeScript with strict path aliases (`@/` → `src/`)
- **Build Tool**: Vite with SWC transpilation
- **UI Framework**: shadcn/ui components (Radix UI primitives + Tailwind CSS)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **i18n**: react-i18next (3 languages: EN, ES, PT)
- **Styling**: Tailwind CSS + Headless UI + Lucide Icons

### Project Structure
```
src/
├── pages/           # Route-level components (page = route)
├── components/
│   ├── dashboard/   # Reusable dashboard sections (Sidebar, TopBar, etc.)
│   ├── ui/          # shadcn/ui components (auto-generated, do not edit)
│   ├── ProtectedRoute.tsx  # Role-based route wrapper
│   └── [Feature]Modal.tsx   # Modal dialogs
├── contexts/        # React Context (AuthContext for user state)
├── integrations/
│   └── supabase/    # Auto-generated Supabase client & types
├── hooks/           # Custom React hooks
├── lib/             # Utilities (cn() for Tailwind merging)
└── data/            # Mock data (development fallback)
```

## Key Architectural Patterns

### 1. Authentication & Authorization
**Pattern**: Context-based role management with localStorage persistence

```tsx
// Use the custom hook in any component
const { user, isAdmin, isClient, signIn, signOut } = useAuth();

// User roles: 'admin' | 'client' (stored in auth context)
// ProtectedRoute enforces requireAdmin/requireClient flags
```

**AuthContext** (`src/contexts/AuthContext.tsx`):
- Manages user state (email, role, full_name)
- Provides `signIn()`, `signOut()`, loading state
- Persists user in localStorage on login
- Auto-restores session on app reload

**ProtectedRoute** (`src/components/ProtectedRoute.tsx`):
- Wraps sensitive routes; redirects to `/login` if not authenticated
- Optional `requireAdmin` / `requireClient` flags for role-specific pages
- Shows spinner while auth state loads

### 2. i18n (Internationalization)
**Pattern**: react-i18next with language switcher and localStorage persistence

```tsx
const { t } = useTranslation();
// Use: t('dashboard'), t('inspections'), etc.
// Languages: en, es, pt (LanguageSwitcher controls)
```

**Key Files**:
- `src/components/LanguageSwitcher.tsx` — Dropdown to switch languages
- Translation strings referenced in components via `t()` key
- Language preference persists in localStorage via i18n

### 3. Role-Based UI & Navigation
**Admins vs Clients** see different sidebar menus:

```tsx
// In Sidebar.tsx, getMenuSections() returns different items based on:
if (isAdmin) {
  // Show: Dashboard, Inspections, System (elements, lamps, cars, etc.)
} else if (isClient) {
  // Show: Dashboard, Inspections, Profile
}
```

**Current Routes**:
- `/` — Dashboard (home, protected)
- `/distribution` — Distribution management (protected)
- `/upload` — Upload measures (protected)
- `/system/*` — System admin pages (admin only)
- `/clients`, `/inspections`, `/feeders` — Management pages
- `/login` — Login page (public)

### 4. Component Composition
**Pattern**: Atomic UI components from shadcn/ui + composed dashboard sections

**shadcn/ui Usage** (`src/components/ui/`):
- Auto-generated from Radix UI + Tailwind CSS
- ⚠️ **Do NOT manually edit ui/* files** — regenerate via `npx shadcn-ui@latest add [component]`
- Examples: Button, Card, Input, Dialog, Table, Select, Popover, Calendar

**Dashboard Components** (`src/components/dashboard/`):
- `Sidebar.tsx` — Left navigation with role-based menu items
- `TopBar.tsx` — Header with search, notifications, language/theme switchers
- `DashboardHeader.tsx`, `FilterSection.tsx`, `StatsCards.tsx`, etc.
- Compose pages by combining these sections

### 5. Supabase Integration
**Pattern**: Type-safe client with auto-generated schema types

```tsx
// Import from auto-generated client (do not edit)
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Query example (currently mock data used; Supabase ready)
const { data, error } = await supabase
  .from('inspections')
  .select('*')
  .eq('client_id', userId);
```

**Auto-Generated Files** (do not edit):
- `src/integrations/supabase/client.ts` — Supabase client instance
- `src/integrations/supabase/types.ts` — TypeScript schema (Tables, Rows, Insert, Update)

**Current Status**: App uses mock data from `src/data/mockData.ts` (credentials, users, inspections). Ready to swap with Supabase queries.

### 6. State Management
**Pattern**: React hooks (useState, useContext) + localStorage

- **Global auth state** → AuthContext
- **Page-level state** → useState in components
- **Persistence** → localStorage for auth session, language, theme
- **Theme** → next-themes provider (auto-generated, dark/light modes)

### 7. Styling & Tailwind
**Pattern**: Utility-first Tailwind + `cn()` helper for conditional classes

```tsx
// Use cn() for safe class merging (handles conflicting utilities)
import { cn } from "@/lib/utils";

<div className={cn(
  "p-4 rounded-lg",
  isActive ? "bg-primary text-white" : "bg-gray-100"
)}>
```

**Theme Support**: Radix UI colors mapped to CSS variables; dark mode via `next-themes`.

## Developer Workflows

### Running Locally
```bash
# Install dependencies
npm i  # or bun install

# Start dev server (Vite with hot reload)
npm run dev
# Open http://localhost:8080

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Adding a New Page
1. Create `src/pages/[FeatureName].tsx`
2. Export default component with typical page structure:
   ```tsx
   import { Sidebar } from "@/components/dashboard/Sidebar";
   import { TopBar } from "@/components/dashboard/TopBar";
   import { ProtectedRoute } from "@/components/ProtectedRoute";
   
   export default function FeatureName() {
     const { t } = useTranslation();
     const [sidebarOpen, setSidebarOpen] = useState(false);
     // ... component logic
     return (
       <div className="flex min-h-screen w-full">
         <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
         <main className="flex-1 lg:ml-60">
           <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
           {/* Page content */}
         </main>
       </div>
     );
   }
   ```
3. Add route in `src/App.tsx`:
   ```tsx
   <Route path="/feature-name" element={<ProtectedRoute><FeatureName /></ProtectedRoute>} />
   ```
4. Add sidebar menu item in `src/components/dashboard/Sidebar.tsx` (in `getMenuSections()`)

### Adding a New shadcn/ui Component
```bash
# Install component from registry
npx shadcn-ui@latest add button  # (or any component name)

# Component auto-generated in src/components/ui/
# Import and use in your pages/components
import { Button } from "@/components/ui/button";
```

### Adding a New Translation String
1. Add key to translation files (typically maintained in Supabase or external i18n backend)
2. Reference in component: `const { t } = useTranslation(); t('newKey')`
3. Language files support EN, ES, PT (configured in LanguageSwitcher)

### Switching to Supabase Data (From Mock Data)
1. Replace mock data imports in pages with Supabase queries:
   ```tsx
   // Before: import { mockInspections } from '@/data/mockData';
   // After:
   const { data: inspections } = await supabase
     .from('inspections')
     .select('*')
     .eq('client_id', user.id);
   ```
2. Use auto-generated types from `@/integrations/supabase/types`:
   ```tsx
   import type { Database } from "@/integrations/supabase/types";
   type Inspection = Database['public']['Tables']['inspections']['Row'];
   ```

## Common Patterns & Code Examples

### Conditional Rendering (Role-Based)
```tsx
const { isAdmin, isClient } = useAuth();

return isAdmin ? <AdminDashboard /> : <ClientDashboard />;
```

### Loading State
```tsx
const { loading, user } = useAuth();

if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
```

### Toast Notifications (Sonner)
```tsx
import { toast } from 'sonner';

toast.success('Action completed!');
toast.error('Something went wrong');
toast.loading('Loading...');
```

### Using Dropdowns (Radix UI)
```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost">Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={() => handleAction()}>Action</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Date Picking (Calendar + Popover)
```tsx
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

<Popover>
  <PopoverTrigger asChild>
    <Button>{format(date, "MM/dd/yyyy")}</Button>
  </PopoverTrigger>
  <PopoverContent>
    <Calendar mode="single" selected={date} onSelect={setDate} />
  </PopoverContent>
</Popover>
```

## Critical Conventions

### TypeScript
- ✅ **Use path aliases**: `@/components`, `@/lib`, `@/data` (configured in tsconfig.json)
- ✅ **Type imports**: `import type { User } from '@/data/mockData'`
- ✅ **Strict null checks disabled** (see tsconfig.json: `"strictNullChecks": false`)
- ❌ **Avoid `any`**: Use explicit types or `unknown` with type guards

### Components
- ✅ **Export default**: Pages as default; components as named exports
- ✅ **Props interface**: Define props type above component (`interface ComponentProps { ... }`)
- ✅ **Use useTranslation()**: All user-facing strings via `t('key')`
- ❌ **Hardcoded strings**: Never hardcode UI text (breaks i18n)

### Styling
- ✅ **Tailwind first**: Use Tailwind utilities, not inline styles
- ✅ **Use cn() for merging**: `cn('base-class', condition ? 'active-class' : '')`
- ✅ **Dark mode**: Theme variables handle dark/light automatically
- ❌ **Edit ui/* directly**: Regenerate via shadcn-ui CLI

### State & Context
- ✅ **UseAuth() for global auth**: Don't prop-drill user state
- ✅ **localStorage for persistence**: Theme, language, auth session
- ✅ **useTranslation() in every component** that renders text
- ❌ **Lift state too high**: Keep page-level state in components

## Key Files to Review

| File | Purpose |
|------|---------|
| `src/App.tsx` | Routes, providers (Auth, Theme, i18n, QueryClient) |
| `src/contexts/AuthContext.tsx` | User state, signIn/signOut, role checks |
| `src/components/ProtectedRoute.tsx` | Route guard with role enforcement |
| `src/components/dashboard/Sidebar.tsx` | Navigation with role-based menu logic |
| `src/pages/Login.tsx` | Auth entry point; mock credential validation |
| `src/integrations/supabase/client.ts` | Supabase client (read-only, auto-generated) |
| `src/data/mockData.ts` | Mock users, inspections, credentials |
| `src/lib/utils.ts` | Utility functions (cn() for Tailwind) |
| `tsconfig.json` | Path aliases, compiler settings |
| `vite.config.ts` | Build config, port (8080), plugin setup |

## Common Pitfalls

- ❌ **Editing ui/* components**: These are auto-generated; changes will be lost. Use `npx shadcn-ui@latest add [component]` to regenerate.
- ❌ **Hardcoding strings**: Use `t('key')` instead; breaks multi-language support.
- ❌ **Fetching without loading state**: Always handle `loading` in useAuth() or add loading UI.
- ❌ **Forgetting @/ alias**: Use `@/components/...` not `../../components/...`
- ❌ **Prop drilling auth state**: Use `useAuth()` hook instead of passing user through props.
- ❌ **Not wrapping protected routes**: Sensitive pages must use `<ProtectedRoute><Page /></ProtectedRoute>`.
- ❌ **Theme selector selects inline styles**: Use Tailwind utilities or theme variables, not hardcoded colors.

## Supabase Types Reference

Auto-generated from database schema in `src/integrations/supabase/types.ts`:

```typescript
// Access table types:
type InspectionRow = Database['public']['Tables']['inspections']['Row'];
type InspectionInsert = Database['public']['Tables']['inspections']['Insert'];
type InspectionUpdate = Database['public']['Tables']['inspections']['Update'];

// Access enum types:
type AppRole = Database['public']['Enums']['app_role']; // 'admin' | 'client'
```

## Lovable AI Integration

This project is synced with Lovable (AI-powered design platform). When using Lovable:
- Pushed changes will appear in the repo automatically
- Pulled repo changes appear in Lovable UI
- Component tagger plugin active in dev mode (`componentTagger()` in vite.config.ts)

---

*Last updated: November 20, 2025 | Project: React Vision Maker (PowerScan)*
