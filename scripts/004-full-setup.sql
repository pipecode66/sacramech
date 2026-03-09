-- ============================================
-- Full database setup for Rapi Mobile Mechanic
-- This script is idempotent - safe to run multiple times
-- ============================================

-- 1. Create appointments table with ALL columns
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  address TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TEXT,
  status TEXT DEFAULT 'pending',
  vehicle_year TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  engine_type TEXT,
  service_type TEXT,
  referral_source TEXT,
  assigned_mechanic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add columns if they don't exist (for existing tables)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS vehicle_year TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS vehicle_make TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS vehicle_model TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS engine_type TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_type TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS referral_source TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS assigned_mechanic TEXT;

-- 3. Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create zip_code_waitlist table for email notifications
CREATE TABLE IF NOT EXISTS zip_code_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  service_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create technicians table
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

-- 7. Enable Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE zip_code_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;

-- 8. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow all operations on appointments" ON appointments;
DROP POLICY IF EXISTS "Allow select on admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow all operations on zip_code_waitlist" ON zip_code_waitlist;
DROP POLICY IF EXISTS "Allow all operations on technicians" ON technicians;

-- 9. Recreate policies
CREATE POLICY "Allow all operations on appointments" ON appointments
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow select on admin_users" ON admin_users
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations on zip_code_waitlist" ON zip_code_waitlist
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on technicians" ON technicians
  FOR ALL USING (true) WITH CHECK (true);

-- 10. Insert default admin user (password: admin0815)
-- Using a proper bcrypt hash for 'admin0815'
INSERT INTO admin_users (email, password_hash) 
VALUES (
  'superadmin@prueba.com', 
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- 11. Seed default technicians
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

