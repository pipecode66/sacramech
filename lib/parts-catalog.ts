import { inferServiceOptionId } from "@/lib/service-options"

export interface PartSuggestion {
  id: string
  partName: string
  category: string
  supplierName: string
  rating: number
  popularityScore: number
  notes: string
}

interface AppointmentLike {
  id: string
  first_name?: string | null
  last_name?: string | null
  service_type?: string | null
  vehicle_year?: string | null
  vehicle_make?: string | null
  vehicle_model?: string | null
}

const DEFAULT_SUPPLIER = "O'Reilly Auto Parts"

const SUGGESTION_PRESETS: Record<string, Omit<PartSuggestion, "id">[]> = {
  "oil-change": [
    {
      partName: "Full Synthetic Engine Oil",
      category: "Fluids",
      supplierName: DEFAULT_SUPPLIER,
      rating: 4.8,
      popularityScore: 98,
      notes: "Verify viscosity against the owner's manual before saving the quote.",
    },
    {
      partName: "Engine Oil Filter",
      category: "Filters",
      supplierName: DEFAULT_SUPPLIER,
      rating: 4.7,
      popularityScore: 96,
      notes: "Match filter size to the selected VIN or manual vehicle entry.",
    },
    {
      partName: "Drain Plug Gasket",
      category: "Hardware",
      supplierName: DEFAULT_SUPPLIER,
      rating: 4.4,
      popularityScore: 81,
      notes: "Useful for avoiding leaks when the drain plug washer is worn.",
    },
  ],
  "battery-replacement": [
    {
      partName: "Battery Group Match",
      category: "Electrical",
      supplierName: DEFAULT_SUPPLIER,
      rating: 4.8,
      popularityScore: 94,
      notes: "Confirm cold cranking amps and terminal orientation before purchase.",
    },
    {
      partName: "Battery Terminal Protectors",
      category: "Electrical",
      supplierName: DEFAULT_SUPPLIER,
      rating: 4.5,
      popularityScore: 78,
      notes: "Low-cost add-on that helps prevent future corrosion.",
    },
    {
      partName: "Battery Hold-Down Kit",
      category: "Hardware",
      supplierName: DEFAULT_SUPPLIER,
      rating: 4.3,
      popularityScore: 66,
      notes: "Use when the original clamp or bracket is damaged or missing.",
    },
  ],
  "brake-service": [
    {
      partName: "Front Brake Pad Set",
      category: "Brakes",
      supplierName: DEFAULT_SUPPLIER,
      rating: 4.9,
      popularityScore: 99,
      notes: "Most common replacement item for standard brake service appointments.",
    },
    {
      partName: "Brake Rotor Pair",
      category: "Brakes",
      supplierName: DEFAULT_SUPPLIER,
      rating: 4.8,
      popularityScore: 93,
      notes: "Check thickness and minimum spec before quoting resurfacing vs replacement.",
    },
    {
      partName: "Brake Hardware Kit",
      category: "Brakes",
      supplierName: DEFAULT_SUPPLIER,
      rating: 4.5,
      popularityScore: 82,
      notes: "Recommended when clips and shims are worn or noisy.",
    },
    {
      partName: "Brake Fluid DOT 3 / DOT 4",
      category: "Fluids",
      supplierName: DEFAULT_SUPPLIER,
      rating: 4.6,
      popularityScore: 77,
      notes: "Useful when the service includes a flush or contamination is present.",
    },
  ],
  "engine-repair": [
    {
      partName: "Spark Plug Set",
      category: "Ignition",
      supplierName: DEFAULT_SUPPLIER,
      rating: 4.8,
      popularityScore: 91,
      notes: "Useful for tune-up, misfire and maintenance-related engine work.",
    },
    {
      partName: "Ignition Coil",
      category: "Ignition",
      supplierName: DEFAULT_SUPPLIER,
      rating: 4.6,
      popularityScore: 83,
      notes: "Common add-on quote when codes or symptoms suggest a weak coil pack.",
    },
    {
      partName: "Serpentine Belt",
      category: "Belts",
      supplierName: DEFAULT_SUPPLIER,
      rating: 4.7,
      popularityScore: 79,
      notes: "Relevant when belt inspection shows cracks, glazing or noise.",
    },
    {
      partName: "Engine Air Filter",
      category: "Filters",
      supplierName: DEFAULT_SUPPLIER,
      rating: 4.4,
      popularityScore: 74,
      notes: "Simple upsell when performance issues pair with a dirty intake filter.",
    },
  ],
  "general-maintenance": [
    {
      partName: "Cabin Air Filter",
      category: "Filters",
      supplierName: DEFAULT_SUPPLIER,
      rating: 4.5,
      popularityScore: 88,
      notes: "Pairs well with filter replacement and A/C airflow complaints.",
    },
    {
      partName: "Engine Air Filter",
      category: "Filters",
      supplierName: DEFAULT_SUPPLIER,
      rating: 4.4,
      popularityScore: 84,
      notes: "Useful for tune-up visits and airflow-related maintenance.",
    },
    {
      partName: "Wiper Blade Set",
      category: "Exterior",
      supplierName: DEFAULT_SUPPLIER,
      rating: 4.6,
      popularityScore: 86,
      notes: "Fits the broader maintenance package requested by the client.",
    },
    {
      partName: "Serpentine Belt",
      category: "Belts",
      supplierName: DEFAULT_SUPPLIER,
      rating: 4.7,
      popularityScore: 81,
      notes: "Useful when the maintenance request includes belt inspection.",
    },
    {
      partName: "Coolant / Antifreeze",
      category: "Fluids",
      supplierName: DEFAULT_SUPPLIER,
      rating: 4.6,
      popularityScore: 73,
      notes: "Relevant for fluid top-offs and general preventive service.",
    },
  ],
}

export function getSuggestedPartsForAppointment(appointment?: AppointmentLike | null) {
  if (!appointment) return []

  const serviceId = inferServiceOptionId(appointment.service_type)
  const preset = (serviceId ? SUGGESTION_PRESETS[serviceId] : SUGGESTION_PRESETS["general-maintenance"]) || []
  const vehicle = [appointment.vehicle_year, appointment.vehicle_make, appointment.vehicle_model].filter(Boolean).join(" ")

  return preset.map((suggestion, index) => ({
    ...suggestion,
    id: `${appointment.id}-${serviceId || "general"}-${index}`,
    notes: vehicle ? `${suggestion.notes} Vehicle context: ${vehicle}.` : suggestion.notes,
  }))
}

export function buildSuggestedSearchTerm(appointment?: AppointmentLike | null) {
  if (!appointment) return ""

  const serviceId = inferServiceOptionId(appointment.service_type)
  const vehicle = [appointment.vehicle_year, appointment.vehicle_make, appointment.vehicle_model].filter(Boolean).join(" ").trim()
  const customerName = [appointment.first_name, appointment.last_name].filter(Boolean).join(" ").trim()

  const serviceLabel = serviceId
    ? serviceId.replace(/-/g, " ")
    : (appointment.service_type || "replacement parts").trim()

  return [vehicle, serviceLabel, customerName].filter(Boolean).join(" | ")
}
