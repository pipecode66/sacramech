import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    // Test if the expected columns exist by trying to select them
    const { error } = await supabase
      .from("appointments")
      .select("vehicle_year, vehicle_make, vehicle_model, engine_type, service_type, referral_source, assigned_mechanic")
      .limit(1)

    const { error: reviewsError } = await supabase
      .from("reviews")
      .select("id")
      .limit(1)

    const { error: techniciansError } = await supabase
      .from("technicians")
      .select("id")
      .limit(1)

    const { error: serviceZipCodesError } = await supabase
      .from("service_zip_codes")
      .select("zip_code")
      .limit(1)

    if (error || reviewsError || techniciansError || serviceZipCodesError) {
      return NextResponse.json({
        status: "migration_needed",
        message: "Database updates are missing. Please run this SQL in your Supabase Dashboard SQL Editor:",
        sql: `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS vehicle_year TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS vehicle_make TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS vehicle_model TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS engine_type TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_type TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS referral_source TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS assigned_mechanic TEXT;

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

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

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

CREATE TABLE IF NOT EXISTS service_zip_codes (
  zip_code TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE service_zip_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on service_zip_codes" ON service_zip_codes;
CREATE POLICY "Allow all operations on service_zip_codes" ON service_zip_codes
  FOR ALL USING (true) WITH CHECK (true);`
      })
    }

    return NextResponse.json({ status: "ok", message: "Database schema is up to date" })
  } catch (err) {
    return NextResponse.json({ status: "error", message: String(err) }, { status: 500 })
  }
}
