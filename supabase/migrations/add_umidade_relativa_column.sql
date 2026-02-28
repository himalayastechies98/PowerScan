-- Add umidade_relativa (relative humidity) column to inspection_measure table
-- This column was missing from the original schema but is used by the frontend

ALTER TABLE inspection_measure
ADD COLUMN IF NOT EXISTS umidade_relativa NUMERIC;  -- Relative humidity in percentage (%)

COMMENT ON COLUMN inspection_measure.umidade_relativa IS 'Relative humidity percentage at time of inspection';
