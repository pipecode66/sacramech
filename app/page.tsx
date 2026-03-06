import { HomePageContent } from "@/components/home-page-content"
import { getApprovedReviews, getReviewsStructuredData } from "@/lib/review-service"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const initialReviews = await getApprovedReviews()
  const reviewStructuredData = getReviewsStructuredData(initialReviews)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewStructuredData) }}
      />
      <HomePageContent initialReviews={initialReviews} />
    </>
  )
}
