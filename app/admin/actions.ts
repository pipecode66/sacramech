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
    .update({ assigned_mechanic: mechanicName })
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
