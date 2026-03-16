import "server-only"

import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { SACRAMENTO_ZIP_CODES } from "@/lib/sacramento-zip-codes"

export async function getServiceZipCodes() {
  try {
    const supabaseAdmin = getSupabaseAdminClient()
    const { data, error } = await supabaseAdmin
      .from("service_zip_codes")
      .select("zip_code")
      .order("zip_code", { ascending: true })

    if (error || !data?.length) {
      return [...SACRAMENTO_ZIP_CODES].sort()
    }

    const sanitizedZipCodes = data
      .map((row) => row.zip_code.trim())
      .filter((zipCode) => /^\d{5}$/.test(zipCode))

    // If the table exists but has only a handful of rows, assume the defaults
    // have not been seeded yet and keep the static fallback available.
    if (sanitizedZipCodes.length < 25) {
      return [...new Set([...SACRAMENTO_ZIP_CODES, ...sanitizedZipCodes])].sort()
    }

    return sanitizedZipCodes
  } catch (error) {
    console.error("Error loading service ZIP codes:", error)
    return [...SACRAMENTO_ZIP_CODES].sort()
  }
}
