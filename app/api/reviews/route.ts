import { NextResponse } from "next/server"
import { z } from "zod"
import { getApprovedReviews } from "@/lib/review-service"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { REVIEW_SERVICE_OPTIONS } from "@/lib/reviews"

const reviewSchema = z.object({
  reviewerName: z.string().trim().min(2).max(80),
  reviewerEmail: z.string().trim().email().max(120),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(20).max(1000),
  serviceType: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || REVIEW_SERVICE_OPTIONS.some((option) => option.id === value),
      "Invalid service type",
    ),
})

function getPaginationValue(value: string | null, fallback: number) {
  const parsedValue = Number(value)

  if (!Number.isFinite(parsedValue)) return fallback
  return Math.max(0, Math.floor(parsedValue))
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(getPaginationValue(searchParams.get("limit"), 6), 12)
    const offset = getPaginationValue(searchParams.get("offset"), 0)
    return NextResponse.json(await getApprovedReviews(limit, offset))
  } catch (error) {
    console.error("Error loading reviews:", error)
    return NextResponse.json({ error: "Unable to load reviews" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsedReview = reviewSchema.safeParse(body)

    if (!parsedReview.success) {
      return NextResponse.json(
        { error: parsedReview.error.issues[0]?.message || "Invalid review payload" },
        { status: 400 },
      )
    }

    const supabaseAdmin = getSupabaseAdminClient()
    const { reviewerName, reviewerEmail, rating, comment, serviceType } = parsedReview.data

    const { error } = await supabaseAdmin.from("reviews").insert({
      reviewer_name: reviewerName.trim(),
      reviewer_email: reviewerEmail.trim().toLowerCase(),
      rating,
      comment: comment.trim(),
      service_type: serviceType || null,
      status: "pending",
    })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Unable to submit review" }, { status: 500 })
  }
}
