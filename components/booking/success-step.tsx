"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Calendar, MapPin, User, Mail, Phone, Car, Wrench, Clock } from "lucide-react"
import { format } from "date-fns"
import { useI18n } from "@/lib/i18n"
import { BookingFeedbackCard } from "@/components/reviews/booking-feedback-card"

interface SuccessStepProps {
  bookingDetails: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    additionalInfo?: string
    date: Date
    vehicleYear: string
    vehicleMake: string
    vehicleModel: string
    serviceType: string
  }
  onNewBooking: () => void
}

export function SuccessStep({ bookingDetails, onNewBooking }: SuccessStepProps) {
  const { t } = useI18n()

  // Format the time window: e.g. "10:00 AM - 12:00 PM"
  const startHour = bookingDetails.date.getHours()
  const endHour = startHour + 2
  const formatHour = (h: number) => {
    const period = h >= 12 ? "PM" : "AM"
    const display = h > 12 ? h - 12 : h === 0 ? 12 : h
    return `${display}:00 ${period}`
  }
  const timeLabel = `${formatHour(startHour)} - ${formatHour(endHour)}`

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_0.88fr]">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
            <CheckCircle2 className="h-10 w-10 text-accent" />
          </div>
          <CardTitle className="text-2xl text-accent">{t("success.title")}</CardTitle>
          <CardDescription>{t("success.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg bg-muted p-3">
              <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t("success.name")}</p>
                <p className="font-medium">{bookingDetails.firstName} {bookingDetails.lastName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted p-3">
              <Car className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t("success.vehicle")}</p>
                <p className="font-medium">
                  {bookingDetails.vehicleYear} {bookingDetails.vehicleMake} {bookingDetails.vehicleModel}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted p-3">
              <Wrench className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t("success.service")}</p>
                <p className="font-medium">{bookingDetails.serviceType}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted p-3">
              <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t("success.date")}</p>
                <p className="font-medium">{format(bookingDetails.date, "EEEE, MMMM d, yyyy")}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted p-3">
              <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t("success.time")}</p>
                <p className="font-medium">{timeLabel}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted p-3">
              <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t("success.location")}</p>
                <p className="font-medium">{bookingDetails.address}</p>
                {bookingDetails.additionalInfo && (
                  <p className="mt-2 text-sm text-muted-foreground">{bookingDetails.additionalInfo}</p>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg bg-muted p-3">
                <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t("success.email")}</p>
                  <p className="font-medium">{bookingDetails.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-muted p-3">
                <Phone className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t("success.phone")}</p>
                  <p className="font-medium">{bookingDetails.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">{t("success.contactNote")}</p>

          <Button onClick={onNewBooking} variant="outline" className="w-full bg-transparent">
            {t("success.newBooking")}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <BookingFeedbackCard
          reviewerName={`${bookingDetails.firstName} ${bookingDetails.lastName}`.trim()}
          reviewerEmail={bookingDetails.email}
          serviceType={bookingDetails.serviceType}
        />
      </div>
    </div>
  )
}
