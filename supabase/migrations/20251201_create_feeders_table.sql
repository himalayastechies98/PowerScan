-- Create feeders table
CREATE TABLE public.feeders (
  id_unico TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ea TEXT,
  region TEXT,
  kml_file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.feeders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feeders
-- Allow all authenticated users to view feeders
CREATE POLICY "Authenticated users can view feeders"
  ON public.feeders FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow admins to insert feeders
CREATE POLICY "Admins can insert feeders"
  ON public.feeders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to update feeders
CREATE POLICY "Admins can update feeders"
  ON public.feeders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to delete feeders
CREATE POLICY "Admins can delete feeders"
  ON public.feeders FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger for updated_at on feeders
CREATE TRIGGER update_feeders_updated_at
  BEFORE UPDATE ON public.feeders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for KML files
-- Note: This needs to be done via Supabase Dashboard or supabase CLI
-- as SQL migrations don't support storage bucket creation directly.
-- Run this in the Supabase SQL Editor after the migration:
-- 
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('feeder-kml-files', 'feeder-kml-files', false);
--
-- Then create storage policies:
-- 
-- CREATE POLICY "Authenticated users can view KML files"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'feeder-kml-files' AND auth.role() = 'authenticated');
--
-- CREATE POLICY "Admins can upload KML files"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'feeder-kml-files' AND
--   EXISTS (
--     SELECT 1 FROM public.user_roles
--     WHERE user_id = auth.uid() AND role = 'admin'
--   )
-- );
--
-- CREATE POLICY "Admins can update KML files"
-- ON storage.objects FOR UPDATE
-- USING (
--   bucket_id = 'feeder-kml-files' AND
--   EXISTS (
--     SELECT 1 FROM public.user_roles
--     WHERE user_id = auth.uid() AND role = 'admin'
--   )
-- );
--
-- CREATE POLICY "Admins can delete KML files"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'feeder-kml-files' AND
--   EXISTS (
--     SELECT 1 FROM public.user_roles
--     WHERE user_id = auth.uid() AND role = 'admin'
--   )
-- );
