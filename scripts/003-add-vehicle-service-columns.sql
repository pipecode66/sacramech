-- Add vehicle information columns
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS vehicle_year TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS vehicle_make TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS vehicle_model TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS engine_type TEXT;

-- Add service type column (stores selected services as comma-separated or JSON)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_type TEXT;

-- Add referral source column
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS referral_source TEXT;

-- Add assigned mechanic column
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS assigned_mechanic TEXT;

