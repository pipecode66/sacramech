import { ZIP_CODE_TO_INFO } from "@/lib/sacramento-zip-codes"

interface NominatimZipResult {
  address?: {
    city?: string
    town?: string
    village?: string
    suburb?: string
    county?: string
    state?: string
    postcode?: string
  }
}

export interface ZipLocation {
  city: string | null
  county: string | null
  state: string | null
}

const DEFAULT_STATE = "California"

const CITY_TO_COUNTY: Record<string, string> = {
  Sacramento: "Sacramento County",
  Antelope: "Sacramento County",
  Carmichael: "Sacramento County",
  "Citrus Heights": "Sacramento County",
  "Elk Grove": "Sacramento County",
  "Fair Oaks": "Sacramento County",
  "North Highlands": "Sacramento County",
  Orangevale: "Sacramento County",
  "Rancho Cordova": "Sacramento County",
  "West Sacramento": "Yolo County",
  Folsom: "Sacramento County",
}

const zipLocationCache = new Map<string, ZipLocation>()

export function normalizeZipCode(value: string): string {
  return value.replace(/\D/g, "").slice(0, 5)
}

function createZipLocation(location?: Partial<ZipLocation> | null): ZipLocation {
  return {
    city: location?.city ?? null,
    county: location?.county ?? null,
    state: location?.state ?? null,
  }
}

function hasLocationValue(location: ZipLocation | null | undefined): boolean {
  return Boolean(location?.city || location?.county || location?.state)
}

function mergeLocations(...locations: Array<ZipLocation | null | undefined>): ZipLocation | null {
  const merged = locations.reduce<ZipLocation>(
    (current, location) => ({
      city: location?.city ?? current.city,
      county: location?.county ?? current.county,
      state: location?.state ?? current.state,
    }),
    createZipLocation()
  )

  return hasLocationValue(merged) ? merged : null
}

function extractCity(address: NominatimZipResult["address"]): string | null {
  if (!address) return null

  return (
    address.city ??
    address.town ??
    address.village ??
    address.suburb ??
    address.county ??
    null
  )
}

function extractCounty(address: NominatimZipResult["address"]): string | null {
  return address?.county ?? null
}

function extractState(address: NominatimZipResult["address"]): string | null {
  return address?.state ?? null
}

function extractLocation(address: NominatimZipResult["address"]): ZipLocation | null {
  const location = createZipLocation({
    city: extractCity(address),
    county: extractCounty(address),
    state: extractState(address),
  })

  return hasLocationValue(location) ? location : null
}

function getCountyForCity(city: string | null): string | null {
  if (!city) return null
  return CITY_TO_COUNTY[city] ?? null
}

function getStaticLocationForZip(zipCode: string): ZipLocation | null {
  const normalizedZip = normalizeZipCode(zipCode)
  const city = ZIP_CODE_TO_INFO[normalizedZip]?.cities[0] ?? null
  if (!city) {
    return null
  }

  return createZipLocation({
    city,
    county: getCountyForCity(city),
    state: DEFAULT_STATE,
  })
}

async function lookupLocationWithNominatim(zipCode: string): Promise<ZipLocation | null> {
  const params = new URLSearchParams({
    postalcode: zipCode,
    country: "US",
    format: "json",
    addressdetails: "1",
    limit: "5",
  })

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      "User-Agent": "SacraMech-BookingApp/1.0 (contact@rapimobilemechanic.com)",
      "Accept-Language": "en-US,en;q=0.9",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    return null
  }

  const results = (await response.json()) as NominatimZipResult[]
  if (!Array.isArray(results) || results.length === 0) {
    return null
  }

  for (const result of results) {
    const returnedZip = normalizeZipCode(result.address?.postcode ?? "")
    if (returnedZip && returnedZip !== zipCode) {
      continue
    }

    const location = extractLocation(result.address)
    if (location) {
      return location
    }
  }

  return extractLocation(results[0]?.address)
}

export function formatResolvedAddress(street: string, location: ZipLocation | null, zipCode: string): string {
  const normalizedStreet = street.trim()
  const normalizedZip = normalizeZipCode(zipCode)

  const parts = [normalizedStreet].filter(Boolean)
  const cityAndCounty = [location?.city, location?.county].filter(Boolean).join(", ")
  if (cityAndCounty) {
    parts.push(cityAndCounty)
  }

  const stateAndZip = [location?.state, normalizedZip].filter(Boolean).join(" ")
  if (stateAndZip) {
    parts.push(stateAndZip)
  }

  return parts.join(", ")
}

export async function resolveLocationForZip(zipCode: string): Promise<ZipLocation | null> {
  const normalizedZip = normalizeZipCode(zipCode)
  if (normalizedZip.length !== 5) {
    return null
  }

  const cachedLocation = zipLocationCache.get(normalizedZip)
  if (cachedLocation) {
    return cachedLocation
  }

  const staticLocation = getStaticLocationForZip(normalizedZip)

  try {
    const resolvedLocation = await lookupLocationWithNominatim(normalizedZip)
    const mergedLocation = mergeLocations(staticLocation, resolvedLocation)
    if (mergedLocation) {
      zipLocationCache.set(normalizedZip, mergedLocation)
      return mergedLocation
    }
  } catch (error) {
    console.warn("[zip-city] Could not resolve location for ZIP:", normalizedZip, error)
  }

  if (staticLocation) {
    zipLocationCache.set(normalizedZip, staticLocation)
    return staticLocation
  }

  return null
}

export async function resolveCityForZip(zipCode: string): Promise<string | null> {
  return (await resolveLocationForZip(zipCode))?.city ?? null
}
