"use client"

import { useRef } from "react"
import { Header } from "@/components/header"
import { BookingFlow } from "@/components/booking/booking-flow"
import { ReviewsSection } from "@/components/reviews/reviews-section"
import { useI18n } from "@/lib/i18n"
import { Star, FileText, Wrench, ShieldCheck, DollarSign } from "lucide-react"
import type { ApprovedReviewsPayload } from "@/lib/review-service"

interface HomePageContentProps {
  initialReviews: ApprovedReviewsPayload
  serviceZipCodes: string[]
}

export function HomePageContent({ initialReviews, serviceZipCodes }: HomePageContentProps) {
  const { t } = useI18n()
  const resetRef = useRef<(() => void) | null>(null)

  const handleLogoClick = () => {
    resetRef.current?.()
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onLogoClick={handleLogoClick} />

      <main className="flex-1">
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-foreground mb-3">{t("booking.title")}</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                {t("booking.subtitle")}
              </p>
            </div>

            <BookingFlow onResetRef={resetRef} serviceZipCodes={serviceZipCodes} />
          </div>
        </section>

        <section className="py-12 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
              <div className="flex-shrink-0 w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-9 h-9 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">
                  {t("promo.buyTitle")}
                </h2>
                <p className="text-lg font-semibold opacity-90">
                  {t("promo.buySubtitle")}
                </p>
                <p className="text-sm opacity-75 mt-1">
                  {t("promo.buyDesc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t("trusted.title")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("trusted.quality")}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t("trusted.qualityDesc")}
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("trusted.estimates")}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t("trusted.estimatesDesc")}
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Wrench className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("trusted.care")}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t("trusted.careDesc")}
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("trusted.warranty")}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t("trusted.warrantyDesc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <ReviewsSection initialData={initialReviews} />
      </main>

      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Rapi Mobile Mechanic. {t("footer.rights")}</p>
          <p className="text-sm mt-2">{t("footer.serving")}</p>
        </div>
      </footer>
    </div>
  )
}
