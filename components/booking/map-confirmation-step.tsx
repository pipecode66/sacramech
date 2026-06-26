"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MapPin, ArrowLeft, Check, AlertCircle, Loader2, MessageSquare } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { parseStoredAddress } from "@/lib/address-display"

interface MapConfirmationStepProps {
  address: string
  onConfirm: (additionalInfo: string) => void
  onBack: () => void
}

export function MapConfirmationStep({ address, onConfirm, onBack }: MapConfirmationStepProps) {
  const { t } = useI18n()
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [isRevalidating, setIsRevalidating] = useState(false)
  const [validationErrorCode, setValidationErrorCode] = useState<string | null>(null)
  const encodedAddress = encodeURIComponent(address)
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedAddress}&zoom=16`

  const getValidationErrorMessage = (error: string | null) => {
    switch (error) {
      case "ADDRESS_ZIP_MISMATCH":
        return t("address.addressZipMismatch")
      case "ADDRESS_NOT_FOUND":
        return t("address.addressNotFound")
      case "UNSUPPORTED_ZIP":
        return t("address.unsupportedZip")
      case "INVALID_REQUEST":
        return t("address.addressIncomplete")
      default:
        return t("map.validationError")
    }
  }

  const handleConfirm = async () => {
    const parsedAddress = parseStoredAddress(address)
    const street = parsedAddress.streetLine.trim()
    const zipCode = parsedAddress.zipCode

    if (!street || !zipCode) {
      setValidationErrorCode("INVALID_REQUEST")
      return
    }

    setIsRevalidating(true)
    setValidationErrorCode(null)

    try {
      const response = await fetch("/api/validate-address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          street,
          zipCode,
        }),
      })

      const result = (await response.json()) as { valid?: boolean; error?: string }
      if (!response.ok || !result.valid) {
        setValidationErrorCode(result.error || "VALIDATION_ERROR")
        return
      }

      onConfirm(additionalInfo)
    } catch (error) {
      console.error("Map confirmation address validation failed:", error)
      setValidationErrorCode("VALIDATION_ERROR")
    } finally {
      setIsRevalidating(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-xl sm:text-2xl">{t("map.title")}</CardTitle>
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

        <div className="rounded-2xl border border-primary/20 bg-background p-4 sm:p-5">
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
            className="min-h-[130px] resize-none rounded-xl border-2 border-primary/15 bg-background px-4 py-3 text-sm leading-6 transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 focus-visible:border-primary/35 focus-visible:ring-primary/20 sm:min-h-[150px] sm:text-base"
          />
        </div>

        <Alert className="border-accent/30 bg-accent/12 text-accent">
          <AlertCircle className="mt-0.5 h-5 w-5" />
          <AlertTitle className="text-sm uppercase tracking-[0.12em] text-accent/90">
            {t("map.warningTitle")}
          </AlertTitle>
          <AlertDescription className="text-sm text-accent">
            <p>{t("map.warning")}</p>
          </AlertDescription>
        </Alert>

        {validationErrorCode && (
          <Alert className="border-destructive/30 bg-destructive/10 text-destructive">
            <AlertCircle className="mt-0.5 h-5 w-5" />
            <AlertTitle>{t("map.validationTitle")}</AlertTitle>
            <AlertDescription>{getValidationErrorMessage(validationErrorCode)}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1 bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("map.editAddress")}
          </Button>
          <Button type="button" onClick={handleConfirm} className="flex-1" disabled={isRevalidating}>
            {isRevalidating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            {isRevalidating ? t("address.validating") : t("map.confirm")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
