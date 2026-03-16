import { HomePageContent } from "@/components/home-page-content"
import { getApprovedReviews, getReviewsStructuredData } from "@/lib/review-service"
import { getServiceZipCodes } from "@/lib/service-zip-codes"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [initialReviews, serviceZipCodes] = await Promise.all([getApprovedReviews(), getServiceZipCodes()])
  const reviewStructuredData = getReviewsStructuredData(initialReviews)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewStructuredData) }}
      />
      <HomePageContent initialReviews={initialReviews} serviceZipCodes={serviceZipCodes} />
    </>
  )
}
