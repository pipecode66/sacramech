import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    // Test if the new columns exist by trying to select them
    const { error } = await supabase
      .from("appointments")
      .select("vehicle_year, vehicle_make, vehicle_model, engine_type, service_type, referral_source")
      .limit(1)

    const { error: reviewsError } = await supabase
      .from("reviews")
      .select("id")
      .limit(1)

    if (error || reviewsError) {
      return NextResponse.json({
        status: "migration_needed",
        message: "Database updates are missing. Please run this SQL in your Supabase Dashboard SQL Editor:",
        sql: `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS vehicle_year TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS vehicle_make TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS vehicle_model TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS engine_type TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_type TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS referral_source TEXT;

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

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;`
      })
    }

    return NextResponse.json({ status: "ok", message: "Database schema is up to date" })
  } catch (err) {
    return NextResponse.json({ status: "error", message: String(err) }, { status: 500 })
  }
}
