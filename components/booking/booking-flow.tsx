"use client"

import { useState, useEffect, type RefObject } from "react"
import { ZipCodeStep } from "./zip-code-step"
import { VehicleInfoStep } from "./vehicle-info-step"
import { ServiceSelectionStep } from "./service-selection-step"
import { AddressStep } from "./address-step"
import { MapConfirmationStep } from "./map-confirmation-step"
import { PersonalDetailsStep } from "./personal-details-step"
import { DateSelectionStep } from "./date-selection-step"
import { SuccessStep } from "./success-step"

type Step = "zip" | "vehicle" | "service" | "address" | "map" | "details" | "date" | "success"

const STEPS: Step[] = ["zip", "vehicle", "service", "address", "map", "details", "date"]

interface BookingData {
  zipCode: string
  vehicleYear: string
  vehicleMake: string
  vehicleModel: string
  engineType: string
  serviceType: string
  address: string
  additionalInfo: string
  firstName: string
  lastName: string
  email: string
  phone: string
  referralSource: string
  date: Date | null
}

export function BookingFlow({
  onResetRef,
  serviceZipCodes,
}: {
  onResetRef?: RefObject<(() => void) | null>
  serviceZipCodes: string[]
}) {
  const [step, setStep] = useState<Step>("zip")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingData, setBookingData] = useState<BookingData>({
    zipCode: "",
    vehicleYear: "",
    vehicleMake: "",
    vehicleModel: "",
    engineType: "",
    serviceType: "",
    address: "",
    additionalInfo: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    referralSource: "",
    date: null,
  })

  const handleZipNext = (zipCode: string) => {
    setBookingData((prev) => ({ ...prev, zipCode }))
    setStep("vehicle")
  }

  const handleVehicleNext = (data: { vehicleYear: string; vehicleMake: string; vehicleModel: string; engineType: string }) => {
    setBookingData((prev) => ({ ...prev, ...data }))
    setStep("service")
  }

  const handleServiceNext = (serviceType: string) => {
    setBookingData((prev) => ({ ...prev, serviceType }))
    setStep("address")
  }

  const handleAddressNext = (address: string) => {
    setBookingData((prev) => ({ ...prev, address }))
    setStep("map")
  }

  const handleMapConfirm = (additionalInfo: string) => {
    setBookingData((prev) => ({ ...prev, additionalInfo }))
    setStep("details")
  }

  const handleDetailsNext = (details: { firstName: string; lastName: string; email: string; phone: string; referralSource: string }) => {
    setBookingData((prev) => ({ ...prev, ...details }))
    setStep("date")
  }

  const handleDateSubmit = async (date: Date) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: bookingData.firstName,
          lastName: bookingData.lastName,
          email: bookingData.email,
          phone: bookingData.phone,
          zipCode: bookingData.zipCode,
          address: bookingData.address,
          additionalInfo: bookingData.additionalInfo,
          appointmentDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
          appointmentHour: date.getHours(),
          vehicleYear: bookingData.vehicleYear,
          vehicleMake: bookingData.vehicleMake,
          vehicleModel: bookingData.vehicleModel,
          engineType: bookingData.engineType,
          serviceType: bookingData.serviceType,
          referralSource: bookingData.referralSource,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Unable to create appointment")
      }

      if (Array.isArray(result.warnings) && result.warnings.length > 0) {
        console.warn("Appointment created with SMS warnings:", result.warnings)
      }

      setBookingData((prev) => ({ ...prev, date }))
      setStep("success")
    } catch (error) {
      console.error("Error creating appointment:", error)
      alert("There was an error booking your appointment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNewBooking = () => {
    setBookingData({
      zipCode: "",
      vehicleYear: "",
      vehicleMake: "",
      vehicleModel: "",
      engineType: "",
      serviceType: "",
      address: "",
      additionalInfo: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      referralSource: "",
      date: null,
    })
    setStep("zip")
  }

  // Expose reset function to parent via ref
  useEffect(() => {
    if (onResetRef) {
      onResetRef.current = handleNewBooking
    }
    return () => {
      if (onResetRef) onResetRef.current = null
    }
  })

  return (
    <div className="w-full">
      {/* Progress indicator */}
      {step !== "success" && (
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-1 sm:gap-2">
            {STEPS.map((s, index) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors ${STEPS.indexOf(step) >= index ? "bg-primary" : "bg-muted"
                    }`}
                />
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-5 sm:w-8 h-0.5 transition-colors ${STEPS.indexOf(step) > index ? "bg-primary" : "bg-muted"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {step === "zip" && <ZipCodeStep onNext={handleZipNext} serviceZipCodes={serviceZipCodes} />}
      {step === "vehicle" && (
        <VehicleInfoStep
          onNext={handleVehicleNext}
          onBack={() => setStep("zip")}
        />
      )}
      {step === "service" && (
        <ServiceSelectionStep
          onNext={handleServiceNext}
          onBack={() => setStep("vehicle")}
        />
      )}
      {step === "address" && (
        <AddressStep
          zipCode={bookingData.zipCode}
          onNext={handleAddressNext}
          onBack={() => setStep("service")}
        />
      )}
      {step === "map" && (
        <MapConfirmationStep
          address={bookingData.address}
          onConfirm={handleMapConfirm}
          onBack={() => setStep("address")}
        />
      )}
      {step === "details" && (
        <PersonalDetailsStep
          onNext={handleDetailsNext}
          onBack={() => setStep("map")}
        />
      )}
      {step === "date" && (
        <DateSelectionStep
          onSubmit={handleDateSubmit}
          onBack={() => setStep("details")}
          isSubmitting={isSubmitting}
        />
      )}
      {step === "success" && bookingData.date && (
        <SuccessStep
          bookingDetails={{
            firstName: bookingData.firstName,
            lastName: bookingData.lastName,
            email: bookingData.email,
            phone: bookingData.phone,
            address: bookingData.address,
            additionalInfo: bookingData.additionalInfo,
            date: bookingData.date,
            vehicleYear: bookingData.vehicleYear,
            vehicleMake: bookingData.vehicleMake,
            vehicleModel: bookingData.vehicleModel,
            serviceType: bookingData.serviceType,
          }}
          onNewBooking={handleNewBooking}
        />
      )}
    </div>
  )
}
