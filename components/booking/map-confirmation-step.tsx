"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MapPin, ArrowLeft, Check, AlertCircle, MessageSquare } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface MapConfirmationStepProps {
  address: string
  onConfirm: (additionalInfo: string) => void
  onBack: () => void
}

export function MapConfirmationStep({ address, onConfirm, onBack }: MapConfirmationStepProps) {
  const { t } = useI18n()
  const [additionalInfo, setAdditionalInfo] = useState("")
  const encodedAddress = encodeURIComponent(address)
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedAddress}&zoom=16`

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">{t("map.title")}</CardTitle>
        <CardDescription>
          {t("map.subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-3 bg-muted rounded-lg">
          <p className="font-medium text-muted-foreground text-sm">{t("map.address")}</p>
          <p className="text-foreground">{address}</p>
        </div>

        <div className="relative w-full h-[300px] rounded-lg overflow-hidden border">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={mapUrl}
            title="Location Map"
          />
        </div>

        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/10 p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary sm:h-11 sm:w-11">
              <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="additionalInfo" className="block text-base font-semibold text-foreground sm:text-lg">
                {t("map.additionalInfo")}
              </Label>
              <p className="text-sm leading-5 text-muted-foreground sm:text-[15px]">
                {t("map.additionalInfoPlaceholder")}
              </p>
            </div>
          </div>

          <Textarea
            id="additionalInfo"
            placeholder={t("map.additionalInfoPlaceholder")}
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            rows={4}
            className="min-h-[130px] resize-none rounded-xl border-2 border-primary/15 bg-background/95 px-4 py-3 text-sm leading-6 shadow-inner transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 focus-visible:border-primary/35 focus-visible:ring-primary/20 sm:min-h-[150px] sm:text-base"
          />
        </div>

        <Alert className="border-accent/30 bg-accent/12 text-accent shadow-sm">
          <AlertCircle className="mt-0.5 h-5 w-5" />
          <AlertTitle className="text-sm uppercase tracking-[0.12em] text-accent/90">
            {t("map.warningTitle")}
          </AlertTitle>
          <AlertDescription className="text-sm text-accent">
            <p>{t("map.warning")}</p>
          </AlertDescription>
        </Alert>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1 bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("map.editAddress")}
          </Button>
          <Button type="button" onClick={() => onConfirm(additionalInfo)} className="flex-1">
            <Check className="w-4 h-4 mr-2" />
            {t("map.confirm")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
