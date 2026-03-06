"use client"

import { useState, type FormEvent } from "react"
import { ArrowLeft, AlertCircle, Car, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/lib/i18n"
import { decodePlate, normalizePlate } from "@/lib/plate-decoder"
import { decodeVin, getVinFormatError, isValidVinFormat } from "@/lib/vin-decoder"

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 40 }, (_, i) => String(currentYear - i))

const carMakes = [
  "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet",
  "Chrysler", "Dodge", "Fiat", "Ford", "GMC", "Honda", "Hyundai",
  "Infiniti", "Jeep", "Kia", "Lincoln",
  "Mazda", "Mini", "Mitsubishi", "Nissan", "Ram",
  "Subaru", "Toyota", "Volkswagen", "Other",
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

type UIMode = "vin" | "plate" | "manual"

type DecodedVehicle = {
  make: string
  model: string
  year: string
  engineType?: string | null
}

export function VehicleInfoStep({ onNext, onBack }: VehicleInfoStepProps) {
  const { t } = useI18n()

  const [uiMode, setUiMode] = useState<UIMode>("vin")
  const [vin, setVin] = useState("")
  const [plate, setPlate] = useState("")
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [lookupError, setLookupError] = useState("")
  const [decodedVehicle, setDecodedVehicle] = useState<DecodedVehicle | null>(null)

  const [vehicleYear, setVehicleYear] = useState("")
  const [vehicleMake, setVehicleMake] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [engineType, setEngineType] = useState("")

  const resetLookupState = () => {
    setDecodedVehicle(null)
    setLookupError("")
    setEngineType("")
    setIsLookingUp(false)
  }

  const resetManualState = () => {
    setVehicleYear("")
    setVehicleMake("")
    setVehicleModel("")
    setEngineType("")
  }

  const handleModeChange = (value: string) => {
    const nextMode = value as UIMode
    setUiMode(nextMode)
    resetLookupState()

    if (nextMode !== "vin") {
      setVin("")
    }

    if (nextMode !== "plate") {
      setPlate("")
    }

    if (nextMode !== "manual") {
      resetManualState()
    }
  }

  const handleDecodeVin = async (event: FormEvent) => {
    event.preventDefault()
    setLookupError("")

    if (!isValidVinFormat(vin)) {
      setLookupError(getVinFormatError(vin))
      return
    }

    setIsLookingUp(true)
    try {
      const result = await decodeVin(vin)

      if (result.success && result.data) {
        setDecodedVehicle(result.data)
        if (result.data.engineType) {
          setEngineType(result.data.engineType)
        }
      } else {
        setLookupError(result.error || "Error decoding VIN")
      }
    } catch {
      setLookupError("Error decoding VIN. Please try again.")
    } finally {
      setIsLookingUp(false)
    }
  }

  const handleDecodePlate = async (event: FormEvent) => {
    event.preventDefault()
    setLookupError("")
    setIsLookingUp(true)

    try {
      const result = await decodePlate(plate, "CA")

      if (result.success && result.data) {
        setDecodedVehicle(result.data)
        if (result.data.engineType) {
          setEngineType(result.data.engineType)
        }
        return
      }

      setLookupError(result.error || "Error al consultar la placa")
    } finally {
      setIsLookingUp(false)
    }
  }

  const handleSubmitDecoded = (event: FormEvent) => {
    event.preventDefault()

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

  const handleSubmitManual = (event: FormEvent) => {
    event.preventDefault()

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

  const handleResetDecoded = () => {
    resetLookupState()

    if (uiMode === "vin") {
      setVin("")
    }

    if (uiMode === "plate") {
      setPlate("")
    }
  }

  const cardDescription =
    uiMode === "manual"
      ? t("vehicle.subtitle")
      : uiMode === "plate"
        ? t("vehicle.plateSubtitle")
        : t("vehicle.vinSubtitle")

  return (
    <Card className="mx-auto w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Car className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">{t("vehicle.title")}</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs value={uiMode} onValueChange={handleModeChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vin">{t("vehicle.lookupVin")}</TabsTrigger>
            <TabsTrigger value="plate">{t("vehicle.lookupPlate")}</TabsTrigger>
            <TabsTrigger value="manual">{t("vehicle.lookupManual")}</TabsTrigger>
          </TabsList>
        </Tabs>

        {uiMode === "manual" && (
          <form onSubmit={handleSubmitManual} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="year">{t("vehicle.year")}</Label>
              <Select value={vehicleYear} onValueChange={setVehicleYear}>
                <SelectTrigger id="year">
                  <SelectValue placeholder={t("vehicle.yearPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
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
                    <SelectItem key={make} value={make}>
                      {make}
                    </SelectItem>
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
                onChange={(event) => setVehicleModel(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manual-engine">{t("vehicle.engine")}</Label>
              <Select value={engineType} onValueChange={setEngineType}>
                <SelectTrigger id="manual-engine">
                  <SelectValue placeholder={t("vehicle.enginePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {engineTypes.map((engine) => (
                    <SelectItem key={engine} value={engine}>
                      {engine}
                    </SelectItem>
                  ))}
                  <SelectItem value="idk">{t("vehicle.idk")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1 bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" />
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
        )}

        {uiMode !== "manual" && !decodedVehicle && (
          <form onSubmit={uiMode === "plate" ? handleDecodePlate : handleDecodeVin} className="space-y-5">
            {uiMode === "vin" ? (
              <div className="space-y-2">
                <Label htmlFor="vin">VIN (Vehicle Identification Number)</Label>
                <Input
                  id="vin"
                  placeholder={t("vehicle.vinPlaceholder")}
                  value={vin}
                  onChange={(event) => {
                    setVin(event.target.value)
                    setLookupError("")
                  }}
                  disabled={isLookingUp}
                  maxLength={17}
                />
                <p className="text-xs text-muted-foreground">{t("vehicle.vinExample")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="plate">{t("vehicle.plateLabel")}</Label>
                <Input
                  id="plate"
                  placeholder={t("vehicle.platePlaceholder")}
                  value={plate}
                  onChange={(event) => {
                    setPlate(event.target.value.toUpperCase())
                    setLookupError("")
                  }}
                  disabled={isLookingUp}
                  maxLength={10}
                  autoCapitalize="characters"
                />
                <p className="text-xs text-muted-foreground">{t("vehicle.plateExample")}</p>
                <p className="text-xs text-muted-foreground">{t("vehicle.plateStateHint")}</p>
              </div>
            )}

            {lookupError && (
              <div className="flex gap-2 rounded-md border border-red-200 bg-red-50 p-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <p className="text-sm text-red-800">{lookupError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1 bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("common.back")}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={(uiMode === "vin" ? !vin : !normalizePlate(plate)) || isLookingUp}
              >
                {isLookingUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {uiMode === "plate"
                  ? isLookingUp
                    ? t("vehicle.searchingPlate")
                    : t("vehicle.decodePlate")
                  : isLookingUp
                    ? t("vehicle.decoding")
                    : t("vehicle.decodeVin")}
              </Button>
            </div>
          </form>
        )}

        {uiMode !== "manual" && decodedVehicle && (
          <form onSubmit={handleSubmitDecoded} className="space-y-5">
            <div className="rounded-md border border-green-200 bg-green-50 p-3">
              <p className="text-sm font-medium text-green-800">
                {uiMode === "plate" ? t("vehicle.decodedPlateSuccess") : t("vehicle.decodedSuccess")}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t("vehicle.makeLabel")}</Label>
              <Input value={decodedVehicle.make} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label>{t("vehicle.modelLabel")}</Label>
              <Input value={decodedVehicle.model} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label>{t("vehicle.yearLabel")}</Label>
              <Input value={decodedVehicle.year} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="decoded-engine">
                {t("vehicle.engine")} {t("vehicle.engineOptional")}
              </Label>
              <Select value={engineType} onValueChange={setEngineType}>
                <SelectTrigger id="decoded-engine">
                  <SelectValue placeholder={t("vehicle.enginePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {engineTypes.map((engine) => (
                    <SelectItem key={engine} value={engine}>
                      {engine}
                    </SelectItem>
                  ))}
                  <SelectItem value="idk">{t("vehicle.idk")}</SelectItem>
                </SelectContent>
              </Select>
              {decodedVehicle.engineType && (
                <p className="text-xs text-muted-foreground">
                  {t("vehicle.detectedEngine")}: {decodedVehicle.engineType} {t("vehicle.detectedEngineNote")}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleResetDecoded} className="flex-1 bg-transparent">
                {uiMode === "plate" ? t("vehicle.decodeAnotherPlate") : t("vehicle.decodeAnother")}
              </Button>
              <Button type="submit" className="flex-1">
                {t("common.continue")}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
