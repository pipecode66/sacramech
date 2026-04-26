import { validateAddressFormat } from "@/lib/address-validation"
import { formatResolvedAddress, normalizeZipCode, resolveLocationForZip, type ZipLocation } from "@/lib/zip-city"
import { NextResponse } from "next/server"

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
  county?: string
  state?: string
  normalizedAddress?: string
}

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

function getCountyFromNominatim(address: NominatimResult["address"]): string | null {
  return address.county ?? null
}

function getStateFromNominatim(address: NominatimResult["address"]): string | null {
  return address.state ?? null
}

function createFallbackLocation(location?: ZipLocation | null): ZipLocation {
  return {
    city: location?.city ?? "Sacramento",
    county: location?.county ?? "Sacramento County",
    state: location?.state ?? "California",
  }
}

function normalizePostcode(postcode: string | undefined): string {
  if (!postcode) return ""
  return normalizeZipCode(postcode)
}

function createValidResponse(street: string, zipCode: string, location: ZipLocation): AddressValidationResponse {
  return {
    valid: true,
    city: location.city ?? undefined,
    county: location.county ?? undefined,
    state: location.state ?? undefined,
    normalizedAddress: formatResolvedAddress(street, location, zipCode),
  }
}

async function validateWithNominatim(street: string, zipCode: string): Promise<AddressValidationResponse> {
  const zipLocation = await resolveLocationForZip(zipCode)
  const fallbackLocation = createFallbackLocation(zipLocation)

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
        "User-Agent": "SacraMech-BookingApp/1.0 (contact@rapimobilemechanic.com)",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.warn("[validate-address] Nominatim returned non-OK status:", response.status)
      return createValidResponse(street, zipCode, fallbackLocation)
    }

    results = (await response.json()) as NominatimResult[]
  } catch (err) {
    console.warn("[validate-address] Nominatim request failed:", err)
    return createValidResponse(street, zipCode, fallbackLocation)
  }

  // Nominatim can miss exact house numbers. If the ZIP resolves, accept the
  // typed street and let the user confirm the map in the next step.
  if (!results || results.length === 0) {
    if (!zipLocation) {
      return { valid: false, error: "ADDRESS_NOT_FOUND" }
    }

    return createValidResponse(street, zipCode, fallbackLocation)
  }

  for (const result of results) {
    const returnedZip = normalizePostcode(result.address.postcode)

    if (returnedZip !== zipCode) {
      continue
    }

    const resolvedLocation = createFallbackLocation({
      city: getCityFromNominatim(result.address) ?? fallbackLocation.city,
      county: getCountyFromNominatim(result.address) ?? fallbackLocation.county,
      state: getStateFromNominatim(result.address) ?? fallbackLocation.state,
    })

    return createValidResponse(street, zipCode, resolvedLocation)
  }

  return { valid: false, error: "ADDRESS_ZIP_MISMATCH" }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { street?: unknown; zipCode?: unknown }
    const street = typeof body.street === "string" ? body.street.trim() : ""
    const zipCode = typeof body.zipCode === "string" ? normalizeZipCode(body.zipCode) : ""

    if (!street || zipCode.length !== 5) {
      return NextResponse.json({ valid: false, error: "INVALID_REQUEST" }, { status: 400 })
    }

    const formatResult = validateAddressFormat(street)
    if (!formatResult.valid) {
      return NextResponse.json({ valid: false, error: formatResult.error ?? "VALIDATION_ERROR" })
    }

    const geoResult = await validateWithNominatim(street, zipCode)
    return NextResponse.json(geoResult)
  } catch (error) {
    console.error("[validate-address] Unexpected error:", error)
    return NextResponse.json({ valid: false, error: "INTERNAL_ERROR" }, { status: 500 })
  }
}
