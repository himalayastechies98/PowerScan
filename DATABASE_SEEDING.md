# Database Seeding Guide

This guide explains how to use the database seeding scripts for the PowerScan project.

## Available Commands

### Setup Database
```bash
npm run db:setup
```
Creates all database tables and sets up the schema. Run this first before seeding.

### Seed All Data (Recommended)
```bash
npm run db:seed:all
```
**This is the ONE command you need!** It seeds all three tables at once:
- ✅ Client profiles (15 users: 13 clients + 2 admins)
- ✅ Cars (20 inspection vehicles)
- ✅ Elements (20 equipment/components)

### Seed Individual Tables
If you only want to seed specific tables:

```bash
# Seed only client profiles
npm run db:seed:clients

# Seed only cars
npm run db:seed:cars

# Seed only elements
npm run db:seed:elements
```

### Remove All Seeded Data
```bash
npm run db:unseed
```
Removes all seeded data from the database (clients, cars, and elements).

## Quick Start for New Developers

When you receive this project, just run these two commands:

1. **Setup the database schema:**
   ```bash
   npm run db:setup
   ```

2. **Seed all demo data:**
   ```bash
   npm run db:seed:all
   ```

That's it! Your database is now fully populated with demo data.

## What Gets Seeded?

### Client Profiles (15 users) 🔐
- 13 regular clients
- 2 admin users
- **Real authentication users in auth.users** (can login!)
- All users have the password: **`client123`**
- Each with email, full name, and role
- ✅ Email auto-confirmed and ready to login

See `DEMO_CREDENTIALS.md` for the complete list of login credentials.

### Cars (20 vehicles)
- Various inspection vehicle models
- Unique IDs (CAR-001, CAR-002, etc.)
- License plates, years, and models

### Elements (20 components)
- Electrical equipment and components
- Capacitors, transformers, regulators, etc.
- Each with name, tag, and index

## Environment Setup

Make sure you have a `.env.local` file with the following variables:

```env
# Database Connection (for direct SQL operations)
DATABASE_URL=postgresql://postgres.xxxx:password@aws-0-region.pooler.supabase.com:6543/postgres

# Supabase Configuration (for authentication)
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Where to find these:**
- `DATABASE_URL`: Supabase → Project Settings → Database → Connection string → URI
- `VITE_SUPABASE_URL`: Supabase → Project Settings → API → Project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase → Project Settings → API → service_role key (secret!)

⚠️ **Important**: The `SUPABASE_SERVICE_ROLE_KEY` is required to create authentication users. Keep it secret!

## Workflow

```
┌─────────────────────────────────────────┐
│  1. npm run db:setup                    │
│     (Create tables)                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  2. npm run db:seed:all                 │
│     (Populate all tables with demo data)│
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  3. Start developing!                   │
│     npm run dev                          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Optional: npm run db:unseed            │
│     (Clear all data if needed)          │
└─────────────────────────────────────────┘
```

## Notes

- The `seed-all` script runs each seeder sequentially
- Beautiful console output shows progress for each step
- All scripts handle errors gracefully
- Safe to re-run (won't create duplicates for most data)
