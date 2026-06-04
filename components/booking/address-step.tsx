"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { validateAddressFormat } from "@/lib/address-validation"
import { formatResolvedAddress, type ZipLocation } from "@/lib/zip-city"

interface AddressStepProps {
  zipCode: string
  onNext: (address: string, coordinates?: { latitude: number | null; longitude: number | null }) => void
  onBack: () => void
}

export function AddressStep({ zipCode, onNext, onBack }: AddressStepProps) {
  const { t } = useI18n()
  const [street, setStreet] = useState("")
  const [location, setLocation] = useState<ZipLocation>({ city: "", county: "", state: "" })
  const [isValidating, setIsValidating] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [validationErrorCode, setValidationErrorCode] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    const loadLocation = async () => {
      setIsLoadingLocation(true)
      try {
        const response = await fetch(`/api/zip-city?zipCode=${encodeURIComponent(zipCode)}`, {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Could not resolve location for ZIP code.")
        }

        const result = (await response.json()) as {
          city?: string | null
          county?: string | null
          state?: string | null
        }
        if (!isCancelled) {
          setLocation({
            city: result.city?.trim() || "",
            county: result.county?.trim() || "",
            state: result.state?.trim() || "",
          })
        }
      } catch (error) {
        console.warn("Could not auto-resolve location from ZIP code:", error)
        if (!isCancelled) {
          setLocation({ city: "", county: "", state: "" })
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingLocation(false)
        }
      }
    }

    void loadLocation()

    return () => {
      isCancelled = true
    }
  }, [zipCode])

  const fullAddress = formatResolvedAddress(street, location, zipCode)

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
      case "UNSUPPORTED_ZIP":
        return t("address.unsupportedZip")
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

    // Validate address format only (location is auto-detected)
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
        county?: string
        state?: string
        normalizedAddress?: string
        latitude?: number
        longitude?: number
      }

      if (!response.ok || !result.valid) {
        setValidationErrorCode(result.error || "VALIDATION_ERROR")
        return
      }

      const validatedLocation: ZipLocation = {
        city: result.city?.trim() || location.city || "",
        county: result.county?.trim() || location.county || "",
        state: result.state?.trim() || location.state || "",
      }

      setLocation(validatedLocation)
      onNext(result.normalizedAddress || formatResolvedAddress(trimmedStreet, validatedLocation, zipCode), {
        latitude: typeof result.latitude === "number" ? result.latitude : null,
        longitude: typeof result.longitude === "number" ? result.longitude : null,
      })
    } catch (error) {
      console.error("Address validation request failed:", error)
      setValidationErrorCode("VALIDATION_ERROR")
    } finally {
      setIsValidating(false)
    }
  }

  const errorMessage = validationErrorCode ? getErrorMessage(validationErrorCode) : null

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Home className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-xl sm:text-2xl">{t("address.title")}</CardTitle>
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

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>{t("address.city")}</Label>
              <Input
                type="text"
                value={location.city ?? ""}
                disabled
                placeholder={isLoadingLocation ? t("address.resolvingLocation") : ""}
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("address.county")}</Label>
              <Input
                type="text"
                value={location.county ?? ""}
                disabled
                placeholder={isLoadingLocation ? t("address.resolvingLocation") : ""}
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("address.state")}</Label>
              <Input
                type="text"
                value={location.state ?? ""}
                disabled
                placeholder={isLoadingLocation ? t("address.resolvingLocation") : ""}
                className="bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("address.zipCode")}</Label>
            <Input type="text" value={zipCode} disabled className="bg-muted" />
          </div>

          {street && (location.city || location.county || location.state) && (
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
            <Button type="submit" className="flex-1" disabled={!street.trim() || isValidating || isLoadingLocation}>
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("address.validating")}
                </>
              ) : isLoadingLocation ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("address.resolvingLocation")}
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
