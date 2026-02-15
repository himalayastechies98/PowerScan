-- Add client_company_logo column to inspection_measure table
ALTER TABLE inspection_measure ADD COLUMN IF NOT EXISTS client_company_logo TEXT;

COMMENT ON COLUMN inspection_measure.client_company_logo IS 'Supabase storage path for the client company logo image';
