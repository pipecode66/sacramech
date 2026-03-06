export interface VehicleData {
  make: string
  model: string
  year: string
  engineType?: string | null
}

export interface DecodePlateResponse {
  success: boolean
  data?: VehicleData
  error?: string
}

export function normalizePlate(plate: string): string {
  return plate.trim().toUpperCase().replace(/[\s-]+/g, "")
}

export function isValidPlateFormat(plate: string): boolean {
  const normalizedPlate = normalizePlate(plate)

  if (!normalizedPlate) {
    return false
  }

  return /^[A-Z0-9]{2,8}$/.test(normalizedPlate)
}

export function getPlateFormatError(plate: string): string {
  const normalizedPlate = normalizePlate(plate)

  if (!normalizedPlate) {
    return "Por favor, ingresa el numero de placa"
  }

  if (normalizedPlate.length < 2) {
    return "La placa debe tener al menos 2 caracteres"
  }

  if (normalizedPlate.length > 8) {
    return "La placa no puede tener mas de 8 caracteres"
  }

  if (!/^[A-Z0-9]+$/.test(normalizedPlate)) {
    return "La placa solo puede contener letras y numeros"
  }

  return "Placa invalida"
}

export async function decodePlate(plate: string, state = "CA"): Promise<DecodePlateResponse> {
  if (!isValidPlateFormat(plate)) {
    return {
      success: false,
      error: getPlateFormatError(plate),
    }
  }

  try {
    const response = await fetch("/api/decode-plate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plate: normalizePlate(plate),
        state,
      }),
    })

    let payload: DecodePlateResponse | null = null

    try {
      payload = (await response.json()) as DecodePlateResponse
    } catch {
      payload = null
    }

    if (!response.ok) {
      return {
        success: false,
        error: payload?.error || "Error al consultar la placa. Por favor, intenta de nuevo.",
      }
    }

    return payload ?? {
      success: false,
      error: "No se recibio una respuesta valida al consultar la placa.",
    }
  } catch (error) {
    console.error("Error decoding plate:", error)
    return {
      success: false,
      error: "Error de conexion. Por favor, verifica tu conexion a internet e intenta de nuevo.",
    }
  }
}
