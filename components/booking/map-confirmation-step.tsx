"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MapPin, ArrowLeft, Check, AlertCircle } from "lucide-react"
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

        <div className="space-y-2">
          <Label htmlFor="additionalInfo">{t("map.additionalInfo")}</Label>
          <Textarea
            id="additionalInfo"
            placeholder={t("map.additionalInfoPlaceholder")}
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            rows={3}
            className="resize-none"
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
