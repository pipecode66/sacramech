"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { formatLocalDate } from "@/lib/date-utils"
import { sendTwilioSms } from "@/lib/twilio"
import bcrypt from "bcryptjs"
import type { ReviewStatus } from "@/lib/reviews"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = await getSupabaseServerClient()

  const { data: adminUser, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", email)
    .single()

  if (error || !adminUser) {
    return { error: "Invalid email or password" }
  }

  const isValidPassword = await bcrypt.compare(password, adminUser.password_hash)

  if (!isValidPassword) {
    return { error: "Invalid email or password" }
  }

  // Set session cookie
  const cookieStore = await cookies()
  cookieStore.set("admin_session", adminUser.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })

  redirect("/admin/dashboard")
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  redirect("/admin/login")
}

export async function getAdminSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("admin_session")?.value

  if (!sessionId) return null

  const supabase = await getSupabaseServerClient()
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", sessionId)
    .single()

  return adminUser
}

export async function updateAppointmentStatus(appointmentId: string, newStatus: string) {
  const session = await getAdminSession()
  if (!session) {
    return { error: "Unauthorized" }
  }

  const supabase = await getSupabaseServerClient()

  const { error } = await supabase
    .from("appointments")
    .update({ status: newStatus })
    .eq("id", appointmentId)

  if (error) {
    return { error: "Failed to update appointment status" }
  }

  revalidatePath("/admin/dashboard")
  return { success: true }
}

export async function deleteAppointment(appointmentId: string) {
  const session = await getAdminSession()
  if (!session) {
    return { error: "Unauthorized" }
  }

  const supabase = await getSupabaseServerClient()

  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", appointmentId)

  if (error) {
    return { error: "Failed to delete appointment" }
  }

  revalidatePath("/admin/dashboard")
  return { success: true }
}

interface SendMechanicAssignmentSmsInput {
  appointmentId: string
  mechanicId: string
  mechanicName: string
  mechanicPhone: string
}

interface CreateTechnicianInput {
  name: string
  area?: string
  phone?: string
  countryCode?: string
  joinDate?: string
}

interface CreateAppointmentPartQuoteInput {
  appointmentId: string
  supplierName?: string
  partName: string
  partCategory?: string
  partNumber?: string
  unitPrice: string
  rating?: string
  popularityScore?: string
  sourceUrl?: string
  notes?: string
  searchQuery?: string
}

function formatTimeSlot(time?: string | null) {
  if (!time) return ""

  const parts = time.split(":")
  const hour = Number.parseInt(parts[0] || "", 10)

  if (Number.isNaN(hour)) return ""

  const endHour = hour + 2
  const fmt = (h: number) => {
    const ampm = h >= 12 ? "PM" : "AM"
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h
    return `${hour12}:00 ${ampm}`
  }

  return `${fmt(hour)} - ${fmt(endHour)}`
}

function buildMechanicAssignmentSms(appointment: {
  first_name: string | null
  last_name: string | null
  phone: string | null
  address: string | null
  appointment_date: string | null
  appointment_time: string | null
  service_type: string | null
  vehicle_year: string | null
  vehicle_make: string | null
  vehicle_model: string | null
  additional_info: string | null
}) {
  const customerName = `${appointment.first_name || ""} ${appointment.last_name || ""}`.trim() || "Unknown customer"
  const service = appointment.service_type || "General service"
  const vehicle = [appointment.vehicle_year, appointment.vehicle_make, appointment.vehicle_model].filter(Boolean).join(" ").trim()
  const dateLabel = formatLocalDate(appointment.appointment_date)
  const timeLabel = formatTimeSlot(appointment.appointment_time)
  const notes = appointment.additional_info?.trim()

  const lines = [
    "Rapi Mobile Mechanic - New assignment",
    `Customer: ${customerName}`,
    appointment.phone ? `Customer phone: ${appointment.phone}` : null,
    `Service: ${service}`,
    vehicle ? `Vehicle: ${vehicle}` : null,
    dateLabel ? `Date: ${dateLabel}${timeLabel ? ` (${timeLabel})` : ""}` : null,
    appointment.address ? `Address: ${appointment.address}` : null,
    notes ? `Notes: ${notes.slice(0, 220)}` : null,
  ].filter(Boolean)

  return lines.join("\n")
}

