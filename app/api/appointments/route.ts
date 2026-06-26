import { revalidatePath } from "next/cache"
import { format } from "date-fns"
import { NextResponse } from "next/server"
import { z } from "zod"

import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { parseStoredAddress } from "@/lib/address-display"
import { geocodeAddressForDistance } from "@/lib/server-geocode"
import { isServiceZipCode } from "@/lib/service-zip-codes"
import { sendTwilioSms } from "@/lib/twilio"

export const runtime = "nodejs"

const appointmentSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().min(7).max(32),
  zipCode: z.string().trim().regex(/^\d{5}$/),
  address: z.string().trim().min(5).max(160),
  latitude: z.number().finite().optional().nullable(),
  longitude: z.number().finite().optional().nullable(),
  additionalInfo: z.string().trim().max(500).optional().or(z.literal("")),
  appointmentDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  appointmentHour: z.number().int().min(0).max(23),
  vehicleYear: z.string().trim().max(10),
  vehicleMake: z.string().trim().max(60),
  vehicleModel: z.string().trim().max(60),
  engineType: z.string().trim().max(60),
  serviceType: z.string().trim().min(1).max(240),
  referralSource: z.string().trim().max(120).optional().or(z.literal("")),
})

function formatTimeSlot(hour: number) {
  const formatHour = (value: number) => {
    const suffix = value >= 12 ? "PM" : "AM"
    const hour12 = value > 12 ? value - 12 : value === 0 ? 12 : value
    return `${hour12}:00 ${suffix}`
  }

  return `${formatHour(hour)} - ${formatHour(hour + 2)}`
}

function buildCustomerSms(input: z.infer<typeof appointmentSchema>, appointmentDate: Date) {
  const vehicle = [input.vehicleYear, input.vehicleMake, input.vehicleModel].filter(Boolean).join(" ")
  const timeLabel = formatTimeSlot(appointmentDate.getHours())

  return [
    "Rapi Mobile Mechanic",
    `Hi ${input.firstName}, your appointment is booked.`,
    `Vehicle: ${vehicle}`,
    `Service: ${input.serviceType}`,
    `Date: ${format(appointmentDate, "MM/dd/yyyy")} (${timeLabel})`,
    `Location: ${input.address}`,
    "We will contact you shortly to confirm details.",
  ].join("\n")
}

function buildAdminSms(input: z.infer<typeof appointmentSchema>, appointmentDate: Date) {
  const customerName = `${input.firstName} ${input.lastName}`.trim()
  const vehicle = [input.vehicleYear, input.vehicleMake, input.vehicleModel].filter(Boolean).join(" ")
  const timeLabel = formatTimeSlot(appointmentDate.getHours())

  return [
    `The user ${customerName} has booked an appointment for their ${vehicle} on ${format(appointmentDate, "MM/dd/yyyy")} (${timeLabel}).`,
    `Service: ${input.serviceType}`,
    `Phone: ${input.phone}`,
    `Address: ${input.address}`,
  ].join("\n")
}

function getSmsWarning(label: "Customer" | "Admin", error: unknown) {
  const detail = error instanceof Error ? error.message : "Unknown Twilio error."
  return `${label} SMS could not be sent: ${detail}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = appointmentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid appointment payload" },
        { status: 400 },
      )
    }

    const input = parsed.data
    if (!(await isServiceZipCode(input.zipCode))) {
      return NextResponse.json({ error: "UNSUPPORTED_ZIP" }, { status: 400 })
    }

    const parsedAddress = parseStoredAddress(input.address, input.zipCode)
    const streetForValidation = parsedAddress.streetLine || input.address
    const validatedAddress = await geocodeAddressForDistance(streetForValidation, input.zipCode)
    if (!validatedAddress.valid) {
      return NextResponse.json({ error: validatedAddress.error || "ADDRESS_NOT_FOUND" }, { status: 400 })
    }

    const [year, month, day] = input.appointmentDate.split("-").map(Number)
    const appointmentDate = new Date(year, month - 1, day, input.appointmentHour, 0, 0, 0)

    const supabaseAdmin = getSupabaseAdminClient()
    const appointmentDateValue = input.appointmentDate
    const appointmentTimeValue = `${String(input.appointmentHour).padStart(2, "0")}:00:00`

    const appointmentPayload = {
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone,
      zip_code: input.zipCode,
      address: validatedAddress.normalizedAddress || input.address,
      latitude: validatedAddress.latitude ?? input.latitude ?? null,
      longitude: validatedAddress.longitude ?? input.longitude ?? null,
      additional_info: input.additionalInfo || null,
      appointment_date: appointmentDateValue,
      appointment_time: appointmentTimeValue,
      status: "pending",
      vehicle_year: input.vehicleYear,
      vehicle_make: input.vehicleMake,
      vehicle_model: input.vehicleModel,
      engine_type: input.engineType,
      service_type: input.serviceType,
      referral_source: input.referralSource || null,
    }

    let { data, error } = await supabaseAdmin
      .from("appointments")
      .insert(appointmentPayload)
      .select("id")
      .single()

    if (error && /latitude|longitude/i.test(error.message)) {
      const legacyPayload = {
        first_name: appointmentPayload.first_name,
        last_name: appointmentPayload.last_name,
        email: appointmentPayload.email,
        phone: appointmentPayload.phone,
        zip_code: appointmentPayload.zip_code,
        address: appointmentPayload.address,
        additional_info: appointmentPayload.additional_info,
        appointment_date: appointmentPayload.appointment_date,
        appointment_time: appointmentPayload.appointment_time,
        status: appointmentPayload.status,
        vehicle_year: appointmentPayload.vehicle_year,
        vehicle_make: appointmentPayload.vehicle_make,
        vehicle_model: appointmentPayload.vehicle_model,
        engine_type: appointmentPayload.engine_type,
        service_type: appointmentPayload.service_type,
        referral_source: appointmentPayload.referral_source,
      }

      const retryResult = await supabaseAdmin
        .from("appointments")
        .insert(legacyPayload)
        .select("id")
        .single()

      data = retryResult.data
      error = retryResult.error
    }

    if (error || !data) {
      throw error || new Error("Appointment could not be created")
    }

    const warnings: string[] = []
    const adminPhone = process.env.ADMIN_BOOKING_SMS_NUMBER?.trim() || "9166069236"

    try {
      await sendTwilioSms({
        to: input.phone,
        body: buildCustomerSms(input, appointmentDate),
      })
    } catch (smsError) {
      console.error("Error sending customer booking SMS:", smsError)
      warnings.push(getSmsWarning("Customer", smsError))
    }

    try {
      await sendTwilioSms({
        to: adminPhone,
        body: buildAdminSms(input, appointmentDate),
      })
    } catch (smsError) {
      console.error("Error sending admin booking SMS:", smsError)
      warnings.push(getSmsWarning("Admin", smsError))
    }

    revalidatePath("/admin/dashboard")

    return NextResponse.json({
      success: true,
      appointmentId: data.id,
      warnings,
    })
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json({ error: "Unable to create appointment" }, { status: 500 })
  }
}
