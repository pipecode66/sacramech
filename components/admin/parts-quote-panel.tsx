"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ExternalLink, Loader2, PackageSearch, Save, Search, Star, Trash2 } from "lucide-react"

import { createAppointmentPartQuote, deleteAppointmentPartQuote } from "@/app/admin/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { buildSuggestedSearchTerm, getSuggestedPartsForAppointment } from "@/lib/parts-catalog"
import { formatLocalDate } from "@/lib/date-utils"

interface Appointment {
  id: string
  first_name: string
  last_name: string
  appointment_date: string
  service_type?: string | null
  vehicle_year?: string | null
  vehicle_make?: string | null
  vehicle_model?: string | null
  zip_code?: string | null
}

interface AppointmentPartQuote {
  id: string
  appointment_id: string
  supplier_name: string
  part_name: string
  part_category: string | null
  part_number: string | null
  unit_price: number | null
  rating: number | null
  popularity_score: number | null
  source_url: string | null
  notes: string | null
  search_query: string | null
  created_at: string
}

interface PartsQuotePanelProps {
  appointments: Appointment[]
  quotes: AppointmentPartQuote[]
}

const DEFAULT_FORM = {
  partName: "",
  partCategory: "",
  supplierName: "O'Reilly Auto Parts",
  partNumber: "",
  unitPrice: "",
  rating: "",
  popularityScore: "",
  sourceUrl: "",
  notes: "",
}

type SortOption = "price-asc" | "price-desc" | "rating-desc" | "popularity-desc" | "name-asc"

function sortQuotes(quotes: AppointmentPartQuote[], sortBy: SortOption) {
  return [...quotes].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return (a.unit_price ?? Number.POSITIVE_INFINITY) - (b.unit_price ?? Number.POSITIVE_INFINITY)
      case "price-desc":
        return (b.unit_price ?? Number.NEGATIVE_INFINITY) - (a.unit_price ?? Number.NEGATIVE_INFINITY)
      case "rating-desc":
        return (b.rating ?? Number.NEGATIVE_INFINITY) - (a.rating ?? Number.NEGATIVE_INFINITY)
      case "popularity-desc":
        return (b.popularity_score ?? Number.NEGATIVE_INFINITY) - (a.popularity_score ?? Number.NEGATIVE_INFINITY)
      case "name-asc":
      default:
        return a.part_name.localeCompare(b.part_name)
    }
  })
}

