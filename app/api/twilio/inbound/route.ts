import { NextResponse } from "next/server"

import { BUSINESS_NAME, BUSINESS_PHONE_DISPLAY } from "@/lib/business"

export const runtime = "nodejs"

function twimlResponse(message?: string) {
  const body = message
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`

  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  })
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const keyword = String(formData.get("Body") || "").trim().toUpperCase()

  if (["HELP", "INFO", "SUPPORT"].includes(keyword)) {
    return twimlResponse(
      `${BUSINESS_NAME}: For appointment help, call ${BUSINESS_PHONE_DISPLAY}. Message frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out.`,
    )
  }

  // Twilio handles standard opt-out keywords and maintains the sender block list.
  return twimlResponse()
}
