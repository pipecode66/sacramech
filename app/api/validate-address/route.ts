import { validateAddressFormat } from "@/lib/address-validation"
import { ZIP_CODE_TO_INFO } from "@/lib/sacramento-zip-codes"
import { NextResponse } from "next/server"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NominatimResult {
  place_id: number
  licence: string
  lat: string
  lon: string
  display_name: string
  address: {
    house_number?: string
    road?: string
    neighbourhood?: string
    suburb?: string
    city?: string
    town?: string
    village?: string
    county?: string
    state?: string
    postcode?: string
    country?: string
  }
}

interface AddressValidationResponse {
  valid: boolean
  error?: string
  city?: string
  normalizedAddress?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeZip(value: string): string {
  return value.replace(/\D/g, "").slice(0, 5)
}

/**
 * Extract the best city name from a Nominatim address object.
 * Nominatim uses different fields depending on the settlement type.
 */
function getCityFromNominatim(address: NominatimResult["address"]): string | null {
  return (
    address.city ??
    address.town ??
    address.village ??
    address.suburb ??
    address.county ??
    null
  )
}

/**
 * Normalize a ZIP code returned by Nominatim.
 * US postcodes are always 5-digit; strip extensions like "95630-1234".
 */
function normalizePostcode(postcode: string | undefined): string {
  if (!postcode) return ""
  return postcode.replace(/\D/g, "").slice(0, 5)
}

// ---------------------------------------------------------------------------
// Main validation logic
// ---------------------------------------------------------------------------

async function validateWithNominatim(
  street: string,
  zipCode: string
): Promise<AddressValidationResponse> {
  const zipInfo = ZIP_CODE_TO_INFO[zipCode]
  const fallbackCity = zipInfo?.cities[0] ?? "Sacramento"

  // Build the Nominatim structured search URL
  // We intentionally omit the city from the query so Nominatim resolves it
  // from the actual geographic data — this avoids mismatches caused by
  // ZIP/municipality boundary differences.
  const params = new URLSearchParams({
    street,
    postalcode: zipCode,
    country: "US",
    format: "json",
    addressdetails: "1",
    limit: "5",
  })

  const nominatimUrl = `https://nominatim.openstreetmap.org/search?${params.toString()}`

  let results: NominatimResult[]

  try {
    const response = await fetch(nominatimUrl, {
      headers: {
        // Required by Nominatim usage policy: identify your app
        "User-Agent": "SacraMech-BookingApp/1.0 (contact@rapimobilemechanic.com)",
        "Accept-Language": "en-US,en;q=0.9",
      },
      // Nominatim recommends no caching for live lookups
      cache: "no-store",
    })

    if (!response.ok) {
      console.warn("[validate-address] Nominatim returned non-OK status:", response.status)
      // Nominatim is unreachable — degrade gracefully
      return {
        valid: true,
        city: fallbackCity,
        normalizedAddress: `${street}, ${fallbackCity}, CA ${zipCode}`,
      }
    }

    results = (await response.json()) as NominatimResult[]
  } catch (err) {
    console.warn("[validate-address] Nominatim request failed:", err)
    // Network error — degrade gracefully
    return {
      valid: true,
      city: fallbackCity,
      normalizedAddress: `${street}, ${fallbackCity}, CA ${zipCode}`,
    }
  }

  // No results at all → address not found
  if (!results || results.length === 0) {
    return { valid: false, error: "ADDRESS_NOT_FOUND" }
  }

  // Walk through results and find one whose postcode matches the entered ZIP.
  // This is the core check: the address must geographically belong to the ZIP.
  for (const result of results) {
    const returnedZip = normalizePostcode(result.address.postcode)

    if (returnedZip !== zipCode) {
      // The geocoder found the street name but in a different ZIP — mismatch
      continue
    }

    // ZIP matches → extract city from result
    const resolvedCity = getCityFromNominatim(result.address) ?? fallbackCity

    return {
      valid: true,
      city: resolvedCity,
      normalizedAddress: `${street}, ${resolvedCity}, CA ${zipCode}`,
    }
  }

  // We got results but none matched the ZIP code → wrong ZIP for this address
  return { valid: false, error: "ADDRESS_ZIP_MISMATCH" }
}

// ---------------------------------------------------------------------------
// Next.js Route Handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { street?: unknown; zipCode?: unknown }
    const street = typeof body.street === "string" ? body.street.trim() : ""
    const zipCode = typeof body.zipCode === "string" ? normalizeZip(body.zipCode) : ""

    // Basic input guards
    if (!street || zipCode.length !== 5) {
      return NextResponse.json({ valid: false, error: "INVALID_REQUEST" }, { status: 400 })
    }

    // Step 1: Local format validation (fast, no network)
    const formatResult = validateAddressFormat(street)
    if (!formatResult.valid) {
      return NextResponse.json({ valid: false, error: formatResult.error ?? "VALIDATION_ERROR" })
    }

    // Step 2: Geocoding validation via Nominatim (free, no API key required)
    const geoResult = await validateWithNominatim(street, zipCode)
    return NextResponse.json(geoResult)
  } catch (error) {
    console.error("[validate-address] Unexpected error:", error)
    return NextResponse.json({ valid: false, error: "INTERNAL_ERROR" }, { status: 500 })
  }
}
