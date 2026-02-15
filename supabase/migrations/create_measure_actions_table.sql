-- Create measure_actions table for storing marker/action entries
CREATE TABLE IF NOT EXISTS measure_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    measure_id TEXT NOT NULL,
    marker_index INT NOT NULL,
    x INT NOT NULL,
    y INT NOT NULL,
    temperature NUMERIC NOT NULL,
    element_type TEXT DEFAULT 'Electrical Asset',
    final_action TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE measure_actions ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Allow authenticated read" ON measure_actions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated write" ON measure_actions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
