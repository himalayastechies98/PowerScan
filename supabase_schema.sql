-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  role text default 'client' check (role in ('admin', 'client')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create a trigger to sync auth.users with public.profiles
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create a function to allow admins to create new users
-- This function uses security definer to bypass RLS and access auth.users
create or replace function create_client_user(
  email text,
  password text,
  full_name text
)
returns uuid
language plpgsql
security definer
as $$
declare
  new_user_id uuid;
begin
  -- Check if the executing user is an admin
  if not exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Only admins can create new users';
  end if;

  -- Create the user in auth.users
  -- Note: We can't directly insert into auth.users safely from here without
  -- using the supabase admin API, but we can use a trick or just return
  -- instructions. However, for a pure SQL solution without Edge Functions,
  -- we can't easily "create" a user with a password.
  
  -- ALTERNATIVE: Since we can't easily create auth users from SQL with a password
  -- (hashing is complex), we will assume the client uses the secondary client method
  -- OR we just insert into profiles and let them sign up? No.
  
  -- Let's try to use the `supabase_functions` extension if available, but likely not.
  
  -- FALLBACK: We will use the client-side "secondary client" trick.
  -- This function is just a placeholder to validate admin status if needed.
  return null; 
end;
$$;
