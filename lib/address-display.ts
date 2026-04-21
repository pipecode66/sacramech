import { normalizeZipCode } from "@/lib/zip-city"

export interface ParsedStoredAddress {
  streetLine: string
  city: string | null
  county: string | null
  state: string | null
  zipCode: string | null
  locationSummary: string | null
}

function parseStateAndZip(segment: string): { state: string | null; zipCode: string | null } {
  const normalizedSegment = segment.trim().replace(/\s+/g, " ")
  const zipMatch = normalizedSegment.match(/(\d{5}(?:-\d{4})?)$/)
  const zipCode = zipMatch ? normalizeZipCode(zipMatch[1]) : null

  if (!zipMatch) {
    return {
      state: normalizedSegment || null,
      zipCode,
    }
  }

  const state = normalizedSegment.slice(0, zipMatch.index).trim()
  return {
    state: state || null,
    zipCode,
  }
}

export function parseStoredAddress(address: string, fallbackZipCode?: string | null): ParsedStoredAddress {
  const normalizedAddress = address.trim().replace(/\s+/g, " ")
  const addressParts = normalizedAddress
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)

  if (!addressParts.length) {
    return {
      streetLine: "",
      city: null,
      county: null,
      state: null,
      zipCode: normalizeZipCode(fallbackZipCode ?? "") || null,
      locationSummary: null,
    }
  }

  const lastPart = addressParts[addressParts.length - 1] ?? ""
  const { state, zipCode: parsedZipCode } = parseStateAndZip(lastPart)
  const normalizedFallbackZipCode = normalizeZipCode(fallbackZipCode ?? "")
  const zipCodeCandidate = parsedZipCode ?? normalizedFallbackZipCode
  const zipCode = zipCodeCandidate || null

  let city: string | null = null
  let county: string | null = null
  let streetParts = addressParts

  if (addressParts.length >= 4 && /county$/i.test(addressParts[addressParts.length - 2] ?? "")) {
    city = addressParts[addressParts.length - 3] ?? null
    county = addressParts[addressParts.length - 2] ?? null
    streetParts = addressParts.slice(0, addressParts.length - 3)
  } else if (addressParts.length >= 3) {
    city = addressParts[addressParts.length - 2] ?? null
    streetParts = addressParts.slice(0, addressParts.length - 2)
  } else if (addressParts.length === 2 && state) {
    streetParts = addressParts.slice(0, 1)
  }

  const streetLine = streetParts.join(", ") || addressParts[0] || normalizedAddress
  const stateAndZip = [state, zipCode].filter(Boolean).join(" ")
  const locationSummary = [city, county, stateAndZip].filter(Boolean).join(" | ") || null

  return {
    streetLine,
    city,
    county,
    state,
    zipCode,
    locationSummary,
  }
}
