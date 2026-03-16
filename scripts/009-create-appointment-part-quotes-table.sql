CREATE TABLE IF NOT EXISTS appointment_part_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  supplier_name TEXT NOT NULL DEFAULT 'O''Reilly Auto Parts',
  part_name TEXT NOT NULL,
  part_category TEXT,
  part_number TEXT,
  unit_price NUMERIC(10, 2) NOT NULL,
  rating NUMERIC(3, 1),
  popularity_score INTEGER,
  source_url TEXT,
  notes TEXT,
  search_query TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE appointment_part_quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on appointment_part_quotes" ON appointment_part_quotes;
CREATE POLICY "Allow all operations on appointment_part_quotes" ON appointment_part_quotes
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS appointment_part_quotes_appointment_id_idx
  ON appointment_part_quotes (appointment_id);

CREATE INDEX IF NOT EXISTS appointment_part_quotes_created_at_idx
  ON appointment_part_quotes (created_at DESC);
