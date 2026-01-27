import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const { Client } = pg;

async function setupInspections() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('\x1b[31m%s\x1b[0m', 'Error: DATABASE_URL is missing in .env.local');
        console.log('Please add your database connection string to .env.local');
        process.exit(1);
    }

    const client = new Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false,
        },
    });

    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected successfully.');

        // SQL for inspections table
        const sql = `
      -- Create inspections table
      create table if not exists inspections (
        id_unico text primary key default gen_random_uuid()::text,
        name text not null,
        ea text,
        feeder_id text references feeders(id_unico) on delete set null,
        car_id text references cars(id_unico) on delete set null,
        status text default 'Pendiente',
        measures_red integer default 0,
        measures_yellow integer default 0,
        inspection_type text,
        last_measure_date date,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null,
        updated_at timestamp with time zone default timezone('utc'::text, now()) not null
      );

      -- Enable RLS
      alter table inspections enable row level security;

      -- Drop existing policies if they exist
      drop policy if exists "Authenticated users can view inspections" on inspections;
      drop policy if exists "Admins can insert inspections" on inspections;
      drop policy if exists "Admins can update inspections" on inspections;
      drop policy if exists "Admins can delete inspections" on inspections;

      -- Create policies for inspections
      create policy "Authenticated users can view inspections" on inspections
        for select using (auth.role() = 'authenticated');

      create policy "Admins can insert inspections" on inspections
        for insert with check (auth.role() = 'authenticated');

      create policy "Admins can update inspections" on inspections
        for update using (auth.role() = 'authenticated');

      create policy "Admins can delete inspections" on inspections
        for delete using (auth.role() = 'authenticated');

      -- Create trigger function if it doesn't exist
      create or replace function update_updated_at_column()
      returns trigger as $$
      begin
        new.updated_at = now();
        return new;
      end;
      $$ language 'plpgsql';

      -- Drop trigger if exists and recreate
      drop trigger if exists update_inspections_updated_at on inspections;
      create trigger update_inspections_updated_at
        before update on inspections
        for each row
        execute function update_updated_at_column();
    `;

        console.log('Creating inspections table...');
        await client.query(sql);
        console.log('\x1b[32m%s\x1b[0m', 'Inspections table setup completed successfully! 🎉');
        console.log('\nNext step: Run "node scripts/seed-inspections.js" to add sample data');

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', 'Error setting up inspections table:', err);
    } finally {
        await client.end();
    }
}

setupInspections();
