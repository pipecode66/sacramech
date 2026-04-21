import { NextResponse } from "next/server"

import { normalizeZipCode, resolveCityForZip } from "@/lib/zip-city"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const zipCode = normalizeZipCode(searchParams.get("zipCode") ?? "")

  if (zipCode.length !== 5) {
    return NextResponse.json({ error: "Invalid ZIP code." }, { status: 400 })
  }

  const city = await resolveCityForZip(zipCode)

  return NextResponse.json({
    zipCode,
    city,
  })
}
