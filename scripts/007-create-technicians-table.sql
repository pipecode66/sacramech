-- Create technicians table used by Admin Settings and Assignments
CREATE TABLE IF NOT EXISTS technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  area TEXT NOT NULL DEFAULT 'General',
  zip_code TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  phone TEXT NOT NULL,
  join_date DATE,
  availability TEXT NOT NULL DEFAULT 'available',
  specialties TEXT[] NOT NULL DEFAULT '{}',
  sms_consent BOOLEAN NOT NULL DEFAULT FALSE,
  sms_consent_at TIMESTAMP WITH TIME ZONE,
  sms_consent_source TEXT,
  sms_consent_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE technicians ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS sms_consent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS sms_consent_source TEXT;
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS sms_consent_version TEXT;

ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on technicians" ON technicians;
CREATE POLICY "Allow all operations on technicians" ON technicians
  FOR ALL USING (true) WITH CHECK (true);

-- Seed default technicians once
INSERT INTO technicians (name, area, phone, availability, specialties)
SELECT 'Carlos Rodriguez', 'Central Sacramento', '+19165550101', 'available', ARRAY['Oil Change', 'Battery', 'Brakes']
WHERE NOT EXISTS (SELECT 1 FROM technicians WHERE name = 'Carlos Rodriguez');

INSERT INTO technicians (name, area, phone, availability, specialties)
SELECT 'Miguel Hernandez', 'East Sacramento', '+19165550102', 'available', ARRAY['Engine Repair', 'Diagnostics', 'A/C']
WHERE NOT EXISTS (SELECT 1 FROM technicians WHERE name = 'Miguel Hernandez');

INSERT INTO technicians (name, area, phone, availability, specialties)
SELECT 'Juan Garcia', 'South Sacramento', '+19165550103', 'available', ARRAY['Tire Service', 'Maintenance', 'General Repairs']
WHERE NOT EXISTS (SELECT 1 FROM technicians WHERE name = 'Juan Garcia');

INSERT INTO technicians (name, area, phone, availability, specialties)
SELECT 'Pedro Lopez', 'North Sacramento', '+19165550104', 'busy', ARRAY['Oil Change', 'Diagnostics']
WHERE NOT EXISTS (SELECT 1 FROM technicians WHERE name = 'Pedro Lopez');

INSERT INTO technicians (name, area, phone, availability, specialties)
SELECT 'David Morales', 'West Sacramento', '+19165550105', 'available', ARRAY['Engine Repair', 'Oil Change', 'Brakes']
WHERE NOT EXISTS (SELECT 1 FROM technicians WHERE name = 'David Morales');

INSERT INTO technicians (name, area, phone, availability, specialties)
SELECT 'Robert Chen', 'East Sacramento', '+19165550106', 'available', ARRAY['A/C Repair', 'Diagnostics', 'Electrical']
WHERE NOT EXISTS (SELECT 1 FROM technicians WHERE name = 'Robert Chen');
