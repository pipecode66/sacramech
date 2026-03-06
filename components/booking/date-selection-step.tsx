"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { CalendarDays, ArrowLeft, Loader2 } from "lucide-react"
import { differenceInCalendarDays, endOfMonth, format, isSameDay, startOfToday } from "date-fns"
import { useI18n } from "@/lib/i18n"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface DateSelectionStepProps {
  onSubmit: (date: Date) => Promise<void>
  onBack: () => void
  isSubmitting: boolean
}

const timeSlots = [
  { label: "8:00 AM - 10:00 AM", startHour: 8 },
  { label: "10:00 AM - 12:00 PM", startHour: 10 },
  { label: "12:00 PM - 2:00 PM", startHour: 12 },
  { label: "2:00 PM - 4:00 PM", startHour: 14 },
  { label: "4:00 PM - 6:00 PM", startHour: 16 },
  { label: "6:00 PM - 8:00 PM", startHour: 18 },
]

export function DateSelectionStep({ onSubmit, onBack, isSubmitting }: DateSelectionStepProps) {
  const { t } = useI18n()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | undefined>(undefined)
  const [bookedSlots, setBookedSlots] = useState<{ date: string; hour: number }[]>([])

  const now = new Date()
  const today = startOfToday()
  const shouldShowNextMonth = differenceInCalendarDays(endOfMonth(today), today) <= 7

  // Fetch booked appointments when component mounts
  useEffect(() => {
    const fetchBookedSlots = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data } = await supabase
          .from("appointments")
          .select("appointment_date, appointment_time")
          .gte("appointment_date", format(today, "yyyy-MM-dd"))

        if (data) {
          const booked = data.map((appt: { appointment_date: string; appointment_time: string | null }) => ({
            date: appt.appointment_date,
            hour: appt.appointment_time ? parseInt(appt.appointment_time.split(":")[0], 10) : 0,
          }))
          setBookedSlots(booked)
        }
      } catch (error) {
        console.error("Error fetching booked slots:", error)
      }
    }

    fetchBookedSlots()
  }, [])

  // Get booked hours for the selected date
  const bookedHoursForDate = selectedDate
    ? bookedSlots
      .filter((slot) => slot.date === format(selectedDate, "yyyy-MM-dd"))
      .map((slot) => slot.hour)
    : []

  // Filter time slots: exclude slots that are already booked (have the same start hour)
  const availableTimeSlots = selectedDate
    ? timeSlots.filter((slot) => {
      // Don't show if time is already booked
      if (bookedHoursForDate.includes(slot.startHour)) {
        return false
      }
      // For today, hide slots that have already started
      if (isSameDay(selectedDate, now)) {
        return slot.startHour > now.getHours()
      }
      return true
    })
    : timeSlots

  // Check if date is completely full (all slots are booked)
  const isDateFull = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    const bookedHours = bookedSlots
      .filter((slot) => slot.date === dateStr)
      .map((slot) => slot.hour)

    // For today, count only future slots
    if (isSameDay(date, now)) {
      const futureSlots = timeSlots.filter((slot) => slot.startHour > now.getHours())
      return futureSlots.length > 0 && futureSlots.every((slot) => bookedHours.includes(slot.startHour))
    }

    return timeSlots.every((slot) => bookedHours.includes(slot.startHour))
  }

  // Reset selected time slot if it's no longer available
  useEffect(() => {
    if (
      selectedTimeSlot !== undefined &&
      !availableTimeSlots.find((s) => s.startHour === selectedTimeSlot)
    ) {
      setSelectedTimeSlot(undefined)
    }
  }, [selectedDate, availableTimeSlots])

  const handleSubmit = async () => {
    if (selectedDate && selectedTimeSlot !== undefined) {
      const dateWithTime = new Date(selectedDate)
      dateWithTime.setHours(selectedTimeSlot, 0, 0, 0)
      await onSubmit(dateWithTime)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTimeSlot(undefined)
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <CalendarDays className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">{t("date.title")}</CardTitle>
        <CardDescription>
          {t("date.subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => date < today || isDateFull(date)}
            defaultMonth={today}
            numberOfMonths={shouldShowNextMonth ? 2 : 1}
            className="rounded-md border"
          />
        </div>

        {selectedDate && (
          <div className="p-3 bg-primary/10 text-primary rounded-lg text-center">
            <p className="font-medium">{t("date.selected")}</p>
            <p className="text-lg">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
          </div>
        )}

        {selectedDate && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">{t("date.selectTimeSlot")}</p>
            {availableTimeSlots.length === 0 ? (
              <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground text-center">
                No available time slots for today. Please select a future date.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {availableTimeSlots.map((slot) => (
                  <Button
                    key={slot.startHour}
                    type="button"
                    variant={selectedTimeSlot === slot.startHour ? "default" : "outline"}
                    className={`text-sm ${selectedTimeSlot === slot.startHour
                      ? "bg-primary text-primary-foreground"
                      : ""
                      }`}
                    onClick={() => setSelectedTimeSlot(slot.startHour)}
                  >
                    {slot.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1 bg-transparent" disabled={isSubmitting}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.back")}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="flex-1"
            disabled={!selectedDate || selectedTimeSlot === undefined || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("date.booking")}
              </>
            ) : !selectedDate || selectedTimeSlot === undefined ? (
              "UNAVAILABLE"
            ) : (
              t("date.book")
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
