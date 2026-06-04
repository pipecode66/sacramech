-- Add location fields used for distance-based mechanic assignment.
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS technicians_zip_code_idx
  ON technicians (zip_code);

CREATE INDEX IF NOT EXISTS appointments_zip_code_idx
  ON appointments (zip_code);
