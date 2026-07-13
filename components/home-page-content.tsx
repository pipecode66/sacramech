"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { BookingFlow } from "@/components/booking/booking-flow"
import { ReviewsSection } from "@/components/reviews/reviews-section"
import { useI18n } from "@/lib/i18n"
import { Star, FileText, Wrench, ShieldCheck, DollarSign, Phone, MapPin } from "lucide-react"
import type { ApprovedReviewsPayload } from "@/lib/review-service"
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_E164 } from "@/lib/business"

interface HomePageContentProps {
  initialReviews: ApprovedReviewsPayload
  serviceZipCodes: string[]
}

export function HomePageContent({ initialReviews, serviceZipCodes }: HomePageContentProps) {
  const { t } = useI18n()
  const resetRef = useRef<(() => void) | null>(null)
  const bookingSectionRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = "manual"

    const scrollToBooking = () => {
      window.requestAnimationFrame(() => {
        bookingSectionRef.current?.scrollIntoView({ block: "start" })
      })
    }

    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
    if (navigation?.type === "back_forward") {
      scrollToBooking()
    }

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        scrollToBooking()
      }
    }

    window.addEventListener("pageshow", handlePageShow)

    return () => {
      window.history.scrollRestoration = previousScrollRestoration
      window.removeEventListener("pageshow", handlePageShow)
    }
  }, [])

  const handleLogoClick = () => {
    resetRef.current?.()
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onLogoClick={handleLogoClick} />

      <main className="flex-1">
        <section ref={bookingSectionRef} className="py-10 sm:py-14">
          <div className="container mx-auto px-4">
            <div className="mb-5 flex justify-center sm:mb-6">
              <button
                type="button"
                onClick={handleLogoClick}
                className="group rounded-[2rem] border border-border/70 bg-background p-2 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 sm:rounded-[2.5rem] sm:p-3"
                aria-label="Return to the start of the booking form"
              >
                <span className="relative block h-28 w-28 overflow-hidden rounded-[1.65rem] bg-background sm:h-36 sm:w-36 sm:rounded-[2rem] md:h-40 md:w-40">
                  <Image
                    src="/rapi-logo.jpeg"
                    alt="Rapi Mobile Mechanic logo"
                    fill
                    priority
                    className="object-contain p-2 transition-transform group-hover:scale-[1.03] sm:p-3"
                    sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 160px"
                  />
                </span>
              </button>
            </div>

            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{t("booking.title")}</h2>
            </div>

            <BookingFlow onResetRef={resetRef} serviceZipCodes={serviceZipCodes} />
          </div>
        </section>

        <ReviewsSection
          initialData={initialReviews}
          showHeading={false}
          showShowcase
          showForm
          sectionClassName="border-t-0 bg-transparent pt-0 pb-16"
        />

        <section className="py-12 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
              <div className="flex-shrink-0 w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-9 h-9 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight mb-1">
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
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t("trusted.title")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-card rounded-lg p-6 border">
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

              <div className="bg-card rounded-lg p-6 border">
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

              <div className="bg-card rounded-lg p-6 border">
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

              <div className="bg-card rounded-lg p-6 border">
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

        <section id="business-information" className="border-t bg-background py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-primary">{t("business.eyebrow")}</p>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{t("business.title")}</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{t("business.description")}</p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
              <div className="rounded-xl border bg-card p-5">
                <Phone className="mb-4 h-7 w-7 text-primary" />
                <h3 className="font-semibold text-foreground">{t("business.contactTitle")}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("business.contactDescription")}</p>
                <a href={`tel:${BUSINESS_PHONE_E164}`} className="mt-3 inline-block font-semibold text-primary underline underline-offset-4">
                  {BUSINESS_PHONE_DISPLAY}
                </a>
              </div>

              <div className="rounded-xl border bg-card p-5">
                <Wrench className="mb-4 h-7 w-7 text-primary" />
                <h3 className="font-semibold text-foreground">{t("business.servicesTitle")}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("business.servicesDescription")}</p>
              </div>

              <div className="rounded-xl border bg-card p-5">
                <MapPin className="mb-4 h-7 w-7 text-primary" />
                <h3 className="font-semibold text-foreground">{t("business.areaTitle")}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("business.areaDescription")}</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Rapi Mobile Mechanic. {t("footer.rights")}</p>
          <p className="text-sm mt-2">{t("footer.serving")}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            <a href={`tel:${BUSINESS_PHONE_E164}`} className="font-medium text-primary underline underline-offset-2">
              {t("footer.contact")} {BUSINESS_PHONE_DISPLAY}
            </a>
            <Link href="/privacy-policy" className="font-medium text-primary underline underline-offset-2">
              {t("footer.privacy")}
            </Link>
            <Link href="/terms-of-service" className="font-medium text-primary underline underline-offset-2">
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
