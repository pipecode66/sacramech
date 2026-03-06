import type { TranslationKey } from "@/lib/i18n"

export type ReviewStatus = "pending" | "approved" | "rejected"

export interface ReviewRecord {
  id: string
  reviewer_name: string
  reviewer_email: string
  rating: number
  comment: string
  service_type: string | null
  status: ReviewStatus
  created_at: string
  approved_at: string | null
}

export interface PublicReview {
  id: string
  reviewer_name: string
  rating: number
  comment: string
  service_type: string | null
  created_at: string
}

export const REVIEW_SERVICE_OPTIONS = [
  { id: "oil-change", labelKey: "service.oilChange" },
  { id: "battery-replacement", labelKey: "service.battery" },
  { id: "brake-service", labelKey: "service.brake" },
  { id: "ac-repair", labelKey: "service.ac" },
  { id: "tire-service", labelKey: "service.tire" },
  { id: "engine-repair", labelKey: "service.engine" },
  { id: "general-maintenance", labelKey: "service.maintenance" },
  { id: "full-diagnostic", labelKey: "service.diagnostic" },
] as const

export function getReviewServiceLabel(
  serviceType: string | null | undefined,
  t: (key: TranslationKey) => string,
) {
  if (!serviceType) return null

  const matchedService = REVIEW_SERVICE_OPTIONS.find((option) => option.id === serviceType)
  return matchedService ? t(matchedService.labelKey) : serviceType
}
