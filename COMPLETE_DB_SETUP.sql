-- ============================================
-- SAFE DATABASE SETUP FOR POWERSCAN
-- This script handles existing tables gracefully
-- ============================================

-- Step 1: Create user role enum (ignore if exists)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'client');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Step 3: Create profiles table (if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role app_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Step 5: Create helper functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Step 6: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 7: RLS Policies for profiles (drop and recreate)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Step 8: RLS Policies for user_roles
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can view all roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Step 9: Handle new user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'client')
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'client'));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- CARS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.cars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_unico TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  license_plate TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cars are viewable by everyone." ON public.cars;
DROP POLICY IF EXISTS "Authenticated users can insert cars." ON public.cars;
DROP POLICY IF EXISTS "Authenticated users can update cars." ON public.cars;
DROP POLICY IF EXISTS "Authenticated users can delete cars." ON public.cars;

CREATE POLICY "Cars are viewable by everyone." ON public.cars FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert cars." ON public.cars FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update cars." ON public.cars FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete cars." ON public.cars FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- FEEDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.feeders (
  id_unico TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ea TEXT,
  region TEXT,
  kml_file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.feeders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view feeders" ON public.feeders;
DROP POLICY IF EXISTS "Authenticated users can insert feeders" ON public.feeders;
DROP POLICY IF EXISTS "Authenticated users can update feeders" ON public.feeders;
DROP POLICY IF EXISTS "Authenticated users can delete feeders" ON public.feeders;

CREATE POLICY "Authenticated users can view feeders" ON public.feeders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert feeders" ON public.feeders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update feeders" ON public.feeders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete feeders" ON public.feeders FOR DELETE USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_feeders_updated_at ON public.feeders;
CREATE TRIGGER update_feeders_updated_at BEFORE UPDATE ON public.feeders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- INSPECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.inspections (
  id_unico TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  ea TEXT,
  feeder_id TEXT REFERENCES public.feeders(id_unico) ON DELETE SET NULL,
  car_id TEXT REFERENCES public.cars(id_unico) ON DELETE SET NULL,
  status TEXT DEFAULT 'Pendiente',
  measures_red INTEGER DEFAULT 0,
  measures_yellow INTEGER DEFAULT 0,
  inspection_type TEXT,
  last_measure_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view inspections" ON public.inspections;
DROP POLICY IF EXISTS "Authenticated users can insert inspections" ON public.inspections;
DROP POLICY IF EXISTS "Authenticated users can update inspections" ON public.inspections;
DROP POLICY IF EXISTS "Authenticated users can delete inspections" ON public.inspections;

CREATE POLICY "Authenticated users can view inspections" ON public.inspections FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert inspections" ON public.inspections FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update inspections" ON public.inspections FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete inspections" ON public.inspections FOR DELETE USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_inspections_updated_at ON public.inspections;
CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON public.inspections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- INSPECTION_MEASURE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.inspection_measure (
    id_unico UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    inspection_id TEXT NOT NULL REFERENCES public.inspections(id_unico) ON DELETE CASCADE,
    registro_num INTEGER,
    data_criacao NUMERIC,
    data_atualizacao NUMERIC,
    inspetor TEXT, regional TEXT, subestacao TEXT, alimentador TEXT, estrutura TEXT, ativo TEXT, localizacao TEXT,
    latitude NUMERIC, longitude NUMERIC, altitude NUMERIC, x NUMERIC, y NUMERIC, zone TEXT, tag TEXT,
    diagnostico TEXT, cod_anomalia TEXT, anomalia TEXT, tipo_anomalia TEXT, severidade TEXT,
    temp1_c NUMERIC, temp_minima_c NUMERIC, delta_temp_c NUMERIC, ac_da_temp1_c NUMERIC,
    corrente_maxima_a NUMERIC, corrente_na_inspecao_a NUMERIC, vel_do_ar_na_inspecao_ms NUMERIC,
    num_imagens INTEGER, images JSONB,
    observations TEXT,
    CONSTRAINT unique_inspection_registro UNIQUE (inspection_id, registro_num)
);

CREATE INDEX IF NOT EXISTS idx_inspection_measure_inspection_id ON public.inspection_measure(inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspection_measure_registro_num ON public.inspection_measure(registro_num);

ALTER TABLE public.inspection_measure ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.inspection_measure;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.inspection_measure;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.inspection_measure;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.inspection_measure;

CREATE POLICY "Enable read access for authenticated users" ON public.inspection_measure FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.inspection_measure FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.inspection_measure FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.inspection_measure FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- ELEMENTS, LAMPS, ACTIONS, METHODS, ALARMS
-- ============================================
CREATE TABLE IF NOT EXISTS public.elements (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, name TEXT NOT NULL, tag TEXT NOT NULL, index INTEGER DEFAULT 0, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS public.lamps (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, name TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS public.actions (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, name TEXT NOT NULL, priority INTEGER DEFAULT 1, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS public.methods (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, name TEXT NOT NULL, formula TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS public.alarms (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, name TEXT NOT NULL, element_id UUID REFERENCES public.elements(id), action_id UUID REFERENCES public.actions(id), method_id UUID REFERENCES public.methods(id), min_value DECIMAL, max_value DECIMAL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());

ALTER TABLE public.elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alarms ENABLE ROW LEVEL SECURITY;

-- Policies for all lookup tables
DO $$ 
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['elements', 'lamps', 'actions', 'methods', 'alarms']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "view_%s" ON public.%s', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "insert_%s" ON public.%s', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "update_%s" ON public.%s', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "delete_%s" ON public.%s', t, t);
    EXECUTE format('CREATE POLICY "view_%s" ON public.%s FOR SELECT USING (true)', t, t);
    EXECUTE format('CREATE POLICY "insert_%s" ON public.%s FOR INSERT WITH CHECK (auth.role() = ''authenticated'')', t, t);
    EXECUTE format('CREATE POLICY "update_%s" ON public.%s FOR UPDATE USING (auth.role() = ''authenticated'')', t, t);
    EXECUTE format('CREATE POLICY "delete_%s" ON public.%s FOR DELETE USING (auth.role() = ''authenticated'')', t, t);
  END LOOP;
END $$;

-- ============================================
-- STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('feeder-kml-files', 'feeder-kml-files', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('inspection-measure-images', 'inspection-measure-images', false) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can view KML files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload KML files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update KML files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete KML files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view inspection images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload inspection images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update inspection images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete inspection images" ON storage.objects;

CREATE POLICY "Authenticated users can view KML files" ON storage.objects FOR SELECT USING (bucket_id = 'feeder-kml-files' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can upload KML files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'feeder-kml-files' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update KML files" ON storage.objects FOR UPDATE USING (bucket_id = 'feeder-kml-files' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete KML files" ON storage.objects FOR DELETE USING (bucket_id = 'feeder-kml-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view inspection images" ON storage.objects FOR SELECT USING (bucket_id = 'inspection-measure-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can upload inspection images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'inspection-measure-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update inspection images" ON storage.objects FOR UPDATE USING (bucket_id = 'inspection-measure-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete inspection images" ON storage.objects FOR DELETE USING (bucket_id = 'inspection-measure-images' AND auth.role() = 'authenticated');

-- DONE!
