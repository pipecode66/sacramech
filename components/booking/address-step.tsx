"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { validateAddressFormat } from "@/lib/address-validation"
import { ZIP_CODE_TO_INFO } from "@/lib/sacramento-zip-codes"

interface AddressStepProps {
  zipCode: string
  onNext: (address: string) => void
  onBack: () => void
}

export function AddressStep({ zipCode, onNext, onBack }: AddressStepProps) {
  const { t } = useI18n()
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("Sacramento")
  const [isValidating, setIsValidating] = useState(false)
  const [validationErrorCode, setValidationErrorCode] = useState<string | null>(null)

  // Auto-detect city from ZIP code
  const zipInfo = ZIP_CODE_TO_INFO[zipCode]
  const defaultCity = zipInfo?.cities[0] ?? "Sacramento"

  useEffect(() => {
    setCity(defaultCity)
  }, [defaultCity])

  const fullAddress = `${street}, ${city}, CA ${zipCode}`

  const getErrorMessage = (error: string | undefined): string => {
    if (!error) return t("address.validationError")

    switch (error) {
      case "INVALID_ADDRESS_FORMAT":
        return t("address.invalidAddressFormat")
      case "ADDRESS_TOO_SHORT":
        return t("address.addressTooShort")
      case "ADDRESS_TOO_LONG":
        return t("address.addressTooLong")
      case "INVALID_ADDRESS_CHARACTERS":
        return t("address.invalidAddressCharacters")
      case "ADDRESS_NOT_FOUND":
        return t("address.addressNotFound")
      case "ADDRESS_ZIP_MISMATCH":
        return t("address.addressZipMismatch")
      case "ADDRESS_INCOMPLETE":
        return t("address.addressIncomplete")
      case "INVALID_CITY_FOR_ZIP":
        return t("address.invalidCityForZip")
      case "EMPTY_ADDRESS":
        return t("address.emptyAddress")
      default:
        return t("address.validationError")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationErrorCode(null)

    const trimmedStreet = street.trim()

    // Validate address format only (city is auto-detected)
    const formatResult = validateAddressFormat(trimmedStreet)
    if (!formatResult.valid) {
      setValidationErrorCode(formatResult.error || "VALIDATION_ERROR")
      return
    }

    setIsValidating(true)

    try {
      const response = await fetch("/api/validate-address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          street: trimmedStreet,
          zipCode,
        }),
      })

      const result = (await response.json()) as {
        valid: boolean
        error?: string
        city?: string
        normalizedAddress?: string
      }

      if (!response.ok || !result.valid) {
        setValidationErrorCode(result.error || "VALIDATION_ERROR")
        return
      }

      const validatedCity = result.city || defaultCity
      setCity(validatedCity)
      onNext(result.normalizedAddress || `${trimmedStreet}, ${validatedCity}, CA ${zipCode}`)
    } catch (error) {
      console.error("Address validation request failed:", error)
      setValidationErrorCode("VALIDATION_ERROR")
    } finally {
      setIsValidating(false)
    }
  }

  const errorMessage = validationErrorCode ? getErrorMessage(validationErrorCode) : null

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Home className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">{t("address.title")}</CardTitle>
        <CardDescription>
          {t("address.subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="street">{t("address.street")}</Label>
            <Input
              id="street"
              type="text"
              placeholder={t("address.streetPlaceholder")}
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("address.city")}</Label>
              <Input
                type="text"
                value={city}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("address.state")}</Label>
              <Input type="text" value="CA" disabled className="bg-muted" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("address.zipCode")}</Label>
            <Input type="text" value={zipCode} disabled className="bg-muted" />
          </div>

          {street && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium text-muted-foreground">{t("address.fullAddress")}</p>
              <p className="text-foreground">{fullAddress}</p>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("common.back")}
            </Button>
            <Button type="submit" className="flex-1" disabled={!street.trim() || isValidating}>
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("address.validating")}
                </>
              ) : (
                t("common.continue")
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
