"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, ArrowLeft } from "lucide-react"
import { useI18n } from "@/lib/i18n"

const referralKeys = [
  "details.referral.google",
  "details.referral.facebook",
  "details.referral.instagram",
  "details.referral.nextdoor",
  "details.referral.yelp",
  "details.referral.friend",
  "details.referral.flyer",
  "details.referral.vehicle",
  "details.referral.returning",
  "details.referral.other",
] as const

interface PersonalDetailsStepProps {
  onNext: (details: { firstName: string; lastName: string; email: string; phone: string; referralSource: string }) => void
  onBack: () => void
}

export function PersonalDetailsStep({ onNext, onBack }: PersonalDetailsStepProps) {
  const { t } = useI18n()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [referralSource, setReferralSource] = useState("")

  const isValid = firstName.trim() && lastName.trim() && email.trim() && phone.trim() && referralSource

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
  }

  const handlePhoneChange = (value: string) => {
    setPhone(formatPhone(value))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      onNext({ firstName, lastName, email, phone, referralSource })
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">{t("details.title")}</CardTitle>
        <CardDescription>
          {t("details.subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t("details.firstName")}</Label>
              <Input
                id="firstName"
                type="text"
                placeholder={t("details.firstNamePlaceholder")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t("details.lastName")}</Label>
              <Input
                id="lastName"
                type="text"
                placeholder={t("details.lastNamePlaceholder")}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("details.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("details.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t("details.phone")}</Label>
            <Input
              id="phone"
              type="tel"
              placeholder={t("details.phonePlaceholder")}
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referral">{t("details.referral")}</Label>
            <Select value={referralSource} onValueChange={setReferralSource}>
              <SelectTrigger id="referral">
                <SelectValue placeholder={t("details.referralPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {referralKeys.map((key) => (
                  <SelectItem key={key} value={t(key)}>{t(key)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("common.back")}
            </Button>
            <Button type="submit" className="flex-1" disabled={!isValid}>
              {t("common.continue")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
