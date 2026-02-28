-- Add operative_number column to measure_actions table
-- This stores the element's operational register number (Número Operativo)
-- which is displayed in the PDF report's element table

ALTER TABLE measure_actions
ADD COLUMN IF NOT EXISTS operative_number TEXT DEFAULT '';

COMMENT ON COLUMN measure_actions.operative_number IS 'Operational Register Number (Número Operativo) for the element, shown in PDF report';
