"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MapPin, CheckCircle2, AlertCircle } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { formatLocalDate } from "@/lib/date-utils"

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

// Example mechanic data
const exampleMechanics = [
  {
    id: "m1",
    name: "Carlos Rodríguez",
    serviceArea: "Central Sacramento",
    phone: "(916) 555-0101",
    availability: "available",
    specialties: ["Oil Change", "Battery", "Brakes"],
  },
  {
    id: "m2",
    name: "Miguel Hernández",
    serviceArea: "East Sacramento",
    phone: "(916) 555-0102",
    availability: "available",
    specialties: ["Engine Repair", "Diagnostics", "A/C"],
  },
  {
    id: "m3",
    name: "Juan García",
    serviceArea: "South Sacramento",
    phone: "(916) 555-0103",
    availability: "available",
    specialties: ["Tire Service", "Maintenance", "General Repairs"],
  },
  {
    id: "m4",
    name: "Pedro López",
    serviceArea: "North Sacramento",
    phone: "(916) 555-0104",
    availability: "busy",
    specialties: ["Oil Change", "Diagnostics"],
  },
  {
    id: "m5",
    name: "David Morales",
    serviceArea: "West Sacramento",
    phone: "(916) 555-0105",
    availability: "available",
    specialties: ["Engine Repair", "Oil Change", "Brakes"],
  },
  {
    id: "m6",
    name: "Robert Chen",
    serviceArea: "East Sacramento",
    phone: "(916) 555-0106",
    availability: "available",
    specialties: ["A/C Repair", "Diagnostics", "Electrical"],
  },
]

interface Appointment {
  id: string
  customer_name?: string
  first_name?: string
  last_name?: string
  zip_code?: string
  service_type?: string
  appointment_date?: string
  status?: string
  assigned_mechanic?: string
}

interface MechanicAssignmentPanelProps {
  appointments: Appointment[]
  onAssignMechanic?: (appointmentId: string, mechanicId: string) => void
}

export function MechanicAssignmentPanel({
  appointments,
  onAssignMechanic,
}: MechanicAssignmentPanelProps) {
  const { t } = useI18n()
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null)
  const [assignedMechanics, setAssignedMechanics] = useState<Record<string, string>>({})

  // Filter pending appointments
  const pendingAppointments = appointments.filter((a) => a.status === "pending")

  const handleAssignMechanic = (appointmentId: string, mechanicId: string) => {
    setAssignedMechanics((prev) => ({
      ...prev,
      [appointmentId]: mechanicId,
    }))
    onAssignMechanic?.(appointmentId, mechanicId)
  }

  const getAvailableMechanics = (zipCode?: string) => {
    const serviceArea = zipCode ? serviceAreaMap[zipCode] : "Central Sacramento"
    return exampleMechanics.filter((m) => m.serviceArea === serviceArea)
  }

  const currentAppointment = pendingAppointments.find((a) => a.id === selectedAppointment)
  const customerName = currentAppointment
    ? `${currentAppointment.first_name || ""} ${currentAppointment.last_name || ""}`.trim()
    : ""

  if (pendingAppointments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">{t("assign.noPending")}</h3>
          <p className="text-muted-foreground">{t("assign.noPendingDesc")}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6">
      {/* Appointment List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {t("assign.pendingTitle")}
          </CardTitle>
          <CardDescription>
            {pendingAppointments.length} {t("assign.waitingCount")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {pendingAppointments.map((apt) => {
              const customerName = `${apt.first_name || ""} ${apt.last_name || ""}`.trim()
              const isSelected = selectedAppointment === apt.id
              const isMechanicAssigned = assignedMechanics[apt.id]

              return (
                <button
                  key={apt.id}
                  onClick={() => setSelectedAppointment(apt.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${isSelected
                    ? "border-primary bg-primary/5"
                    : isMechanicAssigned
                      ? "border-green-200 bg-green-50"
                      : "border-muted hover:border-muted-foreground/30"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{customerName || t("assign.unknown")}</p>
                      <p className="text-xs text-muted-foreground">
                        {apt.service_type} • {apt.zip_code}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatLocalDate(apt.appointment_date)}
                      </p>
                    </div>
                    {isMechanicAssigned ? (
                      <Badge className="ml-2 bg-green-600">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
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

      {/* Mechanic Assignment */}
      {selectedAppointment && currentAppointment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
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
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  <p className="font-medium">
                    {serviceAreaMap[currentAppointment.zip_code || ""] || t("assign.unknown")}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">{t("assign.availableMechanics")}</p>
              <div className="space-y-2">
                {getAvailableMechanics(currentAppointment.zip_code).map((mechanic) => (
                  <div
                    key={mechanic.id}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${assignedMechanics[selectedAppointment] === mechanic.id
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                      }`}
                    onClick={() => handleAssignMechanic(selectedAppointment, mechanic.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{mechanic.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{mechanic.phone}</p>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {mechanic.specialties.map((spec) => (
                            <Badge key={spec} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Badge
                        className={
                          mechanic.availability === "available"
                            ? "bg-green-600"
                            : "bg-yellow-600"
                        }
                      >
                        {mechanic.availability === "available" ? t("assign.available") : t("assign.busy")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!getAvailableMechanics(currentAppointment.zip_code).length && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  {t("assign.noMechanics")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
