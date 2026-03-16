"use client"

import { type FormEvent, useMemo, useState } from "react"
import { Loader2, MessageSquareQuote, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/lib/i18n"
import { inferServiceOptionId } from "@/lib/service-options"
import { RatingStars } from "@/components/reviews/rating-stars"

interface BookingFeedbackCardProps {
  reviewerName: string
  reviewerEmail: string
  serviceType: string
}

export function BookingFeedbackCard({
  reviewerName,
  reviewerEmail,
  serviceType,
}: BookingFeedbackCardProps) {
  const { t } = useI18n()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState("")

  const inferredServiceType = useMemo(() => inferServiceOptionId(serviceType) || "", [serviceType])
  const isReadyToSubmit = rating > 0 && comment.trim().length >= 20

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isReadyToSubmit) return

    setIsSubmitting(true)
    setSubmitError("")
    setSubmitSuccess("")

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewerName,
          reviewerEmail,
          rating,
          comment,
          serviceType: inferredServiceType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit review")
      }

      setSubmitSuccess(t("reviews.submitSuccess"))
      setRating(0)
      setComment("")
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t("reviews.submitError"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-primary/15 bg-[linear-gradient(135deg,rgba(12,74,110,0.05),rgba(255,255,255,0.92))] shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MessageSquareQuote className="h-6 w-6" />
        </div>
        <div>
          <CardTitle className="text-lg">Optional booking feedback</CardTitle>
          <CardDescription>
            Rate how the booking process felt. You can skip this for now and submit it later from the public reviews section.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {submitSuccess ? (
          <div className="rounded-xl border border-accent/20 bg-accent/10 px-4 py-4 text-sm text-accent">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <ShieldCheck className="h-4 w-4" />
              Feedback received
            </div>
            <p>{submitSuccess}</p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="rounded-xl border border-border/70 bg-background/80 px-4 py-3">
              <p className="mb-2 text-sm font-medium">{t("reviews.ratingLabel")}</p>
              <RatingStars rating={rating} onChange={setRating} />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">{t("reviews.commentLabel")}</p>
              <Textarea
                rows={4}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Tell us what felt clear, confusing, fast or helpful during booking."
                className="resize-none bg-background/80"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 20 characters. Feedback is reviewed before anything is shown publicly.
              </p>
            </div>

            {submitError && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {submitError}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={!isReadyToSubmit || isSubmitting}>
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
        )}
      </CardContent>
    </Card>
  )
}
