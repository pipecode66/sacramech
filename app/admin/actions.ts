"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
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
