import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const { Client } = pg;

async function setupFeeders() {
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

        // SQL for feeders table
        const sql = `
      -- Create feeders table
      create table if not exists feeders (
        id_unico text primary key,
        name text not null,
        ea text,
        region text,
        kml_file_path text,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null,
        updated_at timestamp with time zone default timezone('utc'::text, now()) not null
      );

      -- Enable RLS
      alter table feeders enable row level security;

      -- Drop existing policies if they exist
      drop policy if exists "Authenticated users can view feeders" on feeders;
      drop policy if exists "Admins can insert feeders" on feeders;
      drop policy if exists "Admins can update feeders" on feeders;
      drop policy if exists "Admins can delete feeders" on feeders;

      -- Create policies for feeders
      create policy "Authenticated users can view feeders" on feeders
        for select using (auth.role() = 'authenticated');

      create policy "Admins can insert feeders" on feeders
        for insert with check (auth.role() = 'authenticated');

      create policy "Admins can update feeders" on feeders
        for update using (auth.role() = 'authenticated');

      create policy "Admins can delete feeders" on feeders
        for delete using (auth.role() = 'authenticated');
    `;

        console.log('Creating feeders table...');
        await client.query(sql);
        console.log('\x1b[32m%s\x1b[0m', 'Feeders table setup completed successfully! 🎉');
        console.log('\nNext steps:');
        console.log('1. Create storage bucket "feeder-kml-files" in Supabase Dashboard');
        console.log('2. Or run: node scripts/setup-storage.js (if available)');

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', 'Error setting up feeders table:', err);
    } finally {
        await client.end();
    }
}

setupFeeders();
