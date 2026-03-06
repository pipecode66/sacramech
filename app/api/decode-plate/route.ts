import { NextRequest, NextResponse } from "next/server"

interface VehicleData {
  make: string
  model: string
  year: string
  engineType?: string | null
}

interface DecodePlateResponse {
  success: boolean
  data?: VehicleData
  error?: string
}

function normalizePlate(plate: string): string {
  return plate.trim().toUpperCase().replace(/[\s-]+/g, "")
}

function isValidPlateFormat(plate: string): boolean {
  return /^[A-Z0-9]{2,8}$/.test(plate)
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
}

function stripXmlTags(value: string): string {
  return decodeXmlEntities(value).replace(/<[^>]*>/g, "").trim()
}

function extractTagContent(xml: string, tagName: string): string | undefined {
  const match = xml.match(
    new RegExp(
      `<(?:[\\w-]+:)?${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:[\\w-]+:)?${tagName}>`,
      "i"
    )
  )
  return match?.[1]
}

function extractTagValue(xml: string, tagName: string): string | undefined {
  const content = extractTagContent(xml, tagName)
  if (!content) {
    return undefined
  }

  const value = stripXmlTags(content)
  return value || undefined
}

function extractNestedTagValue(xml: string, parentTagName: string, childTagName: string): string | undefined {
  const parentContent = extractTagContent(xml, parentTagName)
  if (!parentContent) {
    return undefined
  }

  return extractTagValue(parentContent, childTagName)
}

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => Boolean(value && value.trim()))
}

function parseVehicleJson(xml: string): Record<string, unknown> | null {
  const vehicleJson = extractTagValue(xml, "vehicleJson")

  if (!vehicleJson) {
    return null
  }

  try {
    return JSON.parse(vehicleJson) as Record<string, unknown>
  } catch {
    return null
  }
}

function getJsonString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value.trim()
  }

  if (typeof value === "number") {
    return String(value)
  }

  if (value && typeof value === "object" && "CurrentTextValue" in value) {
    return getJsonString((value as Record<string, unknown>).CurrentTextValue)
  }

  if (value && typeof value === "object" && "CurrentValue" in value) {
    return getJsonString((value as Record<string, unknown>).CurrentValue)
  }

  return undefined
}

function mapProviderVehicleToEngineType({
  description,
  fuelType,
  engineSize,
}: {
  description?: string
  fuelType?: string
  engineSize?: string
}): string | null {
  const haystack = [description, fuelType, engineSize].filter(Boolean).join(" ").toLowerCase()

  if (!haystack) {
    return null
  }

  if (haystack.includes("hybrid")) return "Hybrid"
  if (haystack.includes("electric") || haystack.includes("ev")) return "Electric"
  if (haystack.includes("diesel")) return "Diesel"
  if (haystack.includes("turbo")) return "Turbocharged"
  if (haystack.includes("v8") || haystack.includes("8 cyl")) return "V8"
  if (haystack.includes("v6") || haystack.includes("6 cyl")) return "6-Cylinder"
  if (haystack.includes("i6") || haystack.includes("inline 6")) return "6-Cylinder"
  if (haystack.includes("4 cyl") || haystack.includes("i4") || haystack.includes("inline 4")) return "4-Cylinder"

  return null
}

function extractVehicleDataFromXml(xml: string): VehicleData | null {
  const vehicleJson = parseVehicleJson(xml)

  const make = firstNonEmpty(
    extractNestedTagValue(xml, "CarMake", "CurrentTextValue"),
    extractTagValue(xml, "MakeDescription"),
    getJsonString(vehicleJson?.CarMake),
    getJsonString(vehicleJson?.MakeDescription),
  )

  const model = firstNonEmpty(
    extractTagValue(xml, "CarModel"),
    extractTagValue(xml, "ModelDescription"),
    getJsonString(vehicleJson?.CarModel),
    getJsonString(vehicleJson?.ModelDescription),
  )

  const year = firstNonEmpty(
    extractTagValue(xml, "RegistrationYear"),
    extractTagValue(xml, "ManufactureYearFrom"),
    getJsonString(vehicleJson?.RegistrationYear),
    getJsonString(vehicleJson?.ManufactureYearFrom),
  )

  if (!make || !model || !year) {
    return null
  }

  const fuelType = firstNonEmpty(
    extractNestedTagValue(xml, "FuelType", "CurrentTextValue"),
    getJsonString(vehicleJson?.FuelType),
  )

  const engineSize = firstNonEmpty(
    extractNestedTagValue(xml, "EngineSize", "CurrentTextValue"),
    getJsonString(vehicleJson?.EngineSize),
  )

  const description = firstNonEmpty(
    extractTagValue(xml, "Description"),
    getJsonString(vehicleJson?.Description),
  )

  return {
    make,
    model,
    year,
    engineType: mapProviderVehicleToEngineType({
      description,
      fuelType,
      engineSize,
    }),
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<DecodePlateResponse>> {
  try {
    const body = await request.json()
    const plateInput = typeof body?.plate === "string" ? body.plate : ""
    const stateInput = typeof body?.state === "string" ? body.state : "CA"

    const plate = normalizePlate(plateInput)
    const state = stateInput.trim().toUpperCase() || "CA"

    if (!plate) {
      return NextResponse.json(
        {
          success: false,
          error: "La placa es requerida",
        },
        { status: 400 }
      )
    }

    if (!isValidPlateFormat(plate)) {
      return NextResponse.json(
        {
          success: false,
          error: "La placa debe tener entre 2 y 8 caracteres alfanumericos",
        },
        { status: 400 }
      )
    }

    if (!/^[A-Z]{2}$/.test(state)) {
      return NextResponse.json(
        {
          success: false,
          error: "El estado de la placa no es valido",
        },
        { status: 400 }
      )
    }

    const providerUsername = process.env.VEHICLE_REGISTRATION_API_USERNAME?.trim()

    if (!providerUsername) {
      return NextResponse.json(
        {
          success: false,
          error: "La busqueda por placa no esta configurada todavia.",
        },
        { status: 503 }
      )
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)
    const providerUrl = `https://www.regcheck.org.uk/api/reg.asmx/CheckUSA?RegistrationNumber=${encodeURIComponent(plate)}&State=${encodeURIComponent(state)}&username=${encodeURIComponent(providerUsername)}`

    let providerResponse: Response
    try {
      providerResponse = await fetch(providerUrl, {
        method: "GET",
        signal: controller.signal,
        headers: {
          Accept: "application/xml, text/xml;q=0.9, */*;q=0.8",
        },
        cache: "no-store",
      })
    } finally {
      clearTimeout(timeoutId)
    }

    const xml = await providerResponse.text()

    if (!providerResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo consultar la placa en este momento.",
        },
        { status: 502 }
      )
    }

    if (!xml.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "La busqueda por placa no devolvio informacion.",
        },
        { status: 404 }
      )
    }

    const vehicleData = extractVehicleDataFromXml(xml)

    if (!vehicleData) {
      return NextResponse.json(
        {
          success: false,
          error: "No se encontro un vehiculo para esa placa.",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: vehicleData,
    })
  } catch (error) {
    console.error("Error in decode-plate API:", error)

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          success: false,
          error: "Timeout al consultar la placa",
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
