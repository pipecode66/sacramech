"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Users, Plus, X, CheckCircle2, Loader2 } from "lucide-react"
import { SACRAMENTO_ZIP_CODES } from "@/lib/sacramento-zip-codes"
import { useI18n } from "@/lib/i18n"
import { createTechnician, deleteTechnician } from "@/app/admin/actions"

interface Technician {
  id: string
  name: string
  area: string
  phone: string | null
  join_date: string | null
  availability?: string | null
  specialties?: string[] | null
}

interface AdminSettingsPanelProps {
  technicians: Technician[]
}

const COUNTRY_PREFIX_OPTIONS = [
  { value: "+1", label: "🇺🇸 +1 (US/CA)" },
  { value: "+57", label: "🇨🇴 +57 (Colombia)" },
  { value: "+52", label: "🇲🇽 +52 (Mexico)" },
  { value: "+34", label: "🇪🇸 +34 (Spain)" },
  { value: "+44", label: "🇬🇧 +44 (UK)" },
  { value: "+49", label: "🇩🇪 +49 (Germany)" },
  { value: "+33", label: "🇫🇷 +33 (France)" },
  { value: "+54", label: "🇦🇷 +54 (Argentina)" },
  { value: "+55", label: "🇧🇷 +55 (Brazil)" },
  { value: "+56", label: "🇨🇱 +56 (Chile)" },
  { value: "+51", label: "🇵🇪 +51 (Peru)" },
]

export function AdminSettingsPanel({ technicians: initialTechnicians }: AdminSettingsPanelProps) {
  const { t } = useI18n()
  const router = useRouter()

  // ZIP codes state - start from the imported list
  const [zipCodes, setZipCodes] = useState<string[]>([...SACRAMENTO_ZIP_CODES])
  const [newZip, setNewZip] = useState("")
  const [zipAdded, setZipAdded] = useState(false)
  const [zipError, setZipError] = useState("")

  // Technicians state
  const [technicians, setTechnicians] = useState<Technician[]>(initialTechnicians)
  const [newTechName, setNewTechName] = useState("")
  const [newTechArea, setNewTechArea] = useState("")
  const [newTechCountryCode, setNewTechCountryCode] = useState("+1")
  const [newTechPhone, setNewTechPhone] = useState("")
  const [newTechJoinDate, setNewTechJoinDate] = useState("")
  const [techAdded, setTechAdded] = useState(false)
  const [techError, setTechError] = useState("")
  const [isSavingTech, setIsSavingTech] = useState(false)
  const [deletingTechId, setDeletingTechId] = useState<string | null>(null)

  useEffect(() => {
    setTechnicians(initialTechnicians)
  }, [initialTechnicians])

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

  const handleAddTech = async () => {
    if (!newTechName.trim() || isSavingTech) return

    setTechError("")
    setIsSavingTech(true)

    const result = await createTechnician({
      name: newTechName,
      area: newTechArea,
      countryCode: newTechCountryCode,
      phone: newTechPhone,
      joinDate: newTechJoinDate,
    })

    if (result.error || !result.success || !result.technician) {
      setTechError(result.error || "Could not add technician.")
      setIsSavingTech(false)
      return
    }

    setTechnicians((prev) =>
      [...prev, result.technician].sort((a, b) => a.name.localeCompare(b.name))
    )
    setNewTechName("")
    setNewTechArea("")
    setNewTechPhone("")
    setNewTechJoinDate("")
    setTechAdded(true)
    setTimeout(() => setTechAdded(false), 3000)
    setIsSavingTech(false)
    router.refresh()
  }

  const handleRemoveTech = async (id: string) => {
    if (deletingTechId) return

    setTechError("")
    setDeletingTechId(id)

    const result = await deleteTechnician(id)

    if (result.error) {
      setTechError(result.error)
      setDeletingTechId(null)
      return
    }

    setTechnicians((prev) => prev.filter((tech) => tech.id !== id))
    setDeletingTechId(null)
    router.refresh()
  }

  return (
    <div className="grid gap-6">
      {/* ZIP Codes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
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
              <Plus className="mr-1 h-4 w-4" />
              {t("admin.settings.zipAdd")}
            </Button>
          </div>

          {zipError && (
            <p className="text-sm text-destructive">{zipError}</p>
          )}

          {zipAdded && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              {t("admin.settings.zipAdded")}
            </div>
          )}

          <div className="flex max-h-64 flex-wrap gap-2 overflow-y-auto p-1">
            {[...zipCodes].sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10)).map((zip) => (
              <Badge
                key={zip}
                variant="outline"
                className="flex items-center gap-1 py-1 text-sm"
              >
                {zip}
                <button
                  onClick={() => handleRemoveZip(zip)}
                  className="ml-1 transition-colors hover:text-destructive"
                  aria-label={`Remove ${zip}`}
                >
                  <X className="h-3 w-3" />
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
            <Users className="h-5 w-5" />
            {t("admin.settings.techTitle")}
          </CardTitle>
          <CardDescription>{t("admin.settings.techDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[220px,1fr]">
            <Select value={newTechCountryCode} onValueChange={setNewTechCountryCode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_PREFIX_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Local number (without country code)"
              value={newTechPhone}
              onChange={(e) => setNewTechPhone(e.target.value.replace(/\D/g, "").slice(0, 15))}
              onKeyDown={(e) => e.key === "Enter" && handleAddTech()}
              maxLength={15}
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
            <Button onClick={handleAddTech} disabled={!newTechName.trim() || isSavingTech}>
              {isSavingTech ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-1 h-4 w-4" />
              )}
              {t("admin.settings.techAdd")}
            </Button>
          </div>

          {techError && (
            <p className="text-sm text-destructive">{techError}</p>
          )}

          {techAdded && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              {t("admin.settings.techAddedMsg")}
            </div>
          )}

          <div className="max-h-72 space-y-2 overflow-y-auto">
            {[...technicians].sort((a, b) => a.name.localeCompare(b.name)).map((tech) => (
              <div
                key={tech.id}
                className="flex items-center justify-between rounded-lg border bg-card p-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{tech.name}</p>
                  <p className="text-xs text-muted-foreground">{tech.area}</p>
                  {tech.phone && <p className="text-xs text-muted-foreground">{tech.phone}</p>}
                  {tech.join_date && <p className="text-xs text-muted-foreground">{t("admin.settings.joined")}: {tech.join_date}</p>}
                </div>
                <button
                  onClick={() => handleRemoveTech(tech.id)}
                  disabled={deletingTechId === tech.id}
                  className="ml-2 p-1 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                  aria-label={`Remove ${tech.name}`}
                >
                  {deletingTechId === tech.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
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
