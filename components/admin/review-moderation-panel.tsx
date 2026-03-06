"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { deleteReview, updateReviewStatus } from "@/app/admin/actions"
import { useI18n } from "@/lib/i18n"
import { getReviewServiceLabel, type ReviewRecord, type ReviewStatus } from "@/lib/reviews"
import { RatingStars } from "@/components/reviews/rating-stars"
import { MessageSquareQuote, Loader2, Trash2 } from "lucide-react"

interface ReviewModerationPanelProps {
  reviews: ReviewRecord[]
}

type ReviewFilter = "all" | ReviewStatus

export function ReviewModerationPanel({ reviews }: ReviewModerationPanelProps) {
  const { locale, t } = useI18n()
  const router = useRouter()
  const [filter, setFilter] = useState<ReviewFilter>("all")
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const dateFormatter = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const filteredReviews = reviews.filter((review) => filter === "all" || review.status === filter)
  const pendingCount = reviews.filter((review) => review.status === "pending").length
  const approvedCount = reviews.filter((review) => review.status === "approved").length
  const rejectedCount = reviews.filter((review) => review.status === "rejected").length

  const statusStyles: Record<ReviewStatus, string> = {
    pending: "border-yellow-200 bg-yellow-50 text-yellow-800",
    approved: "border-green-200 bg-green-50 text-green-800",
    rejected: "border-red-200 bg-red-50 text-red-800",
  }
  const statusLabels: Record<ReviewStatus, "reviews.status.pending" | "reviews.status.approved" | "reviews.status.rejected"> = {
    pending: "reviews.status.pending",
    approved: "reviews.status.approved",
    rejected: "reviews.status.rejected",
  }

  const runReviewAction = (reviewId: string, action: () => Promise<{ error?: string } | { success: true }>) => {
    setActiveReviewId(reviewId)
    startTransition(async () => {
      const result = await action()
      if ("success" in result) {
        router.refresh()
      }
      setActiveReviewId(null)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
          {t("reviews.admin.filterAll")} ({reviews.length})
        </Button>
        <Button variant={filter === "pending" ? "default" : "outline"} onClick={() => setFilter("pending")}>
          {t("reviews.admin.filterPending")} ({pendingCount})
        </Button>
        <Button variant={filter === "approved" ? "default" : "outline"} onClick={() => setFilter("approved")}>
          {t("reviews.admin.filterApproved")} ({approvedCount})
        </Button>
        <Button variant={filter === "rejected" ? "default" : "outline"} onClick={() => setFilter("rejected")}>
          {t("reviews.admin.filterRejected")} ({rejectedCount})
        </Button>
      </div>

      {filteredReviews.length === 0 ? (
        <Empty className="border border-dashed border-border/70 bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquareQuote className="h-5 w-5" />
            </EmptyMedia>
            <EmptyTitle>{t("reviews.admin.emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("reviews.admin.emptyDesc")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4">
          {filteredReviews.map((review) => {
            const isActive = isPending && activeReviewId === review.id

            return (
              <Card key={review.id} className="border-border/70 shadow-sm">
                <CardContent className="space-y-4 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">{review.reviewer_name}</p>
                        <Badge className={statusStyles[review.status]}>{t(statusLabels[review.status])}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.reviewer_email}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <RatingStars rating={review.rating} size="sm" />
                        <span>{dateFormatter.format(new Date(review.created_at))}</span>
                        {review.service_type && (
                          <Badge variant="outline">{getReviewServiceLabel(review.service_type, t)}</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {review.status !== "approved" && (
                        <Button
                          size="sm"
                          onClick={() => runReviewAction(review.id, () => updateReviewStatus(review.id, "approved"))}
                          disabled={isActive}
                        >
                          {isActive ? <Loader2 className="h-4 w-4 animate-spin" /> : t("reviews.admin.approve")}
                        </Button>
                      )}
                      {review.status !== "rejected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runReviewAction(review.id, () => updateReviewStatus(review.id, "rejected"))}
                          disabled={isActive}
                        >
                          {t("reviews.admin.reject")}
                        </Button>
                      )}
                      {review.status !== "pending" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => runReviewAction(review.id, () => updateReviewStatus(review.id, "pending"))}
                          disabled={isActive}
                        >
                          {t("reviews.admin.markPending")}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => runReviewAction(review.id, () => deleteReview(review.id))}
                        disabled={isActive}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        {t("reviews.admin.delete")}
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm leading-6 text-foreground/90">{review.comment}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
