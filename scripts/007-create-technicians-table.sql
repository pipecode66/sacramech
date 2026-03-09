-- Create technicians table used by Admin Settings and Assignments
CREATE TABLE IF NOT EXISTS technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  area TEXT NOT NULL DEFAULT 'General',
  phone TEXT NOT NULL,
  join_date DATE,
  availability TEXT NOT NULL DEFAULT 'available',
  specialties TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on technicians" ON technicians;
CREATE POLICY "Allow all operations on technicians" ON technicians
  FOR ALL USING (true) WITH CHECK (true);

-- Seed default technicians once
INSERT INTO technicians (name, area, phone, availability, specialties)
SELECT 'Carlos Rodriguez', 'Central Sacramento', '9165550101', 'available', ARRAY['Oil Change', 'Battery', 'Brakes']
WHERE NOT EXISTS (SELECT 1 FROM technicians WHERE name = 'Carlos Rodriguez');

INSERT INTO technicians (name, area, phone, availability, specialties)
SELECT 'Miguel Hernandez', 'East Sacramento', '9165550102', 'available', ARRAY['Engine Repair', 'Diagnostics', 'A/C']
WHERE NOT EXISTS (SELECT 1 FROM technicians WHERE name = 'Miguel Hernandez');

INSERT INTO technicians (name, area, phone, availability, specialties)
SELECT 'Juan Garcia', 'South Sacramento', '9165550103', 'available', ARRAY['Tire Service', 'Maintenance', 'General Repairs']
WHERE NOT EXISTS (SELECT 1 FROM technicians WHERE name = 'Juan Garcia');

INSERT INTO technicians (name, area, phone, availability, specialties)
SELECT 'Pedro Lopez', 'North Sacramento', '9165550104', 'busy', ARRAY['Oil Change', 'Diagnostics']
WHERE NOT EXISTS (SELECT 1 FROM technicians WHERE name = 'Pedro Lopez');

INSERT INTO technicians (name, area, phone, availability, specialties)
SELECT 'David Morales', 'West Sacramento', '9165550105', 'available', ARRAY['Engine Repair', 'Oil Change', 'Brakes']
WHERE NOT EXISTS (SELECT 1 FROM technicians WHERE name = 'David Morales');

INSERT INTO technicians (name, area, phone, availability, specialties)
SELECT 'Robert Chen', 'East Sacramento', '9165550106', 'available', ARRAY['A/C Repair', 'Diagnostics', 'Electrical']
WHERE NOT EXISTS (SELECT 1 FROM technicians WHERE name = 'Robert Chen');
