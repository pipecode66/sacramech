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

interface CensusAddressMatch {
  matchedAddress: string
  addressComponents: {
    zip?: string
    city?: string
    state?: string
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

function normalizeHouseNumber(value: string | undefined): string {
  return (value ?? "").replace(/[^a-z0-9]/gi, "").toLowerCase()
}

function getStreetHouseNumber(street: string): string {
  const match = street.trim().match(/^(\d+[a-z]?)/i)
  return normalizeHouseNumber(match?.[1])
}

function toTitleCase(value: string | undefined): string | null {
  if (!value) return null

  return value
    .toLowerCase()
    .split(/\s+/)
    .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : part))
    .join(" ")
}

function normalizeState(value: string | undefined, fallbackState: string | null): string | null {
  if (!value) return fallbackState

  if (value.toUpperCase() === "CA") {
    return "California"
  }

  return toTitleCase(value) ?? fallbackState
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

function buildCensusAddress(street: string, zipCode: string, zipLocation: ZipLocation | null): string {
  const parts = [street.trim()]

  if (zipLocation?.city) {
    parts.push(zipLocation.city)
  }

  if (zipLocation?.state) {
    parts.push(zipLocation.state)
  }

  parts.push(zipCode)

  return parts.join(", ")
}

async function searchNominatim(params: URLSearchParams): Promise<NominatimResult[] | null> {
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?${params.toString()}`

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
      return null
    }

    return (await response.json()) as NominatimResult[]
  } catch (err) {
    console.warn("[validate-address] Nominatim request failed:", err)
    return null
  }
}

async function searchCensus(street: string, zipCode: string, zipLocation: ZipLocation | null): Promise<CensusAddressMatch[] | null> {
  const address = buildCensusAddress(street, zipCode, zipLocation)
  const params = new URLSearchParams({
    address,
    benchmark: "Public_AR_Current",
    format: "json",
  })

  try {
    const response = await fetch(`https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?${params.toString()}`, {
      headers: {
        "User-Agent": "SacraMech-BookingApp/1.0 (contact@rapimobilemechanic.com)",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.warn("[validate-address] Census geocoder returned non-OK status:", response.status)
      return null
    }

    const data = (await response.json()) as {
      result?: {
        addressMatches?: CensusAddressMatch[]
      }
    }

    return data.result?.addressMatches ?? []
  } catch (err) {
    console.warn("[validate-address] Census geocoder request failed:", err)
    return null
  }
}

function hasExactRequestedHouseNumber(result: NominatimResult, requestedHouseNumber: string): boolean {
  if (!requestedHouseNumber) return true
  return normalizeHouseNumber(result.address.house_number) === requestedHouseNumber
}

function createLocationFromResult(result: NominatimResult, fallbackLocation: ZipLocation): ZipLocation {
  return createFallbackLocation({
    city: getCityFromNominatim(result.address) ?? fallbackLocation.city,
    county: getCountyFromNominatim(result.address) ?? fallbackLocation.county,
    state: getStateFromNominatim(result.address) ?? fallbackLocation.state,
  })
}

function evaluateNominatimResults(
  results: NominatimResult[],
  street: string,
  zipCode: string,
  fallbackLocation: ZipLocation,
): AddressValidationResponse | null {
  const requestedHouseNumber = getStreetHouseNumber(street)
  let foundZipMismatch = false
  let foundZipMatchWithoutExactHouseNumber = false

  if (!results || results.length === 0) {
    return null
  }

  for (const result of results) {
    const returnedZip = normalizePostcode(result.address.postcode)

    if (returnedZip !== zipCode) {
      if (returnedZip && hasExactRequestedHouseNumber(result, requestedHouseNumber)) {
        foundZipMismatch = true
      }
      continue
    }

    if (!hasExactRequestedHouseNumber(result, requestedHouseNumber)) {
      foundZipMatchWithoutExactHouseNumber = true
      continue
    }

    const resolvedLocation = createLocationFromResult(result, fallbackLocation)

    return createValidResponse(street, zipCode, resolvedLocation)
  }

  if (foundZipMismatch) {
    return { valid: false, error: "ADDRESS_ZIP_MISMATCH" }
  }

  if (foundZipMatchWithoutExactHouseNumber) {
    return { valid: false, error: "ADDRESS_NOT_FOUND" }
  }

  return null
}

async function validateWithCensus(
  street: string,
  zipCode: string,
  zipLocation: ZipLocation | null,
  fallbackLocation: ZipLocation,
): Promise<AddressValidationResponse | null> {
  const matches = await searchCensus(street, zipCode, zipLocation)
  if (!matches || matches.length === 0) {
    return null
  }

  const requestedHouseNumber = getStreetHouseNumber(street)
  let foundExactAddressInAnotherZip = false

  for (const match of matches) {
    const matchedHouseNumber = getStreetHouseNumber(match.matchedAddress)

    if (requestedHouseNumber && matchedHouseNumber !== requestedHouseNumber) {
      continue
    }

    const returnedZip = normalizeZipCode(match.addressComponents.zip ?? "")

    if (returnedZip !== zipCode) {
      if (returnedZip) {
        foundExactAddressInAnotherZip = true
      }
      continue
    }

    const resolvedLocation = createFallbackLocation({
      city: toTitleCase(match.addressComponents.city) ?? fallbackLocation.city,
      county: fallbackLocation.county,
      state: normalizeState(match.addressComponents.state, fallbackLocation.state),
    })

    return createValidResponse(street, zipCode, resolvedLocation)
  }

  if (foundExactAddressInAnotherZip) {
    return { valid: false, error: "ADDRESS_ZIP_MISMATCH" }
  }

  return null
}

async function validateWithNominatim(street: string, zipCode: string): Promise<AddressValidationResponse> {
  const zipLocation = await resolveLocationForZip(zipCode)
  const fallbackLocation = createFallbackLocation(zipLocation)

  const scopedParams = new URLSearchParams({
    street,
    postalcode: zipCode,
    country: "US",
    format: "json",
    addressdetails: "1",
    limit: "5",
  })

  const scopedResults = await searchNominatim(scopedParams)
  if (!scopedResults) {
    return { valid: false, error: "VALIDATION_ERROR" }
  }

  const scopedValidation = evaluateNominatimResults(scopedResults, street, zipCode, fallbackLocation)
  if (scopedValidation?.valid) {
    return scopedValidation
  }

  const broadParams = new URLSearchParams({
    street,
    country: "US",
    format: "json",
    addressdetails: "1",
    limit: "10",
  })

  const broadResults = await searchNominatim(broadParams)
  if (!broadResults) {
    return { valid: false, error: "VALIDATION_ERROR" }
  }

  const broadValidation = evaluateNominatimResults(broadResults, street, zipCode, fallbackLocation)
  if (broadValidation?.valid) {
    return broadValidation
  }

  const censusValidation = await validateWithCensus(street, zipCode, zipLocation, fallbackLocation)
  if (censusValidation) {
    return censusValidation
  }

  if (scopedValidation) {
    return scopedValidation
  }

  if (broadValidation) {
    return broadValidation
  }

  const requestedHouseNumber = getStreetHouseNumber(street)
  const hasExactAddressInAnotherZip = broadResults.some((result) => {
    const returnedZip = normalizePostcode(result.address.postcode)
    return returnedZip && returnedZip !== zipCode && hasExactRequestedHouseNumber(result, requestedHouseNumber)
  })

  return {
    valid: false,
    error: hasExactAddressInAnotherZip ? "ADDRESS_ZIP_MISMATCH" : "ADDRESS_NOT_FOUND",
  }
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
