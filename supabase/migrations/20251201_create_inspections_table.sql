-- Create inspections table
CREATE TABLE public.inspections (
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

-- Enable RLS
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inspections
-- Allow all authenticated users to view inspections
CREATE POLICY "Authenticated users can view inspections"
  ON public.inspections FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow admins to insert inspections
CREATE POLICY "Admins can insert inspections"
  ON public.inspections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to update inspections
CREATE POLICY "Admins can update inspections"
  ON public.inspections FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to delete inspections
CREATE POLICY "Admins can delete inspections"
  ON public.inspections FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger for updated_at on inspections
CREATE TRIGGER update_inspections_updated_at
  BEFORE UPDATE ON public.inspections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