function normalizePhoneToE164(rawPhone: string, countryCode?: string): string | null {
  const phone = rawPhone.trim()
  const country = (countryCode || "").trim()
  if (!phone) return null

  if (phone.startsWith("+")) {
    const internationalDigits = phone.replace(/\D/g, "")
    if (internationalDigits.length >= 8 && internationalDigits.length <= 15) {
      return `+${internationalDigits}`
    }
  }

  const localDigits = phone.replace(/\D/g, "")
  const normalizedLocalDigits = localDigits.replace(/^0+/, "")
  if (!normalizedLocalDigits) return null

  const countryDigits = country.replace(/\D/g, "")
  if (countryDigits) {
    const fullNumber = `${countryDigits}${normalizedLocalDigits}`
    if (fullNumber.length >= 8 && fullNumber.length <= 15) {
      return `+${fullNumber}`
    }
  }

  if (normalizedLocalDigits.length === 10) {
    return `+1${normalizedLocalDigits}`
  }

  if (normalizedLocalDigits.length === 11 && normalizedLocalDigits.startsWith("1")) {
    return `+${normalizedLocalDigits}`
  }

  return null
}

function parseOptionalNumber(value?: string, mode: "float" | "int" = "float") {
  if (!value?.trim()) return null

  const parsedValue = mode === "int" ? Number.parseInt(value, 10) : Number.parseFloat(value)
  return Number.isFinite(parsedValue) ? parsedValue : null
}

export async function sendMechanicAssignmentSms({
  appointmentId,
  mechanicId,
  mechanicName,
  mechanicPhone,
}: SendMechanicAssignmentSmsInput) {
  const session = await getAdminSession()
  if (!session) {
    return { error: "Unauthorized" }
  }

  if (!appointmentId || !mechanicId || !mechanicName || !mechanicPhone) {
    return { error: "Missing assignment data." }
  }

  const supabase = await getSupabaseServerClient()

  const { data: appointment, error } = await supabase
    .from("appointments")
    .select("id, first_name, last_name, phone, address, appointment_date, appointment_time, service_type, vehicle_year, vehicle_make, vehicle_model, additional_info")
    .eq("id", appointmentId)
    .single()

  if (error || !appointment) {
    return { error: "Appointment not found." }
  }

  const smsBody = buildMechanicAssignmentSms(appointment)

  let smsResult: { sid: string; status?: string | null }

  try {
    smsResult = await sendTwilioSms({
      to: mechanicPhone,
      body: smsBody,
    })
  } catch (smsError) {
    const message = smsError instanceof Error ? smsError.message : "Failed to send SMS via Twilio."
    return { error: message }
  }

  const { error: updateError } = await supabase
    .from("appointments")
    .update({ assigned_mechanic: mechanicId || mechanicName })
    .eq("id", appointmentId)

  if (updateError) {
    console.warn("Could not persist assigned_mechanic on appointments:", updateError)
  }

  revalidatePath("/admin/dashboard")
  return {
    success: true,
    sid: smsResult.sid,
    status: smsResult.status,
  }
}

export async function createTechnician({ name, area, phone, countryCode, joinDate }: CreateTechnicianInput) {
  const session = await getAdminSession()
  if (!session) {
    return { error: "Unauthorized" }
  }

  const cleanName = name.trim()
  const cleanArea = area?.trim() || "General"
  const normalizedPhone = normalizePhoneToE164(phone || "", countryCode)
  const cleanJoinDate = joinDate?.trim() || null

  if (!cleanName) {
    return { error: "Technician name is required." }
  }

  if (!normalizedPhone) {
    return { error: "A valid international phone number is required for SMS assignments." }
  }

  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("technicians")
    .insert({
      name: cleanName,
      area: cleanArea,
      phone: normalizedPhone,
      join_date: cleanJoinDate,
      availability: "available",
      specialties: [],
    })
    .select("id, name, area, phone, join_date, availability, specialties, created_at")
    .single()

  if (error || !data) {
    return { error: "Failed to add technician." }
  }

  revalidatePath("/admin/dashboard")
  return { success: true, technician: data }
}

export async function deleteTechnician(technicianId: string) {
  const session = await getAdminSession()
  if (!session) {
    return { error: "Unauthorized" }
  }

  if (!technicianId) {
    return { error: "Technician id is required." }
  }

  const supabase = await getSupabaseServerClient()

  const { error } = await supabase
    .from("technicians")
    .delete()
    .eq("id", technicianId)

  if (error) {
    return { error: "Failed to delete technician." }
  }

  revalidatePath("/admin/dashboard")
  return { success: true }
}

