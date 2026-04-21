import { ZIP_CODE_TO_INFO } from "@/lib/sacramento-zip-codes"

interface NominatimZipResult {
  address?: {
    city?: string
    town?: string
    village?: string
    suburb?: string
    county?: string
    postcode?: string
  }
}

const zipCityCache = new Map<string, string>()

export function normalizeZipCode(value: string): string {
  return value.replace(/\D/g, "").slice(0, 5)
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

function getStaticCityForZip(zipCode: string): string | null {
  const normalizedZip = normalizeZipCode(zipCode)
  return ZIP_CODE_TO_INFO[normalizedZip]?.cities[0] ?? null
}

async function lookupCityWithNominatim(zipCode: string): Promise<string | null> {
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

    const city = extractCity(result.address)
    if (city) {
      return city
    }
  }

  return extractCity(results[0]?.address)
}

export async function resolveCityForZip(zipCode: string): Promise<string | null> {
  const normalizedZip = normalizeZipCode(zipCode)
  if (normalizedZip.length !== 5) {
    return null
  }

  const cachedCity = zipCityCache.get(normalizedZip)
  if (cachedCity) {
    return cachedCity
  }

  const staticCity = getStaticCityForZip(normalizedZip)
  if (staticCity) {
    zipCityCache.set(normalizedZip, staticCity)
    return staticCity
  }

  try {
    const resolvedCity = await lookupCityWithNominatim(normalizedZip)
    if (resolvedCity) {
      zipCityCache.set(normalizedZip, resolvedCity)
      return resolvedCity
    }
  } catch (error) {
    console.warn("[zip-city] Could not resolve city for ZIP:", normalizedZip, error)
  }

  return null
}
