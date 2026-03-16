"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppointmentCard } from "./appointment-card"
import { updateAppointmentStatus } from "@/app/admin/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, XCircle, CalendarClock } from "lucide-react"
import { useI18n, type TranslationKey } from "@/lib/i18n"

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
}

interface KanbanBoardProps {
  appointments: Appointment[]
}

const getColumns = (t: (key: TranslationKey) => string) => [
  {
    id: "pending",
    title: t("kanban.pending"),
    icon: Clock,
    color: "bg-yellow-500",
    borderColor: "border-yellow-400",
    bgColor: "bg-yellow-50",
  },
  {
    id: "postponed",
    title: t("kanban.postponed"),
    icon: CalendarClock,
    color: "bg-orange-500",
    borderColor: "border-orange-400",
    bgColor: "bg-orange-50",
  },
  {
    id: "completed",
    title: t("kanban.completed"),
    icon: CheckCircle2,
    color: "bg-green-500",
    borderColor: "border-green-400",
    bgColor: "bg-green-50",
  },
  {
    id: "cancelled",
    title: t("kanban.cancelled"),
    icon: XCircle,
    color: "bg-red-500",
    borderColor: "border-red-400",
    bgColor: "bg-red-50",
  },
]

export function KanbanBoard({ appointments }: KanbanBoardProps) {
  const { t } = useI18n()
  const columns = getColumns(t)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    setDragOverColumn(null)

    const appointmentId = e.dataTransfer.getData("appointmentId")
    if (!appointmentId) return

    const appointment = appointments.find(a => a.id === appointmentId)
    if (!appointment || appointment.status === newStatus) return

    setIsUpdating(true)
    const result = await updateAppointmentStatus(appointmentId, newStatus)
    if (result.success) {
      router.refresh()
    }
    setIsUpdating(false)
  }

  const getAppointmentsByStatus = (status: string) => {
    return appointments
      .filter((appointment) => appointment.status === status)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
      {columns.map((column) => {
        const columnAppointments = getAppointmentsByStatus(column.id)
        const Icon = column.icon
        const isDragOver = dragOverColumn === column.id

        return (
          <div
            key={column.id}
            className={`rounded-xl border-2 transition-all duration-200 ${isDragOver
              ? `${column.borderColor} ${column.bgColor} scale-[1.02]`
              : "border-border bg-muted/30"
              } ${isUpdating ? "pointer-events-none opacity-70" : ""}`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="p-3 sm:p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${column.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-foreground">
                    {column.title}
                  </h3>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {columnAppointments.length}
                </Badge>
              </div>
            </div>

            <div className="p-2 sm:p-3 space-y-3 min-h-[200px] max-h-[60vh] overflow-y-auto">
              {columnAppointments.length === 0 ? (
                <div className={`h-32 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${isDragOver ? column.borderColor : "border-muted-foreground/20"
                  }`}>
                  <p className="text-xs sm:text-sm text-muted-foreground text-center px-2">
                    {isDragOver ? t("kanban.dropHere") : t("kanban.dragAppointmentsHere")}
                  </p>
                </div>
              ) : (
                columnAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
