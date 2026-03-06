"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, AlertCircle, CheckCircle2, Mail, Loader2 } from "lucide-react"
import { isValidSacramentoZip } from "@/lib/sacramento-zip-codes"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useI18n } from "@/lib/i18n"

interface ZipCodeStepProps {
  onNext: (zipCode: string) => void
}

export function ZipCodeStep({ onNext }: ZipCodeStepProps) {
  const { t } = useI18n()
  const [zipCode, setZipCode] = useState("")
  const [error, setError] = useState("")
  const [isValid, setIsValid] = useState(false)
  const [waitlistEmail, setWaitlistEmail] = useState("")
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false)
  const [waitlistSuccess, setWaitlistSuccess] = useState(false)

  const handleZipChange = (value: string) => {
    const cleanedZip = value.replace(/\D/g, "").slice(0, 5)
    setZipCode(cleanedZip)
    setError("")
    setIsValid(false)
    setWaitlistSuccess(false)

    if (cleanedZip.length === 5) {
      if (isValidSacramentoZip(cleanedZip)) {
        setIsValid(true)
      } else {
        setError(t("zip.invalid"))
      }
    }
  }

  const handleWaitlistSubmit = async () => {
    if (!waitlistEmail.trim() || !zipCode) return
    setWaitlistSubmitting(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const { error: dbError } = await supabase.from("zip_code_waitlist").insert({
        email: waitlistEmail.trim(),
        zip_code: zipCode,
      })
      if (dbError) throw dbError
      setWaitlistSuccess(true)
    } catch (err) {
      console.error("Error saving waitlist email:", err)
    } finally {
      setWaitlistSubmitting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      onNext(zipCode)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">{t("zip.title")}</CardTitle>
        <CardDescription>
          {t("zip.subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="zipCode">{t("zip.label")}</Label>
            <div className="relative">
              <Input
                id="zipCode"
                type="text"
                placeholder={t("zip.placeholder")}
                value={zipCode}
                onChange={(e) => handleZipChange(e.target.value)}
                className={`text-lg text-center tracking-widest ${error ? "border-destructive" : isValid ? "border-accent" : ""
                  }`}
                maxLength={5}
              />
              {isValid && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
              )}
            </div>
          </div>

          {error && !waitlistSuccess && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-muted rounded-lg space-y-3">
              {!waitlistSuccess ? (
                <>
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    <p className="font-medium text-sm text-foreground">{t("zip.notifyTitle")}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("zip.notifyDesc")}</p>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder={t("zip.emailPlaceholder")}
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleWaitlistSubmit}
                      disabled={!waitlistEmail.trim() || waitlistSubmitting}
                      className="shrink-0"
                    >
                      {waitlistSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        t("zip.notifyButton")
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-accent/10 text-accent rounded-lg text-sm">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>{t("zip.notifySuccess")}</span>
                </div>
              )}
            </div>
          )}

          {isValid && (
            <div className="flex items-center gap-2 p-3 bg-accent/10 text-accent rounded-lg text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{t("zip.valid")}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={!isValid}>
            {t("zip.continue")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