export async function createServiceZip(zipCode: string) {
  const session = await getAdminSession()
  if (!session) {
    return { error: "Unauthorized" }
  }

  const cleanZip = zipCode.trim()
  if (!/^\d{5}$/.test(cleanZip)) {
    return { error: "ZIP codes must be exactly 5 digits." }
  }

  const supabase = await getSupabaseServerClient()
  const { error } = await supabase
    .from("service_zip_codes")
    .upsert({ zip_code: cleanZip }, { onConflict: "zip_code" })

  if (error) {
    return { error: "Could not save the ZIP code." }
  }

  revalidatePath("/")
  revalidatePath("/admin/dashboard")
  return { success: true, zipCode: cleanZip }
}

export async function deleteServiceZip(zipCode: string) {
  const session = await getAdminSession()
  if (!session) {
    return { error: "Unauthorized" }
  }

  const cleanZip = zipCode.trim()
  if (!/^\d{5}$/.test(cleanZip)) {
    return { error: "ZIP codes must be exactly 5 digits." }
  }

  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.from("service_zip_codes").delete().eq("zip_code", cleanZip)

  if (error) {
    return { error: "Could not delete the ZIP code." }
  }

  revalidatePath("/")
  revalidatePath("/admin/dashboard")
  return { success: true }
}

export async function createAppointmentPartQuote({
  appointmentId,
  supplierName,
  partName,
  partCategory,
  partNumber,
  unitPrice,
  rating,
  popularityScore,
  sourceUrl,
  notes,
  searchQuery,
}: CreateAppointmentPartQuoteInput) {
  const session = await getAdminSession()
  if (!session) {
    return { error: "Unauthorized" }
  }

  if (!appointmentId || !partName.trim()) {
    return { error: "Appointment and part name are required." }
  }

  const parsedPrice = parseOptionalNumber(unitPrice)
  if (parsedPrice === null) {
    return { error: "A valid unit price is required." }
  }

  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("appointment_part_quotes")
    .insert({
      appointment_id: appointmentId,
      supplier_name: supplierName?.trim() || "O'Reilly Auto Parts",
      part_name: partName.trim(),
      part_category: partCategory?.trim() || null,
      part_number: partNumber?.trim() || null,
      unit_price: parsedPrice,
      rating: parseOptionalNumber(rating),
      popularity_score: parseOptionalNumber(popularityScore, "int"),
      source_url: sourceUrl?.trim() || null,
      notes: notes?.trim() || null,
      search_query: searchQuery?.trim() || null,
    })
    .select("*")
    .single()

  if (error || !data) {
    return { error: "Could not save the parts quote." }
  }

  revalidatePath("/admin/dashboard")
  return { success: true, quote: data }
}

export async function deleteAppointmentPartQuote(quoteId: string) {
  const session = await getAdminSession()
  if (!session) {
    return { error: "Unauthorized" }
  }

  if (!quoteId) {
    return { error: "Quote id is required." }
  }

  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.from("appointment_part_quotes").delete().eq("id", quoteId)

  if (error) {
    return { error: "Could not delete the parts quote." }
  }

  revalidatePath("/admin/dashboard")
  return { success: true }
}

export async function updateReviewStatus(reviewId: string, status: ReviewStatus) {
  const session = await getAdminSession()
  if (!session) {
    return { error: "Unauthorized" }
  }

  const supabaseAdmin = getSupabaseAdminClient()

  const { error } = await supabaseAdmin
    .from("reviews")
    .update({
      status,
      approved_at: status === "approved" ? new Date().toISOString() : null,
    })
    .eq("id", reviewId)

  if (error) {
    return { error: "Failed to update review status" }
  }

  revalidatePath("/admin/dashboard")
  revalidatePath("/")
  return { success: true }
}

export async function deleteReview(reviewId: string) {
  const session = await getAdminSession()
  if (!session) {
    return { error: "Unauthorized" }
  }

  const supabaseAdmin = getSupabaseAdminClient()
  const { error } = await supabaseAdmin.from("reviews").delete().eq("id", reviewId)

  if (error) {
    return { error: "Failed to delete review" }
  }

  revalidatePath("/admin/dashboard")
  revalidatePath("/")
  return { success: true }
}
