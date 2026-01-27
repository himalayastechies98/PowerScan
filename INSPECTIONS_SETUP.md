# Supabase Inspections Table Setup

This guide explains how to set up the inspections table in your Supabase database.

## Why the table isn't created automatically

The migration files in `supabase/migrations/` need to be run **manually** in the Supabase SQL Editor. Unlike some ORMs, these files don't auto-execute when you save them.

## Step-by-Step Instructions

### 1. Create the Inspections Table

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **+ New Query**
4. Copy the contents of `supabase/migrations/20251201_create_inspections_table.sql`
5. Paste into the SQL Editor
6. Click **Run** or press `Ctrl+Enter`
7. Verify the table was created by going to **Table Editor** → You should see `inspections`

### 2. Add Seed Data (Optional)

1. Still in the **SQL Editor**, create another new query
2. Copy the contents of `supabase/migrations/20251201_seed_inspections.sql`
3. Paste and run the query
4. This will insert 8 sample inspection records using your existing feeders and cars

> **Note**: The seed data uses your first 2 feeders and first 2 cars from the database. Make sure you have at least 2 feeders and 2 cars created before running the seed data.

## Verification

After running the migrations, verify everything worked:

1. **Check Table Structure**:
   - Go to **Table Editor** → `inspections`
   - Verify columns exist: `id_unico`, `name`, `ea`, `feeder_id`, `car_id`, `status`, etc.

2. **Check Foreign Keys**:
   - The `feeder_id` should reference `feeders.id_unico`
   - The `car_id` should reference `cars.id_unico`

3. **Check RLS Policies**:
   - Go to **Authentication** → **Policies**
   - Verify policies exist for the `inspections` table

4. **Test in Application**:
   - Refresh your Distribution page
   - You should see the seed data (if you ran it)
   - Try creating a new inspection

## Troubleshooting

### "relation already exists" error
The table already exists. You can skip step 1.

### "insert or update on table violates foreign key constraint"
Make sure you have feeders and cars in your database before running the seed data.

### No data showing in Distribution page
- Check browser console for errors
- Verify RLS policies are configured correctly
- Make sure you're logged in as an admin user
