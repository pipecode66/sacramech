"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, MapPin, CheckCircle2, AlertCircle, Send, Loader2 } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { formatLocalDate } from "@/lib/date-utils"
import { sendMechanicAssignmentSms } from "@/app/admin/actions"

// Service area mapping for California
const serviceAreaMap: Record<string, string> = {
  "95811": "Central Sacramento",
  "95814": "Central Sacramento",
  "95815": "Central Sacramento",
  "95816": "Central Sacramento",
  "95819": "North Sacramento",
  "95820": "North Sacramento",
  "95821": "South Sacramento",
  "95822": "South Sacramento",
  "95823": "South Sacramento",
  "95824": "South Sacramento",
  "95825": "East Sacramento",
  "95826": "East Sacramento",
  "95827": "East Sacramento",
  "95828": "East Sacramento",
  "95829": "East Sacramento",
  "95830": "East Sacramento",
  "95831": "South Sacramento",
  "95832": "South Sacramento",
  "95833": "South Sacramento",
  "95838": "South Sacramento",
  "95851": "East Sacramento",
  "95864": "East Sacramento",
  "95670": "East Sacramento (Rancho Cordova)",
  "95742": "East Sacramento (Rancho Cordova)",
  "95758": "South Sacramento",
  "95757": "South Sacramento",
  "95605": "West Sacramento",
  "95691": "West Sacramento",
  "95798": "West Sacramento",
  "95799": "West Sacramento",
  "95624": "Citrus Heights",
  "95621": "Folsom",
  "95630": "Folsom",
}

interface Appointment {
  id: string
  customer_name?: string
  first_name?: string
  last_name?: string
  zip_code?: string | null
  service_type?: string | null
  appointment_date?: string
  status?: string
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

interface MechanicAssignmentPanelProps {
  appointments: Appointment[]
  technicians: Technician[]
  onAssignMechanic?: (appointmentId: string, mechanicId: string) => void
}

interface SmsFeedback {
  tone: "success" | "error"
  message: string
}

export function MechanicAssignmentPanel({
  appointments,
  technicians,
  onAssignMechanic,
}: MechanicAssignmentPanelProps) {
  const { t } = useI18n()
  const router = useRouter()
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null)
  const [assignedMechanics, setAssignedMechanics] = useState<Record<string, string>>({})
  const [isSendingSms, setIsSendingSms] = useState(false)
  const [smsFeedback, setSmsFeedback] = useState<SmsFeedback | null>(null)

  useEffect(() => {
    const initialAssignments: Record<string, string> = {}

    appointments.forEach((appointment) => {
      if (!appointment.assigned_mechanic) return

      const byId = technicians.find((mechanic) => mechanic.id === appointment.assigned_mechanic)
      const byName = technicians.find((mechanic) => mechanic.name === appointment.assigned_mechanic)
      const matchedMechanic = byId || byName

      if (matchedMechanic) {
        initialAssignments[appointment.id] = matchedMechanic.id
      }
    })

    setAssignedMechanics(initialAssignments)
  }, [appointments, technicians])

  const pendingAppointments = appointments.filter((appointment) => appointment.status === "pending")

  const handleAssignMechanic = (appointmentId: string, mechanicId: string) => {
    setAssignedMechanics((prev) => ({
      ...prev,
      [appointmentId]: mechanicId,
    }))
    setSmsFeedback(null)
    onAssignMechanic?.(appointmentId, mechanicId)
  }

  const getAvailableMechanics = (zipCode?: string | null) => {
    const serviceArea = (zipCode ? serviceAreaMap[zipCode] : "") || "Central Sacramento"
    const normalizedServiceArea = serviceArea.trim().toLowerCase()
    return technicians.filter((mechanic) => mechanic.area.trim().toLowerCase() === normalizedServiceArea)
  }

  const currentAppointment = pendingAppointments.find((appointment) => appointment.id === selectedAppointment)
  const customerName = currentAppointment
    ? `${currentAppointment.first_name || ""} ${currentAppointment.last_name || ""}`.trim()
    : ""

  const selectedMechanicId = selectedAppointment ? assignedMechanics[selectedAppointment] : undefined
  const selectedMechanic = currentAppointment
    ? getAvailableMechanics(currentAppointment.zip_code).find((mechanic) => mechanic.id === selectedMechanicId)
    : undefined

