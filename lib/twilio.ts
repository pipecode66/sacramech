interface SendSmsParams {
  to: string
  body: string
}

interface SendSmsResult {
  sid: string
  status?: string | null
}

function normalizePhoneToE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, "")

  if (digits.length === 10) {
    return `+1${digits}`
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`
  }

  if (phone.startsWith("+") && digits.length >= 8 && digits.length <= 15) {
    return `+${digits}`
  }

  return null
}

function getTwilioConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim()
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim()
  const from = process.env.TWILIO_PHONE_NUMBER?.trim()

  if (!accountSid || !authToken || !from) {
    return null
  }

  return { accountSid, authToken, from }
}

export async function sendTwilioSms({ to, body }: SendSmsParams): Promise<SendSmsResult> {
  const config = getTwilioConfig()
  if (!config) {
    throw new Error("Twilio is not configured. Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER.")
  }

  const normalizedTo = normalizePhoneToE164(to)
  if (!normalizedTo) {
    throw new Error("Invalid recipient phone number format.")
  }

  const normalizedFrom = normalizePhoneToE164(config.from)
  if (!normalizedFrom) {
    throw new Error("Invalid TWILIO_PHONE_NUMBER format.")
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`
  const formBody = new URLSearchParams({
    To: normalizedTo,
    From: normalizedFrom,
    Body: body,
  })

  const basicAuth = Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64")
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formBody.toString(),
    cache: "no-store",
  })

  const data = await response.json()

  if (!response.ok) {
    const message = typeof data?.message === "string" ? data.message : "Twilio API request failed."
    throw new Error(message)
  }

  return {
    sid: data.sid as string,
    status: (data.status as string | undefined) ?? null,
  }
}
