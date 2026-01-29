-- Create inspection_measure table to store thermographic inspection measures
CREATE TABLE IF NOT EXISTS inspection_measure (
    id_unico UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Foreign key to inspections table
    inspection_id UUID NOT NULL REFERENCES inspections(id_unico) ON DELETE CASCADE,
    
    -- Excel row metadata
    registro_num INTEGER,
    data_criacao NUMERIC,  -- Excel date serial number
    data_atualizacao NUMERIC,  -- Excel date serial number
    
    -- Inspector and location info
    inspetor TEXT,
    regional TEXT,
    subestacao TEXT,
    alimentador TEXT,
    estrutura TEXT,
    ativo TEXT,
    localizacao TEXT,
    
    -- Geographic coordinates
    latitude NUMERIC,
    longitude NUMERIC,
    altitude NUMERIC,
    x NUMERIC,  -- UTM X
    y NUMERIC,  -- UTM Y
    zone TEXT,  -- UTM Zone
    tag TEXT,
    
    -- Inspection diagnosis
    diagnostico TEXT,
    cod_anomalia TEXT,
    anomalia TEXT,
    tipo_anomalia TEXT,  -- Visual or Termal
    severidade TEXT,  -- Emergente, Programado, etc.
    
    -- Thermal measurements
    temp1_c NUMERIC,  -- Temperature 1 in Celsius
    temp_minima_c NUMERIC,  -- Minimum temperature
    delta_temp_c NUMERIC,  -- Delta temperature
    ac_da_temp1_c NUMERIC,  -- AC Temperature 1
    
    -- Current measurements
    corrente_maxima_a NUMERIC,  -- Maximum current in Amperes
    corrente_na_inspecao_a NUMERIC,  -- Current during inspection
    vel_do_ar_na_inspecao_ms NUMERIC,  -- Air velocity in m/s
    
    -- Image information
    num_imagens INTEGER,
    images JSONB,  -- Array of objects: [{ name: "Imagem1", value: "filename.jpg" }]
    
    -- User observations
    observations TEXT,
    
    -- Indexes for common queries
    CONSTRAINT unique_inspection_registro UNIQUE (inspection_id, registro_num)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_inspection_measure_inspection_id ON inspection_measure(inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspection_measure_registro_num ON inspection_measure(registro_num);
CREATE INDEX IF NOT EXISTS idx_inspection_measure_severidade ON inspection_measure(severidade);
CREATE INDEX IF NOT EXISTS idx_inspection_measure_tipo_anomalia ON inspection_measure(tipo_anomalia);
CREATE INDEX IF NOT EXISTS idx_inspection_measure_created_at ON inspection_measure(created_at);

-- Enable Row Level Security
ALTER TABLE inspection_measure ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your auth requirements)
CREATE POLICY "Enable read access for authenticated users" ON inspection_measure
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON inspection_measure
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON inspection_measure
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON inspection_measure
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_inspection_measure_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inspection_measure_updated_at
    BEFORE UPDATE ON inspection_measure
    FOR EACH ROW
    EXECUTE FUNCTION update_inspection_measure_updated_at();

-- Add comment
COMMENT ON TABLE inspection_measure IS 'Stores thermographic inspection measurement data from uploaded Excel files';
