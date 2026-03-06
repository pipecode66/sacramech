"use client"

import React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car, ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { decodeVin, isValidVinFormat, getVinFormatError } from "@/lib/vin-decoder"

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 40 }, (_, i) => String(currentYear - i))

const carMakes = [
  "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet",
  "Chrysler", "Dodge", "Fiat", "Ford", "GMC", "Honda", "Hyundai",
  "Infiniti", "Jeep", "Kia", "Lincoln",
  "Mazda", "Mini", "Mitsubishi", "Nissan", "Ram",
  "Subaru", "Toyota", "Volkswagen", "Other"
]

const engineTypes = [
  "4-Cylinder",
  "6-Cylinder",
  "V8",
  "Electric",
  "Hybrid",
  "Diesel",
  "Turbocharged",
]

interface VehicleInfoStepProps {
  onNext: (data: { vehicleYear: string; vehicleMake: string; vehicleModel: string; engineType: string }) => void
  onBack: () => void
}

type UIMode = "vin" | "manual"

export function VehicleInfoStep({ onNext, onBack }: VehicleInfoStepProps) {
  const { t } = useI18n()

  // UI mode state
  const [uiMode, setUiMode] = useState<UIMode>("vin")

  // VIN mode state
  const [vin, setVin] = useState("")
  const [isDecoding, setIsDecoding] = useState(false)
  const [decodingError, setDecodingError] = useState("")
  const [decodedVehicle, setDecodedVehicle] = useState<{
    make: string
    model: string
    year: string
    engineType?: string | null
  } | null>(null)

  // Manual mode state
  const [vehicleYear, setVehicleYear] = useState("")
  const [vehicleMake, setVehicleMake] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [engineType, setEngineType] = useState("")

  // VIN mode: decode vehicle from VIN
  const handleDecodeVin = async (e: React.FormEvent) => {
    e.preventDefault()
    setDecodingError("")

    // Validate format
    if (!isValidVinFormat(vin)) {
      setDecodingError(getVinFormatError(vin))
      return
    }

    setIsDecoding(true)
    try {
      const result = await decodeVin(vin)

      if (result.success && result.data) {
        setDecodedVehicle(result.data)
        // Pre-fill engine type if available, but don't set engineType yet (user must confirm)
        if (result.data.engineType) {
          setEngineType(result.data.engineType)
        }
      } else {
        setDecodingError(result.error || "Error decoding VIN")
      }
    } catch (error) {
      setDecodingError("Error decoding VIN. Please try again.")
    } finally {
      setIsDecoding(false)
    }
  }

  // VIN mode: submit decoded vehicle
  const handleSubmitDecoded = (e: React.FormEvent) => {
    e.preventDefault()

    if (!decodedVehicle) {
      return
    }

    onNext({
      vehicleYear: decodedVehicle.year,
      vehicleMake: decodedVehicle.make,
      vehicleModel: decodedVehicle.model,
      engineType: engineType || "idk",
    })
  }

  // Manual mode: switch to manual dropdown entry
  const handleSwitchToManual = () => {
    setUiMode("manual")
    setDecodedVehicle(null)
    setDecodingError("")
    setEngineType("")
  }

  // Manual mode: submit manual selection
  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault()

    if (!vehicleYear || !vehicleMake || !vehicleModel || !engineType) {
      return
    }

    onNext({
      vehicleYear,
      vehicleMake,
      vehicleModel,
      engineType,
    })
  }

  // Manual mode: switch back to VIN
  const handleSwitchToVin = () => {
    setUiMode("vin")
    setVehicleYear("")
    setVehicleMake("")
    setVehicleModel("")
    setEngineType("")
  }

  if (uiMode === "manual") {
    // Manual entry mode - show original dropdowns
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Car className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t("vehicle.title")}</CardTitle>
          <CardDescription>
            {t("vehicle.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitManual} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="year">{t("vehicle.year")}</Label>
              <Select value={vehicleYear} onValueChange={setVehicleYear}>
                <SelectTrigger id="year">
                  <SelectValue placeholder={t("vehicle.yearPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="make">{t("vehicle.make")}</Label>
              <Select value={vehicleMake} onValueChange={setVehicleMake}>
                <SelectTrigger id="make">
                  <SelectValue placeholder={t("vehicle.makePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {carMakes.map((make) => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">{t("vehicle.model")}</Label>
              <Input
                id="model"
                placeholder={t("vehicle.modelPlaceholder")}
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="engine">{t("vehicle.engine")}</Label>
              <Select value={engineType} onValueChange={setEngineType}>
                <SelectTrigger id="engine">
                  <SelectValue placeholder={t("vehicle.enginePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {engineTypes.map((engine) => (
                    <SelectItem key={engine} value={engine}>{engine}</SelectItem>
                  ))}
                  <SelectItem value="idk">{t("vehicle.idk")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm">
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-blue-600"
                onClick={handleSwitchToVin}
              >
                {t("vehicle.hasVin")}
              </Button>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1 bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("common.back")}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!vehicleYear || !vehicleMake || !vehicleModel || !engineType}
              >
                {t("common.continue")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  // VIN mode (default)
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Car className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">{t("vehicle.title")}</CardTitle>
        <CardDescription>
          {t("vehicle.vinSubtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!decodedVehicle ? (
          // VIN input and decode button
          <form onSubmit={handleDecodeVin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="vin">VIN (Vehicle Identification Number)</Label>
              <Input
                id="vin"
                placeholder={t("vehicle.vinPlaceholder")}
                value={vin}
                onChange={(e) => {
                  setVin(e.target.value)
                  setDecodingError("")
                }}
                disabled={isDecoding}
                maxLength={17}
              />
              <p className="text-xs text-gray-500">
                {t("vehicle.vinExample")}
              </p>
            </div>

            {decodingError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800">{decodingError}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1 bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("common.back")}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!vin || isDecoding}
              >
                {isDecoding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isDecoding ? t("vehicle.decoding") : t("vehicle.decodeVin")}
              </Button>
            </div>

            <div className="text-sm">
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-blue-600"
                onClick={handleSwitchToManual}
              >
                {t("vehicle.noVin")}
              </Button>
            </div>
          </form>
        ) : (
          // Decoded vehicle confirmation
          <form onSubmit={handleSubmitDecoded} className="space-y-5">
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800 font-medium">{t("vehicle.decodedSuccess")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("vehicle.makeLabel")}</Label>
              <Input value={decodedVehicle.make} disabled className="bg-gray-50" />
            </div>

            <div className="space-y-2">
              <Label>{t("vehicle.modelLabel")}</Label>
              <Input value={decodedVehicle.model} disabled className="bg-gray-50" />
            </div>

            <div className="space-y-2">
              <Label>{t("vehicle.yearLabel")}</Label>
              <Input value={decodedVehicle.year} disabled className="bg-gray-50" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="engine">{t("vehicle.engine")} {t("vehicle.engineOptional")}</Label>
              <Select value={engineType} onValueChange={setEngineType}>
                <SelectTrigger id="engine">
                  <SelectValue placeholder={t("vehicle.enginePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {engineTypes.map((engine) => (
                    <SelectItem key={engine} value={engine}>{engine}</SelectItem>
                  ))}
                  <SelectItem value="idk">{t("vehicle.idk")}</SelectItem>
                </SelectContent>
              </Select>
              {decodedVehicle.engineType && (
                <p className="text-xs text-gray-500">
                  {t("vehicle.detectedEngine")}: {decodedVehicle.engineType} {t("vehicle.detectedEngineNote")}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDecodedVehicle(null)
                  setVin("")
                  setEngineType("")
                  setDecodingError("")
                }}
                className="flex-1 bg-transparent"
              >
                {t("vehicle.decodeAnother")}
              </Button>
              <Button type="submit" className="flex-1">
                {t("common.continue")}
              </Button>
            </div>

            <div className="text-sm">
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-blue-600"
                onClick={handleSwitchToManual}
              >
                {t("vehicle.switchManual")}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
