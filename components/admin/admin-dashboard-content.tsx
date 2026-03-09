"use client"

import Link from "next/link"
import { useFormStatus } from "react-dom"
import { logoutAction } from "@/app/admin/actions"
import { KanbanBoard } from "./kanban-board"
import { MechanicAssignmentPanel } from "./mechanic-assignment-panel"
import { AdminSettingsPanel } from "./admin-settings-panel"
import { ReviewModerationPanel } from "./review-moderation-panel"
import { Button } from "@/components/ui/button"
import { Wrench, LogOut, Calendar, Users, Clock, CheckCircle2, Settings, MessageSquareQuote } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"
import type { ReviewRecord } from "@/lib/reviews"

interface Appointment {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  zip_code: string
  address: string
  appointment_date: string
  status: string
  created_at: string
  assigned_mechanic?: string
}

interface Technician {
  id: string
  name: string
  area: string
  phone: string | null
  join_date: string | null
  availability?: string | null
  specialties?: string[] | null
}

interface AdminDashboardContentProps {
  appointments: Appointment[]
  reviews: ReviewRecord[]
  technicians: Technician[]
  totalCount: number
  pendingCount: number
  completedCount: number
  upcomingCount: number
}

function LogoutButton() {
  const { t } = useI18n()
  const { pending } = useFormStatus()

  return (
    <form action={logoutAction}>
      <Button variant="outline" type="submit" size="sm" className="text-xs sm:text-sm bg-transparent" disabled={pending}>
        <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">{t("admin.dashboard.logout")}</span>
        <span className="sm:hidden">{t("admin.dashboard.exit")}</span>
      </Button>
    </form>
  )
}

export function AdminDashboardContent({
  appointments: allAppointments,
  reviews,
  technicians,
  totalCount,
  pendingCount,
  completedCount,
  upcomingCount,
}: AdminDashboardContentProps) {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-foreground">Rapi Mobile Mechanic</h1>
              <p className="text-xs text-muted-foreground">{t("admin.dashboard.title")}</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                {t("admin.dashboard.stats.total")}
              </CardTitle>
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{totalCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                {t("admin.dashboard.stats.pending")}
              </CardTitle>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                {t("admin.dashboard.stats.completed")}
              </CardTitle>
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{completedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                {t("admin.dashboard.stats.upcoming")}
              </CardTitle>
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{upcomingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">{t("admin.dashboard.stats.upcomingDays")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="board" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="board">Appointments</TabsTrigger>
            <TabsTrigger value="mechanics">Assignments</TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-1">
              <MessageSquareQuote className="w-3 h-3" />
              {t("admin.dashboard.reviews.tab")}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="w-3 h-3" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">{t("admin.dashboard.board.title")}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("admin.dashboard.board.dragToChange")}</p>
            </div>
            {allAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">{t("admin.dashboard.board.noAppointments")}</h3>
                  <p className="text-muted-foreground">
                    {t("admin.dashboard.board.noAppointmentsDesc")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <KanbanBoard appointments={allAppointments} />
            )}
          </TabsContent>

          <TabsContent value="mechanics" className="space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{t("admin.dashboard.mechanics.title")}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t("admin.dashboard.mechanics.desc")}
              </p>
            </div>
            <MechanicAssignmentPanel appointments={allAppointments} technicians={technicians} />
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{t("admin.dashboard.reviews.title")}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t("admin.dashboard.reviews.desc")}
              </p>
            </div>
            <ReviewModerationPanel reviews={reviews} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{t("admin.settings.title")}</h2>
            </div>
            <AdminSettingsPanel technicians={technicians} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
