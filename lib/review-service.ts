import "server-only"

import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { PublicReview } from "@/lib/reviews"

export interface ApprovedReviewsPayload {
  reviews: PublicReview[]
  averageRating: number
  totalApproved: number
  hasMore: boolean
}

export async function getApprovedReviews(limit = 6, offset = 0): Promise<ApprovedReviewsPayload> {
  try {
    const supabaseAdmin = getSupabaseAdminClient()

    const [{ data: reviews, count, error }, { data: approvedRatings, error: ratingError }] = await Promise.all([
      supabaseAdmin
        .from("reviews")
        .select("id, reviewer_name, rating, comment, service_type, created_at", { count: "exact" })
        .eq("status", "approved")
        .order("approved_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1),
      supabaseAdmin.from("reviews").select("rating").eq("status", "approved"),
    ])

    if (error || ratingError) {
      throw error || ratingError
    }

    const totalApproved = count || 0
    const averageRating = approvedRatings?.length
      ? approvedRatings.reduce((sum, review) => sum + review.rating, 0) / approvedRatings.length
      : 0

    return {
      reviews: reviews || [],
      averageRating: Number(averageRating.toFixed(1)),
      totalApproved,
      hasMore: offset + (reviews?.length || 0) < totalApproved,
    }
  } catch (error) {
    console.error("Error loading approved reviews:", error)
    return {
      reviews: [],
      averageRating: 0,
      totalApproved: 0,
      hasMore: false,
    }
  }
}

export function getReviewsStructuredData({
  reviews,
  averageRating,
  totalApproved,
}: Pick<ApprovedReviewsPayload, "reviews" | "averageRating" | "totalApproved">) {
  const graph: Array<Record<string, unknown>> = [
    {
      "@type": "AutoRepair",
      "@id": "#business",
      name: "Rapi Mobile Mechanic",
      areaServed: "Sacramento, California",
    },
  ]

  if (totalApproved > 0) {
    graph[0].aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: averageRating.toFixed(1),
      reviewCount: String(totalApproved),
      bestRating: "5",
      worstRating: "1",
    }
  }

  if (reviews.length > 0) {
    graph.push({
      "@type": "ItemList",
      "@id": "#customer-reviews",
      name: "Customer reviews",
      numberOfItems: reviews.length,
      itemListElement: reviews.map((review, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Review",
          author: {
            "@type": "Person",
            name: review.reviewer_name,
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: String(review.rating),
            bestRating: "5",
            worstRating: "1",
          },
          reviewBody: review.comment,
          datePublished: review.created_at.split("T")[0],
          itemReviewed: {
            "@id": "#business",
          },
        },
      })),
    })
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  }
}
