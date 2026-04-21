import { NextResponse } from "next/server"

import { normalizeZipCode, resolveLocationForZip } from "@/lib/zip-city"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const zipCode = normalizeZipCode(searchParams.get("zipCode") ?? "")

  if (zipCode.length !== 5) {
    return NextResponse.json({ error: "Invalid ZIP code." }, { status: 400 })
  }

  const location = await resolveLocationForZip(zipCode)

  return NextResponse.json({
    zipCode,
    city: location?.city ?? null,
    county: location?.county ?? null,
    state: location?.state ?? null,
  })
}
