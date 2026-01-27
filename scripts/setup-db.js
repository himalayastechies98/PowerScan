import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '.env.local' });

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: DATABASE_URL is missing in .env.local');
    console.log('Please go to Supabase -> Project Settings -> Database -> Connection string -> URI');
    console.log('And add it to your .env.local file like this:');
    console.log('DATABASE_URL=postgresql://postgres.xxxx:password@aws-0-region.pooler.supabase.com:6543/postgres');
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

    // SQL Schema
    const sql = `
      -- Create a table for public profiles if it doesn't exist
      create table if not exists profiles (
        id uuid references auth.users on delete cascade not null primary key,
        email text unique not null,
        full_name text,
        role text default 'client' check (role in ('admin', 'client')),
        created_at timestamp with time zone default timezone('utc'::text, now()) not null
      );

      -- Enable RLS
      alter table profiles enable row level security;

      -- Create policies (drop existing ones first to avoid errors on re-run)
      drop policy if exists "Public profiles are viewable by everyone." on profiles;
      create policy "Public profiles are viewable by everyone." on profiles
        for select using (true);

      drop policy if exists "Users can insert their own profile." on profiles;
      create policy "Users can insert their own profile." on profiles
        for insert with check (auth.uid() = id);

      drop policy if exists "Users can update own profile." on profiles;
      create policy "Users can update own profile." on profiles
        for update using (auth.uid() = id);

      -- Create cars table
      create table if not exists cars (
        id uuid default gen_random_uuid() primary key,
        id_unico text unique not null,
        name text not null,
        model text not null,
        year integer not null,
        license_plate text not null,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null,
        updated_at timestamp with time zone default timezone('utc'::text, now()) not null
      );

      -- Enable RLS for cars
      alter table cars enable row level security;

      -- Create policies for cars
      drop policy if exists "Cars are viewable by everyone." on cars;
      create policy "Cars are viewable by everyone." on cars
        for select using (true);

      drop policy if exists "Authenticated users can insert cars." on cars;
      create policy "Authenticated users can insert cars." on cars
        for insert with check (auth.role() = 'authenticated');

      drop policy if exists "Authenticated users can update cars." on cars;
      create policy "Authenticated users can update cars." on cars
        for update using (auth.role() = 'authenticated');

      drop policy if exists "Authenticated users can delete cars." on cars;
      create policy "Authenticated users can delete cars." on cars
        for delete using (auth.role() = 'authenticated');

      -- Create elements table
      create table if not exists elements (
        id uuid default gen_random_uuid() primary key,
        name text not null,
        tag text not null,
        index integer not null default 0,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null,
        updated_at timestamp with time zone default timezone('utc'::text, now()) not null
      );

      -- Enable RLS for elements
      alter table elements enable row level security;

      -- Create policies for elements
      drop policy if exists "Elements are viewable by everyone." on elements;
      create policy "Elements are viewable by everyone." on elements
        for select using (true);

      drop policy if exists "Authenticated users can insert elements." on elements;
      create policy "Authenticated users can insert elements." on elements
        for insert with check (auth.role() = 'authenticated');

      drop policy if exists "Authenticated users can update elements." on elements;
      create policy "Authenticated users can update elements." on elements
        for update using (auth.role() = 'authenticated');

      drop policy if exists "Authenticated users can delete elements." on elements;
      create policy "Authenticated users can delete elements." on elements
        for delete using (auth.role() = 'authenticated');

      -- Create lamps table
      create table if not exists lamps (
        id uuid default gen_random_uuid() primary key,
        name text not null,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null,
        updated_at timestamp with time zone default timezone('utc'::text, now()) not null
      );

      -- Enable RLS for lamps
      alter table lamps enable row level security;

      -- Create policies for lamps
      drop policy if exists "Lamps are viewable by everyone." on lamps;
      create policy "Lamps are viewable by everyone." on lamps
        for select using (true);

      drop policy if exists "Authenticated users can insert lamps." on lamps;
      create policy "Authenticated users can insert lamps." on lamps
        for insert with check (auth.role() = 'authenticated');

      drop policy if exists "Authenticated users can update lamps." on lamps;
      create policy "Authenticated users can update lamps." on lamps
        for update using (auth.role() = 'authenticated');

      drop policy if exists "Authenticated users can delete lamps." on lamps;
      create policy "Authenticated users can delete lamps." on lamps
        for delete using (auth.role() = 'authenticated');

      -- Create actions table
      create table if not exists actions (
        id uuid default gen_random_uuid() primary key,
        name text not null,
        priority integer not null default 1,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null,
        updated_at timestamp with time zone default timezone('utc'::text, now()) not null
      );

      -- Enable RLS for actions
      alter table actions enable row level security;

      -- Create policies for actions
      drop policy if exists "Actions are viewable by everyone." on actions;
      create policy "Actions are viewable by everyone." on actions
        for select using (true);

      drop policy if exists "Authenticated users can insert actions." on actions;
      create policy "Authenticated users can insert actions." on actions
        for insert with check (auth.role() = 'authenticated');

      drop policy if exists "Authenticated users can update actions." on actions;
      create policy "Authenticated users can update actions." on actions
        for update using (auth.role() = 'authenticated');

      drop policy if exists "Authenticated users can delete actions." on actions;
      create policy "Authenticated users can delete actions." on actions
        for delete using (auth.role() = 'authenticated');

      -- Create methods table
      create table if not exists methods (
        id uuid default gen_random_uuid() primary key,
        name text not null,
        formula text not null,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null,
        updated_at timestamp with time zone default timezone('utc'::text, now()) not null
      );

      -- Enable RLS for methods
      alter table methods enable row level security;

      -- Create policies for methods
      drop policy if exists "Methods are viewable by everyone." on methods;
      create policy "Methods are viewable by everyone." on methods
        for select using (true);

      drop policy if exists "Authenticated users can insert methods." on methods;
      create policy "Authenticated users can insert methods." on methods
        for insert with check (auth.role() = 'authenticated');

      drop policy if exists "Authenticated users can update methods." on methods;
      create policy "Authenticated users can update methods." on methods
        for update using (auth.role() = 'authenticated');

      drop policy if exists "Authenticated users can delete methods." on methods;
      create policy "Authenticated users can delete methods." on methods
        for delete using (auth.role() = 'authenticated');

      -- Create alarms table with foreign keys
      create table if not exists alarms (
        id uuid default gen_random_uuid() primary key,
        name text not null,
        element_id uuid references elements(id) on delete cascade,
        action_id uuid references actions(id) on delete cascade,
        method_id uuid references methods(id) on delete cascade,
        min_value decimal,
        max_value decimal,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null,
        updated_at timestamp with time zone default timezone('utc'::text, now()) not null
      );

      -- Enable RLS for alarms
      alter table alarms enable row level security;

      -- Create policies for alarms
      drop policy if exists "Alarms are viewable by everyone." on alarms;
      create policy "Alarms are viewable by everyone." on alarms
        for select using (true);

      drop policy if exists "Authenticated users can insert alarms." on alarms;
      create policy "Authenticated users can insert alarms." on alarms
        for insert with check (auth.role() = 'authenticated');

      drop policy if exists "Authenticated users can update alarms." on alarms;
      create policy "Authenticated users can update alarms." on alarms
        for update using (auth.role() = 'authenticated');

      drop policy if exists "Authenticated users can delete alarms." on alarms;
      create policy "Authenticated users can delete alarms." on alarms
        for delete using (auth.role() = 'authenticated');

      -- Create function for handling new users
      create or replace function public.handle_new_user()
      returns trigger as $$
      begin
        insert into public.profiles (id, email, full_name, role)
        values (
          new.id,
          new.email,
          new.raw_user_meta_data->>'full_name',
          coalesce(new.raw_user_meta_data->>'role', 'client')
        );
        return new;
      end;
      $$ language plpgsql security definer;

      -- Create trigger
      drop trigger if exists on_auth_user_created on auth.users;
      create trigger on_auth_user_created
        after insert on auth.users
        for each row execute procedure public.handle_new_user();
        
      -- Sync existing users (optional, helpful for initial setup)
      insert into public.profiles (id, email, full_name, role)
      select id, email, raw_user_meta_data->>'full_name', 'admin'
      from auth.users
      where email = 'admin@powerscan.com'
      on conflict (id) do nothing;
    `;

    console.log('Applying schema...');
    await client.query(sql);
    console.log('\x1b[32m%s\x1b[0m', 'Database setup completed successfully! 🎉');

  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', 'Error setting up database:', err);
  } finally {
    await client.end();
  }
}

setupDatabase();
