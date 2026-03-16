import type { TranslationKey } from "@/lib/i18n"

export interface ServiceOption {
  id: string
  labelKey: TranslationKey
  descKey: TranslationKey
}

export const BOOKING_SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: "oil-change",
    labelKey: "service.oilChange",
    descKey: "service.oilChangeDesc",
  },
  {
    id: "battery-replacement",
    labelKey: "service.battery",
    descKey: "service.batteryDesc",
  },
  {
    id: "brake-service",
    labelKey: "service.brake",
    descKey: "service.brakeDesc",
  },
  {
    id: "engine-repair",
    labelKey: "service.engine",
    descKey: "service.engineDesc",
  },
  {
    id: "general-maintenance",
    labelKey: "service.maintenance",
    descKey: "service.maintenanceDesc",
  },
]

const LEGACY_SERVICE_LABEL_KEYS: Record<string, TranslationKey> = {
  "ac-repair": "service.maintenance",
  "tire-service": "service.maintenance",
  "full-diagnostic": "service.engine",
}

const SERVICE_KEYWORDS: Array<{ id: string; keywords: string[] }> = [
  { id: "oil-change", keywords: ["oil", "aceite", "filter", "filtro"] },
  { id: "battery-replacement", keywords: ["battery", "bateria", "terminal"] },
  { id: "brake-service", keywords: ["brake", "freno", "rotor", "pad"] },
  { id: "engine-repair", keywords: ["engine", "motor", "spark", "coil", "timing"] },
  {
    id: "general-maintenance",
    keywords: [
      "maintenance",
      "mantenimiento",
      "tune",
      "fluid",
      "belt",
      "wiper",
      "a/c",
      "ac",
      "air conditioning",
      "tire",
      "diagnostic",
      "llanta",
    ],
  },
]

function normalizeServiceText(value?: string | null) {
  return (value || "").trim().toLowerCase()
}

export function getServiceLabelKeyById(serviceId: string): TranslationKey | null {
  const activeService = BOOKING_SERVICE_OPTIONS.find((service) => service.id === serviceId)
  if (activeService) {
    return activeService.labelKey
  }

  return LEGACY_SERVICE_LABEL_KEYS[serviceId] || null
}

export function inferServiceOptionId(serviceText?: string | null) {
  const normalized = normalizeServiceText(serviceText)

  for (const matcher of SERVICE_KEYWORDS) {
    if (matcher.keywords.some((keyword) => normalized.includes(keyword))) {
      return matcher.id
    }
  }

  return null
}
