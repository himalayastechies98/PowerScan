-- ============================================================
-- inspection_traces: stores KML trace uploads per inspection
-- Each upload = one row. Multiple uploads = multiple rows (history).
-- ============================================================

CREATE TABLE IF NOT EXISTS inspection_traces (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ DEFAULT now(),
  inspection_id TEXT        NOT NULL REFERENCES inspections(id_unico) ON DELETE CASCADE,
  file_name     TEXT        NOT NULL,
  file_path     TEXT        NOT NULL,       -- path inside 'inspection-traces' storage bucket
  upload_date   DATE        NOT NULL DEFAULT CURRENT_DATE,
  kml_geojson   JSONB                        -- pre-parsed GeoJSON from the KML file
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inspection_traces_inspection_id
  ON inspection_traces(inspection_id);

CREATE INDEX IF NOT EXISTS idx_inspection_traces_upload_date
  ON inspection_traces(upload_date);

-- RLS
ALTER TABLE inspection_traces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read traces"
  ON inspection_traces FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert traces"
  ON inspection_traces FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete traces"
  ON inspection_traces FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================
-- Storage bucket: inspection-traces
-- Run in Supabase Studio or via the Storage UI:
--   Name: inspection-traces
--   Public: false (authenticated access)
--
-- Then add this policy so authenticated users can upload/read:
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
--   VALUES ('inspection-traces', 'inspection-traces', false)
--   ON CONFLICT DO NOTHING;

-- Storage policies (run separately if needed):
-- CREATE POLICY "Authenticated users can upload traces"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'inspection-traces' AND auth.role() = 'authenticated');
--
-- CREATE POLICY "Authenticated users can read traces"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'inspection-traces' AND auth.role() = 'authenticated');
