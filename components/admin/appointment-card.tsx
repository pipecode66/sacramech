"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, User, Mail, Phone, Clock, Eye, MoreVertical, Trash2, Car, Wrench, Megaphone } from "lucide-react"
import { format } from "date-fns"
import { deleteAppointment, updateAppointmentStatus } from "@/app/admin/actions"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n"
import { formatLocalDate, parseLocalDate } from "@/lib/date-utils"

interface Appointment {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  zip_code: string
  address: string
  appointment_date: string
  appointment_time?: string
  status: string
  created_at: string
  vehicle_year?: string
  vehicle_make?: string
  vehicle_model?: string
  engine_type?: string
  service_type?: string
  referral_source?: string
  additional_info?: string
}

interface AppointmentCardProps {
  appointment: Appointment
  isDragging?: boolean
}

export function AppointmentCard({ appointment, isDragging }: AppointmentCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const router = useRouter()
  const { t } = useI18n()
  const statusOptions = [
    { value: "pending", label: t("kanban.pending") },
    { value: "postponed", label: t("kanban.postponed") },
    { value: "completed", label: t("kanban.completed") },
    { value: "cancelled", label: t("kanban.cancelled") },
  ]

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    postponed: "bg-orange-100 text-orange-800 border-orange-200",
  }[appointment.status] || "bg-gray-100 text-gray-800 border-gray-200"

  const appointmentDate = parseLocalDate(appointment.appointment_date)
  const createdDate = new Date(appointment.created_at)
  const appointmentDateLabel = formatLocalDate(appointment.appointment_date)
  const bookedDateLabel = format(createdDate, "MM/dd/yyyy")

  // Format the time slot if available
  const formatTimeSlot = (time?: string) => {
    if (!time) return null
    const hour = parseInt(time.split(":")[0], 10)
    const endHour = hour + 2
    const fmt = (h: number) => {
      const ampm = h >= 12 ? "PM" : "AM"
      const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
      return `${h12}:00 ${ampm}`
    }
    return `${fmt(hour)} - ${fmt(endHour)}`
  }
  const timeSlotLabel = formatTimeSlot(appointment.appointment_time)

  const vehicleInfo = appointment.vehicle_year && appointment.vehicle_make
    ? `${appointment.vehicle_year} ${appointment.vehicle_make} ${appointment.vehicle_model || ""}`
    : null

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteAppointment(appointment.id)
    if (result.success) {
      setShowDeleteAlert(false)
      setIsOpen(false)
      router.refresh()
    }
    setIsDeleting(false)
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!newStatus || newStatus === appointment.status || isUpdatingStatus) {
      return
    }

    setIsUpdatingStatus(true)
    const result = await updateAppointmentStatus(appointment.id, newStatus)
    if (result.success) {
      router.refresh()
    }
    setIsUpdatingStatus(false)
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("appointmentId", appointment.id)
    e.dataTransfer.effectAllowed = "move"
  }

  return (
    <>
      <Card
        className={`hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50 scale-95" : ""}`}
        draggable
        onDragStart={handleDragStart}
        onClick={() => setIsOpen(true)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base sm:text-lg line-clamp-1">
              {appointment.first_name} {appointment.last_name}
            </CardTitle>
            <Badge className={`${statusColor} text-xs shrink-0`}>{appointment.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
            <span>{t("appt.cardAppointmentDate")}: {appointmentDateLabel}{timeSlotLabel ? ` | ${timeSlotLabel}` : ""}</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
            <span>{t("appt.cardBookedDate")}: {bookedDateLabel}</span>
          </div>
          {vehicleInfo && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Car className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">{vehicleInfo}</span>
            </div>
          )}
          {appointment.service_type && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Wrench className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">{appointment.service_type}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">{appointment.address}</span>
          </div>
          <div className="md:hidden pt-1" onClick={(event) => event.stopPropagation()}>
            <Select value={appointment.status} onValueChange={(value) => void handleStatusChange(value)} disabled={isUpdatingStatus}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Move to" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent text-xs sm:text-sm">
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            {t("appt.viewDetails")}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pr-8">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                {t("appt.details")}
                <Badge className={`${statusColor} text-xs`}>{appointment.status}</Badge>
              </DialogTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 absolute right-10 top-4">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">{t("appt.openMenu")}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setShowDeleteAlert(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("appt.deleteMenu")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <DialogDescription className="text-xs sm:text-sm">
              {t("appt.bookedOn")} {format(createdDate, "MMMM d, yyyy 'at' h:mm a")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 mt-2 sm:mt-4">
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Move appointment</p>
              <Select value={appointment.status} onValueChange={(value) => void handleStatusChange(value)} disabled={isUpdatingStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Customer Info */}
            <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-muted rounded-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">{t("appt.customerName")}</p>
                <p className="font-medium text-sm sm:text-base truncate">{appointment.first_name} {appointment.last_name}</p>
              </div>
            </div>

            {/* Vehicle Info */}
            {vehicleInfo && (
              <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-muted rounded-lg">
                <Car className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">{t("appt.vehicle")}</p>
                  <p className="font-medium text-sm sm:text-base">{vehicleInfo}</p>
                  {appointment.engine_type && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{t("appt.engine")}: {appointment.engine_type}</p>
                  )}
                </div>
              </div>
            )}

            {/* Service Type */}
            {appointment.service_type && (
              <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-primary/10 rounded-lg border border-primary/20">
                <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">{t("appt.serviceRequested")}</p>
                  <p className="font-semibold text-sm sm:text-base text-primary">{appointment.service_type}</p>
                </div>
              </div>
            )}

            {/* Appointment Date & Time */}
            <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-accent/10 rounded-lg border border-accent/20">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-accent mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">{t("appt.scheduledDate")}</p>
                <p className="font-semibold text-sm sm:text-base text-accent">
                  {appointmentDate ? format(appointmentDate, "EEEE, MMMM d, yyyy") : appointment.appointment_date}
                </p>
                {timeSlotLabel && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{t("appt.time")}: {timeSlotLabel}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-muted rounded-lg">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">{t("appt.serviceLocation")}</p>
                <p className="font-medium text-sm sm:text-base break-words">{appointment.address}</p>
                {appointment.additional_info && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                    <span className="font-medium">{t("appt.additionalInfo")}:</span> {appointment.additional_info}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-muted rounded-lg">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">{t("appt.email")}</p>
                  <a href={`mailto:${appointment.email}`} className="font-medium text-sm sm:text-base text-primary hover:underline truncate block">
                    {appointment.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-muted rounded-lg">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">{t("appt.phone")}</p>
                  <a href={`tel:${appointment.phone}`} className="font-medium text-sm sm:text-base text-primary hover:underline">
                    {appointment.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Referral Source & ZIP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {appointment.referral_source && (
                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-muted rounded-lg">
                  <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">{t("appt.howFound")}</p>
                    <p className="font-medium text-sm sm:text-base">{appointment.referral_source}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-muted rounded-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">{t("appt.zipCode")}</p>
                  <p className="font-medium text-sm sm:text-base">{appointment.zip_code}</p>
                </div>
              </div>
            </div>

            {/* Embedded Map - Responsive */}
            <div className="rounded-lg overflow-hidden border">
              <iframe
                width="100%"
                height="200"
                className="sm:h-[250px] lg:h-[300px]"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(appointment.address)}&zoom=15`}
                title="Appointment Location"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("appt.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("appt.deleteDesc")} {appointment.first_name} {appointment.last_name}? {t("appt.deleteCannotUndo")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t("appt.deleteCancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t("appt.deleting") : t("appt.deleteConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
