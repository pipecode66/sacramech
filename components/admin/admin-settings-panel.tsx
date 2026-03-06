"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Plus, X, CheckCircle2 } from "lucide-react"
import { SACRAMENTO_ZIP_CODES } from "@/lib/sacramento-zip-codes"
import { useI18n } from "@/lib/i18n"

// Initial technician list (mirrored from mechanic-assignment-panel)
const defaultTechnicians = [
  { id: "m1", name: "Carlos Rodríguez", area: "Central Sacramento", phone: "", joinDate: "" },
  { id: "m2", name: "Miguel Hernández", area: "East Sacramento", phone: "", joinDate: "" },
  { id: "m3", name: "Juan García", area: "South Sacramento", phone: "", joinDate: "" },
  { id: "m4", name: "Pedro López", area: "North Sacramento", phone: "", joinDate: "" },
  { id: "m5", name: "David Morales", area: "West Sacramento", phone: "", joinDate: "" },
  { id: "m6", name: "Robert Chen", area: "East Sacramento", phone: "", joinDate: "" },
  { id: "m7", name: "Antonio Flores", area: "Southeast Sacramento (Elk Grove)", phone: "", joinDate: "" },
  { id: "m8", name: "Luis Sanchez", area: "Northeast Sacramento (Citrus Heights)", phone: "", joinDate: "" },
]

export function AdminSettingsPanel() {
  const { t } = useI18n()

  // ZIP codes state – start from the imported list
  const [zipCodes, setZipCodes] = useState<string[]>([...SACRAMENTO_ZIP_CODES])
  const [newZip, setNewZip] = useState("")
  const [zipAdded, setZipAdded] = useState(false)
  const [zipError, setZipError] = useState("")

  // Technicians state
  const [technicians, setTechnicians] = useState(defaultTechnicians)
  const [newTechName, setNewTechName] = useState("")
  const [newTechArea, setNewTechArea] = useState("")
  const [newTechPhone, setNewTechPhone] = useState("")
  const [newTechJoinDate, setNewTechJoinDate] = useState("")
  const [techAdded, setTechAdded] = useState(false)

  const handleAddZip = () => {
    const clean = newZip.trim()
    if (!clean) return
    if (!/^\d{5}$/.test(clean)) {
      setZipError("ZIP codes must be exactly 5 digits.")
      return
    }
    if (zipCodes.includes(clean)) {
      setZipError("This ZIP code is already in the list.")
      return
    }
    setZipCodes((prev) => [...prev, clean])
    setNewZip("")
    setZipError("")
    setZipAdded(true)
    setTimeout(() => setZipAdded(false), 3000)
  }

  const handleRemoveZip = (zip: string) => {
    setZipCodes((prev) => prev.filter((z) => z !== zip))
  }

  const handleAddTech = () => {
    if (!newTechName.trim()) return
    const id = `t${Date.now()}`
    setTechnicians((prev) => [
      ...prev,
      { id, name: newTechName.trim(), area: newTechArea.trim() || "General", phone: newTechPhone.trim() || "", joinDate: newTechJoinDate || "" },
    ])
    setNewTechName("")
    setNewTechArea("")
    setNewTechPhone("")
    setNewTechJoinDate("")
    setTechAdded(true)
    setTimeout(() => setTechAdded(false), 3000)
  }

  const handleRemoveTech = (id: string) => {
    setTechnicians((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="grid gap-6">
      {/* ZIP Codes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {t("admin.settings.zipTitle")}
          </CardTitle>
          <CardDescription>{t("admin.settings.zipDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder={t("admin.settings.zipPlaceholder")}
              value={newZip}
              onChange={(e) => {
                setNewZip(e.target.value.replace(/\D/g, "").slice(0, 5))
                setZipError("")
              }}
              maxLength={5}
              className="max-w-xs"
              onKeyDown={(e) => e.key === "Enter" && handleAddZip()}
            />
            <Button onClick={handleAddZip} disabled={!newZip.trim()}>
              <Plus className="w-4 h-4 mr-1" />
              {t("admin.settings.zipAdd")}
            </Button>
          </div>

          {zipError && (
            <p className="text-sm text-destructive">{zipError}</p>
          )}

          {zipAdded && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              {t("admin.settings.zipAdded")}
            </div>
          )}

          <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-1">
            {zipCodes.sort((a, b) => parseInt(a) - parseInt(b)).map((zip) => (
              <Badge
                key={zip}
                variant="outline"
                className="text-sm flex items-center gap-1 py-1"
              >
                {zip}
                <button
                  onClick={() => handleRemoveZip(zip)}
                  className="ml-1 hover:text-destructive transition-colors"
                  aria-label={`Remove ${zip}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{zipCodes.length} {t("admin.settings.zipCount")}</p>
        </CardContent>
      </Card>

      {/* Technicians Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t("admin.settings.techTitle")}
          </CardTitle>
          <CardDescription>{t("admin.settings.techDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input
              placeholder={t("admin.settings.techPlaceholder")}
              value={newTechName}
              onChange={(e) => setNewTechName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTech()}
            />
            <Input
              placeholder={t("admin.settings.techAreaPlaceholder")}
              value={newTechArea}
              onChange={(e) => setNewTechArea(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTech()}
            />
            <Input
              placeholder={t("admin.settings.phoneNumber")}
              value={newTechPhone}
              onChange={(e) => setNewTechPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              onKeyDown={(e) => e.key === "Enter" && handleAddTech()}
              maxLength={10}
            />
          </div>
          <div className="flex gap-2">
            <Input
              placeholder={t("admin.settings.joinDate")}
              type="date"
              value={newTechJoinDate}
              onChange={(e) => setNewTechJoinDate(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTech()}
            />
            <Button onClick={handleAddTech} disabled={!newTechName.trim()}>
              <Plus className="w-4 h-4 mr-1" />
              {t("admin.settings.techAdd")}
            </Button>
          </div>

          {techAdded && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              {t("admin.settings.techAddedMsg")}
            </div>
          )}

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {technicians.sort((a, b) => a.name.localeCompare(b.name)).map((tech) => (
              <div
                key={tech.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{tech.name}</p>
                  <p className="text-xs text-muted-foreground">{tech.area}</p>
                  {tech.phone && <p className="text-xs text-muted-foreground">📱 {tech.phone}</p>}
                  {tech.joinDate && <p className="text-xs text-muted-foreground">{t("admin.settings.joined")}: {tech.joinDate}</p>}
                </div>
                <button
                  onClick={() => handleRemoveTech(tech.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1 ml-2"
                  aria-label={`Remove ${tech.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{technicians.length} {t("admin.settings.techCount")}</p>
        </CardContent>
      </Card>
    </div>
  )
}
