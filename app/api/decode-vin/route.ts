import { NextRequest, NextResponse } from "next/server"

interface VehicleData {
  make: string
  model: string
  year: string
  engineType?: string | null
}

interface DecodeVinResponse {
  success: boolean
  data?: VehicleData
  error?: string
}

interface NhtсaResult {
  Value: string
  Variable: string
  VariableId: number
}

interface NhtcsaResponse {
  Count: number
  Message: string
  Results: NhtсaResult[]
}

/**
 * Maps NHTSA engine cylinder data to user-friendly engineType values
 */
function mapCylindersToEngineType(cylinders: string | undefined): string | null {
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

/**
 * Extracts a value from NHTSA results array by variable name
 */
function extractValue(results: NhtсaResult[], variableName: string): string | undefined {
  const result = results.find((r) => r.Variable === variableName)
  return result?.Value || undefined
}

/**
 * POST /api/decode-vin
 * Decodes a VIN using NHTSA API and returns make, model, year, and optional engine type
 */
export async function POST(request: NextRequest): Promise<NextResponse<DecodeVinResponse>> {
  try {
    const body = await request.json()
    const { vin } = body

    // Validate input
    if (!vin || typeof vin !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "VIN es requerido",
        },
        { status: 400 }
      )
    }

    const vinTrimmed = vin.trim().toUpperCase()

    // Validate length
    if (vinTrimmed.length < 3 || vinTrimmed.length > 17) {
      return NextResponse.json(
        {
          success: false,
          error: "El VIN debe tener entre 3 y 17 caracteres",
        },
        { status: 400 }
      )
    }

    // Validate format (only alphanumeric and asterisks)
    if (!/^[A-Z0-9*]+$/.test(vinTrimmed)) {
      return NextResponse.json(
        {
          success: false,
          error: "El VIN contiene caracteres inválidos",
        },
        { status: 400 }
      )
    }

    // Call NHTSA API with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const nhtcsaUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${encodeURIComponent(vinTrimmed)}?format=json`

    let nhtcsaResponse: Response
    try {
      nhtcsaResponse = await fetch(nhtcsaUrl, {
        method: "GET",
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeoutId)
    }

    if (!nhtcsaResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Error al contactar el servidor NHTSA",
        },
        { status: 500 }
      )
    }

    const nhtcsaData: NhtcsaResponse = await nhtcsaResponse.json()

    // Check if VIN was found (Count should be > 0)
    if (!nhtcsaData.Count || nhtcsaData.Count === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "VIN no encontrado en la base de datos NHTSA",
        },
        { status: 400 }
      )
    }

    // Extract make, model, and year
    const make = extractValue(nhtcsaData.Results, "Make")
    const model = extractValue(nhtcsaData.Results, "Model")
    const year = extractValue(nhtcsaData.Results, "Model Year")
    const cylinders = extractValue(nhtcsaData.Results, "Engine Number of Cylinders")

    // Validate that we got the essential fields
    if (!make || !model || !year) {
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo extraer información completa del VIN",
        },
        { status: 400 }
      )
    }

    // Map cylinders to engine type
    const engineType = mapCylindersToEngineType(cylinders)

    return NextResponse.json({
      success: true,
      data: {
        make,
        model,
        year,
        engineType,
      },
    })
  } catch (error) {
    console.error("Error in decode-vin API:", error)

    // Check for timeout
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          success: false,
          error: "Timeout al decodificar el VIN",
        },
        { status: 408 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    )
  }
}