export function PartsQuotePanel({ appointments, quotes: initialQuotes }: PartsQuotePanelProps) {
  const router = useRouter()
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>(appointments[0]?.id || "")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("price-asc")
  const [quotes, setQuotes] = useState(initialQuotes)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingQuoteId, setDeletingQuoteId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string>("")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    setQuotes(initialQuotes)
  }, [initialQuotes])

  useEffect(() => {
    if (!selectedAppointmentId && appointments[0]?.id) {
      setSelectedAppointmentId(appointments[0].id)
    }
  }, [appointments, selectedAppointmentId])

  const selectedAppointment = useMemo(
    () => appointments.find((appointment) => appointment.id === selectedAppointmentId) || null,
    [appointments, selectedAppointmentId],
  )

  useEffect(() => {
    if (selectedAppointment) {
      setSearchQuery(buildSuggestedSearchTerm(selectedAppointment))
    }
  }, [selectedAppointment])

  const suggestedParts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const suggestions = getSuggestedPartsForAppointment(selectedAppointment)
    if (!normalizedQuery) return suggestions

    return suggestions.filter((suggestion) =>
      [suggestion.partName, suggestion.category, suggestion.notes].join(" ").toLowerCase().includes(normalizedQuery),
    )
  }, [searchQuery, selectedAppointment])

  const filteredQuotes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const scopedQuotes = selectedAppointmentId
      ? quotes.filter((quote) => quote.appointment_id === selectedAppointmentId)
      : quotes

    const matches = normalizedQuery
      ? scopedQuotes.filter((quote) =>
          [
            quote.part_name,
            quote.part_category,
            quote.part_number,
            quote.supplier_name,
            quote.search_query,
            quote.notes,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery),
        )
      : scopedQuotes

    return sortQuotes(matches, sortBy)
  }, [quotes, searchQuery, selectedAppointmentId, sortBy])

  const recentHistory = useMemo(
    () => [...quotes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10),
    [quotes],
  )

  const handleFormChange = (field: keyof typeof DEFAULT_FORM, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const applySuggestion = (index: number) => {
    const suggestion = suggestedParts[index]
    if (!suggestion) return

    setForm((currentForm) => ({
      ...currentForm,
      partName: suggestion.partName,
      partCategory: suggestion.category,
      supplierName: suggestion.supplierName,
      rating: String(suggestion.rating),
      popularityScore: String(suggestion.popularityScore),
      notes: suggestion.notes,
    }))
  }

  const handleSave = async () => {
    if (!selectedAppointmentId) {
      setError("Select an appointment before saving a parts quote.")
      return
    }

    if (!form.partName.trim() || !form.unitPrice.trim()) {
      setError("Part name and unit price are required.")
      return
    }

    setIsSaving(true)
    setFeedback("")
    setError("")

    const result = await createAppointmentPartQuote({
      appointmentId: selectedAppointmentId,
      supplierName: form.supplierName,
      partName: form.partName,
      partCategory: form.partCategory,
      partNumber: form.partNumber,
      unitPrice: form.unitPrice,
      rating: form.rating,
      popularityScore: form.popularityScore,
      sourceUrl: form.sourceUrl,
      notes: form.notes,
      searchQuery,
    })

    if (!result.success || !result.quote) {
      setError(result.error || "Could not save the parts quote.")
      setIsSaving(false)
      return
    }

    setQuotes((currentQuotes) => [result.quote, ...currentQuotes])
    setForm(DEFAULT_FORM)
    setFeedback("Parts quote saved to the appointment history.")
    setIsSaving(false)
    router.refresh()
  }

  const handleDelete = async (quoteId: string) => {
    if (deletingQuoteId) return

    setDeletingQuoteId(quoteId)
    setError("")
    setFeedback("")

    const result = await deleteAppointmentPartQuote(quoteId)
    if (!result.success) {
      setError(result.error || "Could not delete the saved quote.")
      setDeletingQuoteId(null)
      return
    }

    setQuotes((currentQuotes) => currentQuotes.filter((quote) => quote.id !== quoteId))
    setDeletingQuoteId(null)
    router.refresh()
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-6">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageSearch className="h-5 w-5" />
              Parts Desk
            </CardTitle>
            <CardDescription>
              Select an appointment, review suggested replacement items, and save the exact quote the admin wants to keep on file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Live PartsTech and O&apos;Reilly price sync needs external supplier credentials. This workspace is ready for that hookup later, and already saves searchable quote history today.
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_180px]">
              <div className="space-y-2">
                <Label>Appointment</Label>
                <Select value={selectedAppointmentId || "none"} onValueChange={(value) => setSelectedAppointmentId(value === "none" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select appointment" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointments.length === 0 ? (
                      <SelectItem value="none">No appointments available</SelectItem>
                    ) : (
                      appointments.map((appointment) => (
                        <SelectItem key={appointment.id} value={appointment.id}>
                          {`${appointment.first_name} ${appointment.last_name}`.trim()} | {appointment.service_type || "No service"} | {formatLocalDate(appointment.appointment_date)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Search / compare</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="pl-9" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sort saved quotes</Label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-asc">Price low to high</SelectItem>
                    <SelectItem value="price-desc">Price high to low</SelectItem>
                    <SelectItem value="rating-desc">Rating</SelectItem>
                    <SelectItem value="popularity-desc">Most sold</SelectItem>
                    <SelectItem value="name-asc">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedAppointment && (
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{selectedAppointment.service_type || "General service"}</Badge>
                  <Badge variant="outline">{formatLocalDate(selectedAppointment.appointment_date)}</Badge>
                  {selectedAppointment.zip_code && <Badge variant="outline">ZIP {selectedAppointment.zip_code}</Badge>}
                </div>
                <p className="mt-3 text-sm font-medium">
                  {`${selectedAppointment.first_name} ${selectedAppointment.last_name}`.trim()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {[selectedAppointment.vehicle_year, selectedAppointment.vehicle_make, selectedAppointment.vehicle_model]
                    .filter(Boolean)
                    .join(" ") || "Vehicle details pending"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Suggested replacement parts</CardTitle>
            <CardDescription>
              These suggestions are based on the selected appointment and service. Use one to prefill the quote form, then save the exact supplier price you choose.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {suggestedParts.length === 0 ? (
              <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                Choose an appointment to load suggested parts.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {suggestedParts.map((suggestion, index) => (
                  <div key={suggestion.id} className="rounded-xl border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{suggestion.partName}</p>
                        <p className="text-sm text-muted-foreground">{suggestion.category}</p>
                      </div>
                      <Badge variant="secondary">{suggestion.supplierName}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                        <Star className="h-3 w-3" />
                        {suggestion.rating.toFixed(1)}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-1">Most sold score {suggestion.popularityScore}</span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{suggestion.notes}</p>
                    <Button type="button" variant="outline" className="mt-4 w-full bg-transparent" onClick={() => applySuggestion(index)}>
                      Use in quote form
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Create saved quote</CardTitle>
            <CardDescription>
              Save the exact part, price and source chosen for this customer so the admin always has a history tied to the appointment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="partName">Part name</Label>
                <Input id="partName" value={form.partName} onChange={(event) => handleFormChange("partName", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partCategory">Category</Label>
                <Input id="partCategory" value={form.partCategory} onChange={(event) => handleFormChange("partCategory", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierName">Supplier</Label>
                <Input id="supplierName" value={form.supplierName} onChange={(event) => handleFormChange("supplierName", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partNumber">Part number</Label>
                <Input id="partNumber" value={form.partNumber} onChange={(event) => handleFormChange("partNumber", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit price</Label>
                <Input
                  id="unitPrice"
                  inputMode="decimal"
                  value={form.unitPrice}
                  onChange={(event) => handleFormChange("unitPrice", event.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  inputMode="decimal"
                  value={form.rating}
                  onChange={(event) => handleFormChange("rating", event.target.value)}
                  placeholder="4.8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="popularity">Most sold score</Label>
                <Input
                  id="popularity"
                  inputMode="numeric"
                  value={form.popularityScore}
                  onChange={(event) => handleFormChange("popularityScore", event.target.value)}
                  placeholder="95"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="sourceUrl">Source URL</Label>
                <Input id="sourceUrl" value={form.sourceUrl} onChange={(event) => handleFormChange("sourceUrl", event.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" rows={4} className="resize-none" value={form.notes} onChange={(event) => handleFormChange("notes", event.target.value)} />
              </div>
            </div>

            {error && <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
            {feedback && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{feedback}</div>}

            <Button type="button" className="w-full" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving quote...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save to appointment history
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Saved quotes for this appointment</CardTitle>
            <CardDescription>
              Sorted by your current compare mode. This is the running history the admin can revisit later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredQuotes.length === 0 ? (
              <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                No saved quotes match this appointment yet.
              </div>
            ) : (
              filteredQuotes.map((quote) => (
                <div key={quote.id} className="rounded-xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{quote.part_name}</p>
                      <p className="text-sm text-muted-foreground">{quote.supplier_name}</p>
                    </div>
                    <p className="text-lg font-semibold">${(quote.unit_price ?? 0).toFixed(2)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {quote.part_category && <Badge variant="outline">{quote.part_category}</Badge>}
                    {quote.part_number && <Badge variant="outline">#{quote.part_number}</Badge>}
                    {quote.rating !== null && <Badge variant="outline">Rating {quote.rating.toFixed(1)}</Badge>}
                    {quote.popularity_score !== null && <Badge variant="outline">Most sold {quote.popularity_score}</Badge>}
                  </div>
                  {quote.notes && <p className="mt-3 text-sm text-muted-foreground">{quote.notes}</p>}
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      Saved {new Date(quote.created_at).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2">
                      {quote.source_url && (
                        <Button asChild variant="outline" size="sm" className="bg-transparent">
                          <a href={quote.source_url} target="_blank" rel="noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Source
                          </a>
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="bg-transparent text-destructive"
                        disabled={deletingQuoteId === quote.id}
                        onClick={() => handleDelete(quote.id)}
                      >
                        {deletingQuoteId === quote.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Recent quote history</CardTitle>
            <CardDescription>
              Quick view of the latest saved part-price combinations across customers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentHistory.length === 0 ? (
              <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                No quote history yet.
              </div>
            ) : (
              recentHistory.map((quote) => {
                const appointment = appointments.find((item) => item.id === quote.appointment_id)
                const customerLabel = appointment ? `${appointment.first_name} ${appointment.last_name}`.trim() : "Unknown appointment"

                return (
                  <div key={quote.id} className="rounded-xl border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{quote.part_name}</p>
                        <p className="text-sm text-muted-foreground">{customerLabel}</p>
                      </div>
                      <p className="font-semibold">${(quote.unit_price ?? 0).toFixed(2)}</p>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {appointment?.service_type || "No service"} | {quote.supplier_name}
                    </p>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
