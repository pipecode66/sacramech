import { ZIP_CODE_TO_INFO, type CardinalDirection } from "./sacramento-zip-codes"

const SACRAMENTO_AREA_BY_CARDINAL: Record<CardinalDirection, string> = {
  Central: "Central Sacramento",
  East: "East Sacramento",
  Northeast: "North Sacramento",
  North: "North Sacramento",
  Northwest: "North Sacramento",
  South: "South Sacramento",
  Southeast: "South Sacramento",
  Southwest: "South Sacramento",
  West: "West Sacramento",
}

function normalizeZipCode(value: string | null | undefined) {
  return (value ?? "").replace(/\D/g, "").slice(0, 5)
}

function getCaliforniaServiceArea(zipCode: string) {
  const numericZipCode = Number.parseInt(zipCode, 10)
  if (Number.isNaN(numericZipCode)) return null

  if (numericZipCode >= 90000 && numericZipCode <= 92999) {
    return "South California"
  }

  if (numericZipCode >= 93000 && numericZipCode <= 93999) {
    return "Central California"
  }

  if (numericZipCode >= 94000 && numericZipCode <= 96199) {
    return "North California"
  }

  return null
}

export function getServiceAreaForZip(zipCode: string | null | undefined) {
  const cleanZip = normalizeZipCode(zipCode)
  if (cleanZip.length !== 5) return null

  const zipInfo = ZIP_CODE_TO_INFO[cleanZip]
  if (zipInfo) {
    return SACRAMENTO_AREA_BY_CARDINAL[zipInfo.cardinal]
  }

  return getCaliforniaServiceArea(cleanZip)
}

export function normalizeServiceArea(value: string | null | undefined) {
  return (value ?? "").trim().replace(/\s+/g, " ").toLowerCase()
}

export function isSameServiceArea(firstArea: string | null | undefined, secondArea: string | null | undefined) {
  return normalizeServiceArea(firstArea) === normalizeServiceArea(secondArea)
}
