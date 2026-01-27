# PowerScan - React Vision Maker

A modern web application for managing inspections, clients, and system configurations.

## 🚀 Getting Started

### Prerequisites

- Node.js & npm installed
- A Supabase project

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <YOUR_GIT_URL>
    cd react-vision-maker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory and add your Supabase credentials:

    ```env
    VITE_SUPABASE_URL=https://your-project-id.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-key
    DATABASE_URL=postgresql://postgres.your-project:password@aws-0-region.pooler.supabase.com:6543/postgres
    ```

    *   **VITE_SUPABASE_URL**: Found in Supabase Dashboard -> Project Settings -> API.
    *   **VITE_SUPABASE_ANON_KEY**: Found in Supabase Dashboard -> Project Settings -> API.
The project uses Supabase Auth for user management.

-   **Admin User**: You can create an initial admin user via the Supabase Dashboard or by using the `register_admin.js` script (if available).
-   **Client Users**: Admins can create new client users directly from the "Clients" page in the application.

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Vite
-   **Styling**: Tailwind CSS, Shadcn UI
-   **State Management**: React Context (Auth), React Query
-   **Backend/Database**: Supabase (PostgreSQL, Auth)
-   **Icons**: Lucide React

## 📂 Project Structure

-   `src/pages`: Application pages (Dashboard, Clients, Distribution, etc.)
-   `src/components`: Reusable UI components
-   `src/contexts`: Global state contexts (AuthContext)
-   `src/lib`: Utility libraries (Supabase client)
-   `scripts`: Database setup and maintenance scripts

## 📜 Database Schema

The database schema is managed via `scripts/setup-db.js`. It includes:

-   `profiles` table: Extends Supabase Auth with user roles (`admin` or `client`) and full names.
-   **RLS Policies**: Ensures users can only access their own data (unless they are admins).
-   **Triggers**: Automatically creates a profile entry when a new user signs up.
