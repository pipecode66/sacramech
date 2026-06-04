import "server-only"

import { validateAddressFormat } from "@/lib/address-validation"
import { formatResolvedAddress, normalizeZipCode, resolveLocationForZip, type ZipLocation } from "@/lib/zip-city"

interface NominatimResult {
  lat: string
  lon: string
  address?: {
    postcode?: string
    city?: string
    town?: string
    village?: string
    suburb?: string
    county?: string
    state?: string
  }
}

interface CensusAddressMatch {
  matchedAddress: string
  coordinates?: {
    x?: number
    y?: number
  }
  addressComponents?: {
    zip?: string
    city?: string
    state?: string
  }
}

export interface GeocodedAddress {
  valid: boolean
  error?: string
  normalizedAddress?: string
  latitude?: number
  longitude?: number
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
  return value.toUpperCase() === "CA" ? "California" : toTitleCase(value) ?? fallbackState
}

function normalizePostcode(value: string | undefined) {
  return normalizeZipCode(value ?? "")
}

function createFallbackLocation(location?: ZipLocation | null): ZipLocation {
  return {
    city: location?.city ?? "Sacramento",
    county: location?.county ?? "Sacramento County",
    state: location?.state ?? "California",
  }
}

function getCoordinates(latitudeValue: string | number | undefined, longitudeValue: string | number | undefined) {
  const latitude = typeof latitudeValue === "number" ? latitudeValue : Number.parseFloat(latitudeValue ?? "")
  const longitude = typeof longitudeValue === "number" ? longitudeValue : Number.parseFloat(longitudeValue ?? "")

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null
  }

  return { latitude, longitude }
}

function buildCensusAddress(street: string, zipCode: string, location: ZipLocation | null) {
  return [street.trim(), location?.city, location?.state, zipCode].filter(Boolean).join(", ")
}

async function searchNominatim(street: string, zipCode: string): Promise<NominatimResult[] | null> {
  const params = new URLSearchParams({
    street,
    postalcode: zipCode,
    country: "US",
    format: "json",
    addressdetails: "1",
    limit: "5",
  })

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: {
        "User-Agent": "SacraMech-BookingApp/1.0 (contact@rapimobilemechanic.com)",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store",
    })

    if (!response.ok) return null
    return (await response.json()) as NominatimResult[]
  } catch (error) {
    console.warn("[server-geocode] Nominatim request failed:", error)
    return null
  }
}

async function searchCensus(street: string, zipCode: string, location: ZipLocation | null): Promise<CensusAddressMatch[] | null> {
  const params = new URLSearchParams({
    address: buildCensusAddress(street, zipCode, location),
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

    if (!response.ok) return null

    const data = (await response.json()) as {
      result?: {
        addressMatches?: CensusAddressMatch[]
      }
    }

    return data.result?.addressMatches ?? []
  } catch (error) {
    console.warn("[server-geocode] Census request failed:", error)
    return null
  }
}

export async function geocodeAddressForDistance(street: string, zipCode: string): Promise<GeocodedAddress> {
  const cleanStreet = street.trim()
  const cleanZip = normalizeZipCode(zipCode)

  if (!cleanStreet || cleanZip.length !== 5) {
    return { valid: false, error: "INVALID_REQUEST" }
  }

  const formatResult = validateAddressFormat(cleanStreet)
  if (!formatResult.valid) {
    return { valid: false, error: formatResult.error ?? "INVALID_ADDRESS_FORMAT" }
  }

  const zipLocation = await resolveLocationForZip(cleanZip)
  const fallbackLocation = createFallbackLocation(zipLocation)
  const nominatimResults = await searchNominatim(cleanStreet, cleanZip)

  for (const result of nominatimResults ?? []) {
    const returnedZip = normalizePostcode(result.address?.postcode)
    const coordinates = getCoordinates(result.lat, result.lon)

    if (returnedZip === cleanZip && coordinates) {
      const resolvedLocation = createFallbackLocation({
        city: result.address?.city ?? result.address?.town ?? result.address?.village ?? result.address?.suburb ?? fallbackLocation.city,
        county: result.address?.county ?? fallbackLocation.county,
        state: result.address?.state ?? fallbackLocation.state,
      })

      return {
        valid: true,
        normalizedAddress: formatResolvedAddress(cleanStreet, resolvedLocation, cleanZip),
        ...coordinates,
      }
    }
  }

  const censusMatches = await searchCensus(cleanStreet, cleanZip, zipLocation)
  for (const match of censusMatches ?? []) {
    const returnedZip = normalizePostcode(match.addressComponents?.zip)
    const coordinates = getCoordinates(match.coordinates?.y, match.coordinates?.x)

    if (returnedZip === cleanZip && coordinates) {
      const resolvedLocation = createFallbackLocation({
        city: toTitleCase(match.addressComponents?.city) ?? fallbackLocation.city,
        county: fallbackLocation.county,
        state: normalizeState(match.addressComponents?.state, fallbackLocation.state),
      })

      return {
        valid: true,
        normalizedAddress: formatResolvedAddress(cleanStreet, resolvedLocation, cleanZip),
        ...coordinates,
      }
    }
  }

  return { valid: false, error: "ADDRESS_NOT_FOUND" }
}
