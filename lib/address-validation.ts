/**
 * Address validation utilities
 * Validates address format and city matches ZIP code
 */

import { isValidCityForZip } from "./sacramento-zip-codes"

export interface AddressValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validates that an address has a reasonable format
 * Requirements:
 * - Must start with a number (street number)
 * - Must be between 5 and 100 characters
 * - Can only contain letters, numbers, spaces, hyphens, and periods
 */
export function validateAddressFormat(address: string): AddressValidationResult {
  const trimmed = address.trim()

  // Check if empty
  if (!trimmed) {
    return { valid: false, error: "EMPTY_ADDRESS" }
  }

  // Check if starts with a number (street number)
  if (!/^\d/.test(trimmed)) {
    return { valid: false, error: "INVALID_ADDRESS_FORMAT" }
  }

  // Check length (5-100 characters)
  if (trimmed.length < 5) {
    return { valid: false, error: "ADDRESS_TOO_SHORT" }
  }

  if (trimmed.length > 100) {
    return { valid: false, error: "ADDRESS_TOO_LONG" }
  }

  // Check valid characters (numbers, letters, spaces, hyphens, periods, commas)
  if (!/^[0-9a-zA-Z\s\-.,]+$/.test(trimmed)) {
    return { valid: false, error: "INVALID_ADDRESS_CHARACTERS" }
  }

  return { valid: true }
}

/**
 * Validates that the city is correct for the selected ZIP code
 */
export function validateCityForZip(
  zipCode: string,
  city: string
): AddressValidationResult {
  const trimmedCity = city.trim()

  // Check if empty
  if (!trimmedCity) {
    return { valid: false, error: "EMPTY_CITY" }
  }

  // Check if city is valid for ZIP code
  if (!isValidCityForZip(zipCode, trimmedCity)) {
    return { valid: false, error: "INVALID_CITY_FOR_ZIP" }
  }

  return { valid: true }
}

/**
 * Validates both address and city together
 */
export function validateAddressAndCity(
  address: string,
  city: string,
  zipCode: string
): AddressValidationResult {
  // First validate address format
  const addressValidation = validateAddressFormat(address)
  if (!addressValidation.valid) {
    return addressValidation
  }

  // Then validate city matches ZIP code
  const cityValidation = validateCityForZip(zipCode, city)
  if (!cityValidation.valid) {
    return cityValidation
  }

  return { valid: true }
}