  const handleSendSms = async () => {
    if (!selectedAppointment || !selectedMechanic) {
      setSmsFeedback({
        tone: "error",
        message: t("assign.selectMechanicFirst"),
      })
      return
    }

    setIsSendingSms(true)
    setSmsFeedback(null)

    const result = await sendMechanicAssignmentSms({
      appointmentId: selectedAppointment,
      mechanicId: selectedMechanic.id,
      mechanicName: selectedMechanic.name,
      mechanicPhone: selectedMechanic.phone || "",
    })

    if (result.success) {
      setSmsFeedback({
        tone: "success",
        message: result.sid ? `${t("assign.smsSent")} (${result.sid})` : t("assign.smsSent"),
      })
      router.refresh()
    } else {
      setSmsFeedback({
        tone: "error",
        message: result.error || t("assign.smsError"),
      })
    }

    setIsSendingSms(false)
  }

  if (pendingAppointments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium text-foreground">{t("assign.noPending")}</h3>
          <p className="text-muted-foreground">{t("assign.noPendingDesc")}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {t("assign.pendingTitle")}
          </CardTitle>
          <CardDescription>
            {pendingAppointments.length} {t("assign.waitingCount")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {pendingAppointments.map((appointment) => {
              const appointmentCustomerName = `${appointment.first_name || ""} ${appointment.last_name || ""}`.trim()
              const isSelected = selectedAppointment === appointment.id
              const isMechanicAssigned = assignedMechanics[appointment.id]

              return (
                <button
                  key={appointment.id}
                  onClick={() => {
                    setSelectedAppointment(appointment.id)
                    setSmsFeedback(null)
                  }}
                  className={`w-full rounded-lg border p-3 text-left transition-all ${isSelected
                    ? "border-primary bg-primary/5"
                    : isMechanicAssigned
                      ? "border-green-200 bg-green-50"
                      : "border-muted hover:border-muted-foreground/30"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{appointmentCustomerName || t("assign.unknown")}</p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.service_type} | {appointment.zip_code}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatLocalDate(appointment.appointment_date)}
                      </p>
                    </div>
                    {isMechanicAssigned ? (
                      <Badge className="ml-2 bg-green-600">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        {t("assign.assigned")}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="ml-2">
                        {t("assign.pending")}
                      </Badge>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {selectedAppointment && currentAppointment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("assign.assignTitle")}
            </CardTitle>
            <CardDescription>
              {t("assign.customer")}: <span className="font-medium text-foreground">{customerName}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">{t("assign.serviceType")}</p>
                <p className="font-medium">{currentAppointment.service_type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("assign.zipCode")}</p>
                <p className="font-medium">{currentAppointment.zip_code}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("assign.appointmentDate")}</p>
                <p className="font-medium">{formatLocalDate(currentAppointment.appointment_date)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">{t("assign.serviceArea")}</p>
                <div className="mt-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <p className="font-medium">
                    {serviceAreaMap[currentAppointment.zip_code || ""] || t("assign.unknown")}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="mb-3 text-sm font-medium">{t("assign.availableMechanics")}</p>
              <div className="space-y-2">
                {getAvailableMechanics(currentAppointment.zip_code).map((mechanic) => (
                  <div
                    key={mechanic.id}
                    className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${assignedMechanics[selectedAppointment] === mechanic.id
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                      }`}
                    onClick={() => handleAssignMechanic(selectedAppointment, mechanic.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{mechanic.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{mechanic.phone}</p>
                        {(mechanic.specialties || []).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {(mechanic.specialties || []).map((specialty) => (
                              <Badge key={specialty} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Badge
                        className={
                          (mechanic.availability || "available") === "available"
                            ? "bg-green-600"
                            : "bg-yellow-600"
                        }
                      >
                        {(mechanic.availability || "available") === "available" ? t("assign.available") : t("assign.busy")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!getAvailableMechanics(currentAppointment.zip_code).length && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <p className="text-sm text-yellow-800">
                  {t("assign.noMechanics")}
                </p>
              </div>
            )}

            <div className="space-y-2 border-t pt-4">
              <p className="text-xs text-muted-foreground">{t("assign.smsHelper")}</p>
              <Button
                type="button"
                className="w-full"
                onClick={handleSendSms}
                disabled={!selectedMechanic || isSendingSms}
              >
                {isSendingSms ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("assign.sendingSms")}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {t("assign.sendSms")}
                  </>
                )}
              </Button>

              {smsFeedback && (
                <div
                  className={`rounded-md border px-3 py-2 text-sm ${smsFeedback.tone === "success"
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-800"
                    }`}
                >
                  {smsFeedback.message}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
