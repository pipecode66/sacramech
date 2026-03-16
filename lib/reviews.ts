import type { TranslationKey } from "@/lib/i18n"
import { BOOKING_SERVICE_OPTIONS, getServiceLabelKeyById } from "@/lib/service-options"

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

export const REVIEW_SERVICE_OPTIONS = BOOKING_SERVICE_OPTIONS.map((service) => ({
  id: service.id,
  labelKey: service.labelKey,
})) as ReadonlyArray<{ id: string; labelKey: TranslationKey }>

export function getReviewServiceLabel(
  serviceType: string | null | undefined,
  t: (key: TranslationKey) => string,
) {
  if (!serviceType) return null

  const labelKey = getServiceLabelKeyById(serviceType)
  return labelKey ? t(labelKey) : serviceType
}
