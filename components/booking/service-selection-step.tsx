"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Wrench, Droplets, Battery, Disc3, Thermometer, Gauge, Settings, Search, Check } from "lucide-react"
import { useI18n } from "@/lib/i18n"

const serviceConfig = [
  { id: "oil-change", labelKey: "service.oilChange" as const, descKey: "service.oilChangeDesc" as const, icon: Droplets },
  { id: "battery-replacement", labelKey: "service.battery" as const, descKey: "service.batteryDesc" as const, icon: Battery },
  { id: "brake-service", labelKey: "service.brake" as const, descKey: "service.brakeDesc" as const, icon: Disc3 },
  { id: "ac-repair", labelKey: "service.ac" as const, descKey: "service.acDesc" as const, icon: Thermometer },
  { id: "tire-service", labelKey: "service.tire" as const, descKey: "service.tireDesc" as const, icon: Gauge },
  { id: "engine-repair", labelKey: "service.engine" as const, descKey: "service.engineDesc" as const, icon: Settings },
  { id: "general-maintenance", labelKey: "service.maintenance" as const, descKey: "service.maintenanceDesc" as const, icon: Wrench },
  { id: "full-diagnostic", labelKey: "service.diagnostic" as const, descKey: "service.diagnosticDesc" as const, icon: Search },
]

interface ServiceSelectionStepProps {
  onNext: (serviceType: string) => void
  onBack: () => void
}

export function ServiceSelectionStep({ onNext, onBack }: ServiceSelectionStepProps) {
  const { t } = useI18n()
  const [selected, setSelected] = useState<string[]>([])

  const toggleService = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selected.length > 0) {
      const labels = selected
        .map((id) => {
          const service = serviceConfig.find((s) => s.id === id)
          return service ? t(service.labelKey) : id
        })
        .join(", ")
      onNext(labels)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Wrench className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">{t("service.title")}</CardTitle>
        <CardDescription>
          {t("service.subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {serviceConfig.map((service) => {
              const Icon = service.icon
              const isSelected = selected.includes(service.id)
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggleService(service.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all ${isSelected
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-muted-foreground/30"
                    }`}
                >
                  <div
                    className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium text-sm`}>
                      {t(service.labelKey)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t(service.descKey)}</p>
                  </div>
                  {isSelected && (
                    <div className="shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {selected.length > 0 && (
            <div className="p-3 bg-primary/10 text-primary rounded-lg text-sm">
              <p className="font-medium">
                {selected.length} {selected.length === 1 ? "service" : "services"} selected
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("common.back")}
            </Button>
            <Button type="submit" className="flex-1" disabled={selected.length === 0}>
              {t("common.continue")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
