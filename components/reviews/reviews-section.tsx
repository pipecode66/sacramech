"use client"

import { type FormEvent, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { MessageSquareQuote, Loader2, ShieldCheck } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import type { ApprovedReviewsPayload } from "@/lib/review-service"
import { REVIEW_SERVICE_OPTIONS, getReviewServiceLabel, type PublicReview } from "@/lib/reviews"
import { RatingStars } from "./rating-stars"

const PAGE_SIZE = 6

const initialForm = {
  reviewerName: "",
  reviewerEmail: "",
  rating: 0,
  comment: "",
  serviceType: "",
}

interface ReviewsSectionProps {
  initialData: ApprovedReviewsPayload
}

export function ReviewsSection({ initialData }: ReviewsSectionProps) {
  const { locale, t } = useI18n()
  const [reviews, setReviews] = useState<PublicReview[]>(initialData.reviews)
  const [averageRating, setAverageRating] = useState(initialData.averageRating)
  const [totalApproved, setTotalApproved] = useState(initialData.totalApproved)
  const [hasMore, setHasMore] = useState(initialData.hasMore)
  const [isLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState("")
  const [form, setForm] = useState(initialForm)

  const dateFormatter = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const loadReviews = async (offset = 0, append = false) => {
    if (append) {
      setIsLoadingMore(true)
    }

    try {
      const response = await fetch(`/api/reviews?limit=${PAGE_SIZE}&offset=${offset}`, {
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Failed to load reviews")
      }

      const data = (await response.json()) as ApprovedReviewsPayload
      setReviews((currentReviews) => (append ? [...currentReviews, ...data.reviews] : data.reviews))
      setAverageRating(data.averageRating)
      setTotalApproved(data.totalApproved)
      setHasMore(data.hasMore)
      setLoadError("")
    } catch (error) {
      console.error("Error fetching reviews:", error)
      setLoadError(t("reviews.loadError"))
    } finally {
      if (append) {
        setIsLoadingMore(false)
      }
    }
  }

  const handleFormChange = (field: keyof typeof initialForm, value: string | number) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError("")
    setSubmitSuccess("")
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit review")
      }

      setForm(initialForm)
      setSubmitSuccess(t("reviews.submitSuccess"))
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t("reviews.submitError"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      id="reviews"
      className="border-t border-border/60 bg-[linear-gradient(180deg,rgba(6,54,124,0.03),rgba(255,255,255,0))] py-20"
    >
      <div className="container mx-auto px-4">
        <div className="mb-10 max-w-2xl">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/10">
            {t("reviews.badge")}
          </Badge>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">{t("reviews.title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("reviews.subtitle")}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <CardTitle className="text-2xl">{averageRating ? averageRating.toFixed(1) : "0.0"}</CardTitle>
                <CardDescription>{t("reviews.summaryLabel")}</CardDescription>
              </div>
              <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3">
                <RatingStars rating={Math.round(averageRating)} />
                <p className="mt-2 text-sm text-muted-foreground">
                  {totalApproved} {t("reviews.totalLabel")}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : loadError ? (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-6 text-sm text-destructive">
                  {loadError}
                </div>
              ) : reviews.length === 0 ? (
                <Empty className="border border-dashed border-border/70">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <MessageSquareQuote className="h-5 w-5" />
                    </EmptyMedia>
                    <EmptyTitle>{t("reviews.emptyTitle")}</EmptyTitle>
                    <EmptyDescription>{t("reviews.emptyDesc")}</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    {reviews.map((review) => (
                      <article key={review.id} className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-foreground">{review.reviewer_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {dateFormatter.format(new Date(review.created_at))}
                            </p>
                          </div>
                          <RatingStars rating={review.rating} size="sm" />
                        </div>

                        {review.service_type && (
                          <Badge variant="outline" className="mt-3">
                            {getReviewServiceLabel(review.service_type, t)}
                          </Badge>
                        )}

                        <p className="mt-4 text-sm leading-6 text-foreground/90">{review.comment}</p>
                      </article>
                    ))}
                  </div>

                  {hasMore && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-transparent"
                      disabled={isLoadingMore}
                      onClick={() => void loadReviews(reviews.length, true)}
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("reviews.loadingMore")}
                        </>
                      ) : (
                        t("reviews.loadMore")
                      )}
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <CardTitle>{t("reviews.formTitle")}</CardTitle>
              <CardDescription>{t("reviews.formSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="reviewerName">{t("reviews.nameLabel")}</Label>
                    <Input
                      id="reviewerName"
                      required
                      value={form.reviewerName}
                      onChange={(event) => handleFormChange("reviewerName", event.target.value)}
                      placeholder={t("reviews.namePlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reviewerEmail">{t("reviews.emailLabel")}</Label>
                    <Input
                      id="reviewerEmail"
                      type="email"
                      required
                      value={form.reviewerEmail}
                      onChange={(event) => handleFormChange("reviewerEmail", event.target.value)}
                      placeholder={t("reviews.emailPlaceholder")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("reviews.ratingLabel")}</Label>
                  <div className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3">
                    <RatingStars rating={form.rating} onChange={(rating) => handleFormChange("rating", rating)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceType">{t("reviews.serviceLabel")}</Label>
                  <Select
                    value={form.serviceType || "none"}
                    onValueChange={(value) => handleFormChange("serviceType", value === "none" ? "" : value)}
                  >
                    <SelectTrigger id="serviceType">
                      <SelectValue placeholder={t("reviews.servicePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("reviews.serviceOptional")}</SelectItem>
                      {REVIEW_SERVICE_OPTIONS.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {t(service.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reviewComment">{t("reviews.commentLabel")}</Label>
                  <Textarea
                    id="reviewComment"
                    rows={5}
                    required
                    value={form.comment}
                    onChange={(event) => handleFormChange("comment", event.target.value)}
                    placeholder={t("reviews.commentPlaceholder")}
                    className="resize-none"
                  />
                </div>

                {submitError && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {submitError}
                  </div>
                )}

                {submitSuccess && (
                  <div className="rounded-xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent">
                    {submitSuccess}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || form.rating === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("reviews.submitting")}
                    </>
                  ) : (
                    t("reviews.submit")
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
