# ⚙️ Environment Variables Setup Guide

This guide explains all the environment variables needed for the PowerScan project.

## Required Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# ============================================
# DATABASE CONNECTION
# ============================================
# Direct PostgreSQL connection for seeding scripts
DATABASE_URL=postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres

# ============================================
# SUPABASE CONFIGURATION
# ============================================
# Your Supabase project URL
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co

# Supabase anonymous/public key (safe for client-side)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase service role key (KEEP SECRET! Server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## How to Find Each Variable

### 1. DATABASE_URL
**Location**: Supabase Dashboard
```
Project Settings → Database → Connection string → URI
```
- Select "Transaction" mode
- Copy the connection string
- Replace `[YOUR-PASSWORD]` with your database password

### 2. VITE_SUPABASE_URL
**Location**: Supabase Dashboard
```
Project Settings → API → Project URL
```
- Copy the URL (looks like `https://xxxxx.supabase.co`)

### 3. VITE_SUPABASE_ANON_KEY
**Location**: Supabase Dashboard
```
Project Settings → API → Project API keys → anon/public
```
- This key is safe to use in client-side code
- Copy the `anon` key

### 4. SUPABASE_SERVICE_ROLE_KEY
**Location**: Supabase Dashboard
```
Project Settings → API → Project API keys → service_role
```
- ⚠️ **KEEP THIS SECRET!** Never commit to git or expose to client
- Required for creating authentication users in seed scripts
- Copy the `service_role` key

## Example .env.local File

```env
# Database
DATABASE_URL=postgresql://postgres.abcdefghijklmnop:MySecretP@ssw0rd!@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Supabase
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMzI0NzM2NSwiZXhwIjoxOTM4ODIzMzY1fQ.abc123xyz
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjIzMjQ3MzY1LCJleHAiOjE5Mzg4MjMzNjV9.xyz789abc
```

## Security Notes

🔒 **Never commit `.env.local` to git!**
- Already included in `.gitignore`
- Contains sensitive credentials

⚠️ **Service Role Key**:
- Has admin privileges
- Can bypass Row Level Security (RLS)
- Only use in trusted server-side scripts
- Never expose to client-side code

✅ **Anon Key**:
- Safe for client-side use
- Respects Row Level Security (RLS)
- Used in frontend application

## Verification

After setting up your `.env.local`, verify it works:

```bash
# Test database connection
npm run db:setup

# Test Supabase connection and create users
npm run db:seed:clients
```

If you get errors about missing variables, check that:
1. File is named exactly `.env.local`
2. File is in the project root directory
3. No extra spaces around `=` signs
4. All values are copied completely (JWT tokens are very long!)

## Which Scripts Need Which Variables?

| Script | DATABASE_URL | VITE_SUPABASE_URL | SUPABASE_SERVICE_ROLE_KEY |
|--------|--------------|-------------------|---------------------------|
| `db:setup` | ✅ Required | ❌ Not needed | ❌ Not needed |
| `db:seed:cars` | ✅ Required | ❌ Not needed | ❌ Not needed |
| `db:seed:elements` | ✅ Required | ❌ Not needed | ❌ Not needed |
| `db:seed:clients` | ❌ Not needed | ✅ Required | ✅ Required |
| `db:seed:all` | ✅ Required | ✅ Required | ✅ Required |
| `db:unseed` | ✅ Required | ✅ Required | ✅ Required |
| Frontend app | ❌ Not needed | ✅ Required | ❌ Not needed |

---

Need help? Check the documentation:
- `DATABASE_SEEDING.md` - How to seed the database
- `DEMO_CREDENTIALS.md` - Login credentials for seeded users
