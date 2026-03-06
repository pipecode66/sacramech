/**
 * VIN Decoder - Client-side utilities for VIN validation and NHTSA API integration
 */

export interface VehicleData {
  make: string
  model: string
  year: string
  engineType?: string | null
}

export interface DecodeVinResponse {
  success: boolean
  data?: VehicleData
  error?: string
}

/**
 * Validates basic VIN format on the client side
 * Supports full VINs (17 characters) and partial VINs with wildcards (e.g., 5UXWX7C5*BA)
 */
export function isValidVinFormat(vin: string): boolean {
  if (!vin) return false

  const trimmedVin = vin.trim().toUpperCase()

  // Check length: must be between 3 and 17 characters
  if (trimmedVin.length < 3 || trimmedVin.length > 17) {
    return false
  }

  // Check format: only alphanumeric characters and asterisks allowed
  // Lowercase 'i', 'o', 'q' are not valid in VINs, but we'll let NHTSA handle that
  const vinRegex = /^[A-Z0-9*]+$/
  return vinRegex.test(trimmedVin)
}

/**
 * Gets a human-readable error message for VIN format validation failures
 */
export function getVinFormatError(vin: string): string {
  const trimmedVin = vin.trim()

  if (!trimmedVin) {
    return "Por favor, ingresa un VIN"
  }

  if (trimmedVin.length < 3) {
    return "El VIN debe tener al menos 3 caracteres"
  }

  if (trimmedVin.length > 17) {
    return "El VIN no puede tener más de 17 caracteres"
  }

  if (!/^[A-Z0-9*]+$/i.test(trimmedVin.toUpperCase())) {
    return "El VIN solo puede contener números, letras (A-Z) y asteriscos (*)"
  }

  return "VIN inválido"
}

/**
 * Calls the backend API to decode a VIN using NHTSA API
 * Supports full VINs (17 chars) and partial VINs with wildcards
 */
export async function decodeVin(vin: string): Promise<DecodeVinResponse> {
  // Client-side validation first
  if (!isValidVinFormat(vin)) {
    return {
      success: false,
      error: getVinFormatError(vin),
    }
  }

  try {
    const response = await fetch("/api/decode-vin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ vin: vin.trim().toUpperCase() }),
    })

    if (!response.ok) {
      // Server-side error
      if (response.status === 400) {
        const data = await response.json()
        return {
          success: false,
          error: data.error || "VIN inválido o no encontrado",
        }
      }
      return {
        success: false,
        error: "Error al decodificar el VIN. Por favor, intenta de nuevo.",
      }
    }

    const data: DecodeVinResponse = await response.json()
    return data
  } catch (error) {
    // Network error or timeout
    console.error("Error decoding VIN:", error)
    return {
      success: false,
      error: "Error de conexión. Por favor, verifica tu conexión a internet e intenta de nuevo.",
    }
  }
}

/**
 * Maps NHTSA engine cylinder data to user-friendly engineType values
 */
export function mapCylindersToEngineType(cylinders: string | undefined): string | null {
  if (!cylinders) return null

  const cylindersMap: Record<string, string> = {
    "3": "3-Cylinder",
    "4": "4-Cylinder",
    "5": "5-Cylinder",
    "6": "6-Cylinder",
    "8": "V8",
    "10": "V10",
    "12": "V12",
  }

  // Try direct match
  if (cylindersMap[cylinders]) {
    return cylindersMap[cylinders]
  }

  // Try substring match for compound values like "Electric" or "Hybrid"
  const lowerCylinders = cylinders.toLowerCase()
  if (lowerCylinders.includes("electric")) return "Electric"
  if (lowerCylinders.includes("hybrid")) return "Hybrid"
  if (lowerCylinders.includes("diesel")) return "Diesel"

  return null
}
