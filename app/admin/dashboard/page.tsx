import { redirect } from "next/navigation"
import { addDays, startOfToday } from "date-fns"
import { getAdminSession } from "@/app/admin/actions"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { AdminDashboardContent } from "@/components/admin/admin-dashboard-content"
import { parseLocalDate } from "@/lib/date-utils"
import type { ReviewRecord } from "@/lib/reviews"
import { getServiceZipCodes } from "@/lib/service-zip-codes"

interface TechnicianRecord {
  id: string
  name: string
  area: string
  phone: string | null
  join_date: string | null
  availability?: string | null
  specialties?: string[] | null
}

export default async function AdminDashboardPage() {
  const session = await getAdminSession()
  if (!session) redirect("/admin/login")

  const supabase = await getSupabaseServerClient()
  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .order("created_at", { ascending: false })

  const allAppointments = appointments || []
  let reviews: ReviewRecord[] = []
  let technicians: TechnicianRecord[] = []
  const serviceZipCodes = await getServiceZipCodes()

  try {
    const supabaseAdmin = getSupabaseAdminClient()
    const { data: reviewData } = await supabaseAdmin.from("reviews").select("*").order("created_at", { ascending: false })
    reviews = reviewData || []
  } catch (error) {
    console.error("Error fetching reviews:", error)
  }

  try {
    const supabaseAdmin = getSupabaseAdminClient()
    const { data: techniciansData } = await supabaseAdmin
      .from("technicians")
      .select("id, name, area, phone, join_date, availability, specialties, created_at")
      .order("name", { ascending: true })

    technicians = techniciansData || []
  } catch (error) {
    console.error("Error fetching technicians:", error)
  }

  const pendingCount = allAppointments.filter((a) => a.status === "pending").length
  const completedCount = allAppointments.filter((a) => a.status === "completed").length
  const totalCount = allAppointments.length

  const today = startOfToday()
  const nextWeek = addDays(today, 7)
  const upcomingCount = allAppointments.filter((a) => {
    const date = parseLocalDate(a.appointment_date)
    if (!date) return false
    return date >= today && date <= nextWeek && a.status === "pending"
  }).length

  return (
    <AdminDashboardContent
      appointments={allAppointments}
      reviews={reviews}
      technicians={technicians}
      serviceZipCodes={serviceZipCodes}
      totalCount={totalCount}
      pendingCount={pendingCount}
      completedCount={completedCount}
      upcomingCount={upcomingCount}
    />
  )
}
