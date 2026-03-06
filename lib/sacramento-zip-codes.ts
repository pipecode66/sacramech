// Sacramento area ZIP codes (95xxx series)
export const SACRAMENTO_ZIP_CODES = [
  "95811", "95812", "95813", "95814", "95815", "95816", "95817", "95818", "95819",
  "95820", "95821", "95822", "95823", "95824", "95825", "95826", "95827", "95828",
  "95829", "95830", "95831", "95832", "95833", "95834", "95835", "95836", "95837",
  "95838", "95840", "95841", "95842", "95843", "95851", "95852", "95853", "95857",
  "95860", "95864", "95865", "95866", "95867", "95887", "95894", "95899",
  // 94xxx series (Sacramento government/business)
  "94203", "94204", "94205", "94206", "94207", "94208", "94209", "94211",
  "94229", "94230", "94232", "94234", "94235", "94236", "94237", "94239",
  "94240", "94244", "94245", "94246", "94247", "94248", "94249", "94250",
  "94252", "94253", "94254", "94256", "94257", "94258", "94259", "94261",
  "94262", "94263", "94267", "94268", "94269", "94271", "94273", "94274",
  "94277", "94278", "94279", "94280", "94282", "94283", "94284", "94285",
  "94286", "94287", "94288", "94289", "94290", "94291", "94293", "94294",
  "94295", "94296", "94297", "94298", "94299",
  // West Sacramento
  "95605", "95691", "95798", "95799",
  // Elk Grove
  "95624", "95757", "95758", "95759",
  // Rancho Cordova
  "95670", "95741", "95742",
  // Citrus Heights
  "95610", "95611", "95621",
  // Folsom
  "95630", "95763",
  // Carmichael
  "95608", "95609",
  // Fair Oaks
  "95628",
  // Orangevale
  "95662",
  // North Highlands
  "95660",
  // Antelope
  "95843",
]

// Cardinal direction type
export type CardinalDirection = "North" | "South" | "East" | "West" | "Central" | "Northeast" | "Northwest" | "Southeast" | "Southwest"

// Interface for ZIP code information
export interface ZipCodeInfo {
  cities: string[]
  cardinal: CardinalDirection
  region: string
}

// Mapping of ZIP codes to detailed information
export const ZIP_CODE_TO_INFO: Record<string, ZipCodeInfo> = {
  // Central Sacramento (Downtown, midtown, etc.)
  "95811": { cities: ["Sacramento"], cardinal: "Central", region: "Downtown Sacramento" },
  "95812": { cities: ["Sacramento"], cardinal: "Central", region: "Downtown Sacramento" },
  "95813": { cities: ["Sacramento"], cardinal: "Central", region: "Downtown Sacramento" },
  "95814": { cities: ["Sacramento"], cardinal: "Central", region: "Midtown Sacramento" },
  "95816": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "95818": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "95819": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },

  // North Sacramento
  "95815": { cities: ["Sacramento"], cardinal: "North", region: "North Sacramento" },
  "95821": { cities: ["Sacramento"], cardinal: "North", region: "North Sacramento" },
  "95829": { cities: ["Sacramento"], cardinal: "North", region: "North Sacramento" },
  "95838": { cities: ["Sacramento"], cardinal: "North", region: "North Sacramento" },
  "95841": { cities: ["Sacramento"], cardinal: "North", region: "North Sacramento" },
  "95851": { cities: ["Sacramento"], cardinal: "North", region: "North Sacramento" },

  // South Sacramento
  "95820": { cities: ["Sacramento"], cardinal: "South", region: "South Sacramento" },
  "95822": { cities: ["Sacramento"], cardinal: "South", region: "South Sacramento" },
  "95823": { cities: ["Sacramento"], cardinal: "South", region: "South Sacramento" },
  "95824": { cities: ["Sacramento"], cardinal: "South", region: "South Sacramento" },
  "95828": { cities: ["Sacramento"], cardinal: "South", region: "South Sacramento" },
  "95832": { cities: ["Sacramento"], cardinal: "South", region: "South Sacramento" },
  "95833": { cities: ["Sacramento"], cardinal: "South", region: "South Sacramento" },

  // East Sacramento
  "95825": { cities: ["Sacramento"], cardinal: "East", region: "East Sacramento" },
  "95826": { cities: ["Sacramento"], cardinal: "East", region: "East Sacramento" },
  "95827": { cities: ["Sacramento"], cardinal: "East", region: "East Sacramento" },
  "95831": { cities: ["Sacramento"], cardinal: "East", region: "East Sacramento" },
  "95852": { cities: ["Sacramento"], cardinal: "East", region: "East Sacramento" },
  "95857": { cities: ["Sacramento"], cardinal: "East", region: "East Sacramento" },

  // West Sacramento
  "95605": { cities: ["West Sacramento"], cardinal: "West", region: "West Sacramento" },
  "95691": { cities: ["West Sacramento"], cardinal: "West", region: "West Sacramento" },
  "95798": { cities: ["West Sacramento"], cardinal: "West", region: "West Sacramento" },
  "95799": { cities: ["West Sacramento"], cardinal: "West", region: "West Sacramento" },

  // Remaining Sacramento ZIP codes
  "95817": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "95830": { cities: ["Sacramento"], cardinal: "South", region: "South Sacramento" },
  "95834": { cities: ["Sacramento"], cardinal: "South", region: "South Sacramento" },
  "95835": { cities: ["Sacramento"], cardinal: "South", region: "South Sacramento" },
  "95836": { cities: ["Sacramento"], cardinal: "East", region: "East Sacramento" },
  "95837": { cities: ["Sacramento"], cardinal: "South", region: "South Sacramento" },
  "95840": { cities: ["Sacramento"], cardinal: "North", region: "North Sacramento" },
  "95842": { cities: ["Sacramento"], cardinal: "East", region: "East Sacramento" },
  "95843": { cities: ["Sacramento", "Antelope"], cardinal: "North", region: "North Sacramento / Antelope" },
  "95853": { cities: ["Sacramento"], cardinal: "East", region: "East Sacramento" },
  "95860": { cities: ["Sacramento"], cardinal: "North", region: "North Sacramento" },
  "95864": { cities: ["Sacramento"], cardinal: "East", region: "East Sacramento" },
  "95865": { cities: ["Sacramento"], cardinal: "East", region: "East Sacramento" },
  "95866": { cities: ["Sacramento"], cardinal: "East", region: "East Sacramento" },
  "95867": { cities: ["Sacramento"], cardinal: "East", region: "East Sacramento" },
  "95887": { cities: ["Sacramento"], cardinal: "East", region: "East Sacramento" },
  "95894": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "95899": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },

  // 94xxx series (Sacramento government/business)
  "94203": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94204": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94205": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94206": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94207": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94208": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94209": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94211": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94229": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94230": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94232": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94234": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94235": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94236": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94237": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94239": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94240": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94244": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94245": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94246": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94247": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94248": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94249": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94250": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94252": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94253": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94254": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94256": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94257": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94258": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94259": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94261": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94262": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94263": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94267": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94268": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94269": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94271": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94273": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94274": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94277": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94278": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94279": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94280": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94282": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94283": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94284": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94285": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94286": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94287": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94288": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94289": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94290": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94291": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94293": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94294": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94295": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94296": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94297": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94298": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },
  "94299": { cities: ["Sacramento"], cardinal: "Central", region: "Central Sacramento" },

  // Elk Grove (Southeast)
  "95624": { cities: ["Elk Grove"], cardinal: "Southeast", region: "Elk Grove" },
  "95757": { cities: ["Elk Grove"], cardinal: "Southeast", region: "Elk Grove" },
  "95758": { cities: ["Elk Grove", "Sacramento"], cardinal: "Southeast", region: "Elk Grove / East Sacramento" },
  "95759": { cities: ["Elk Grove"], cardinal: "Southeast", region: "Elk Grove" },

  // Rancho Cordova (East)
  "95670": { cities: ["Rancho Cordova"], cardinal: "East", region: "Rancho Cordova" },
  "95741": { cities: ["Rancho Cordova"], cardinal: "East", region: "Rancho Cordova" },
  "95742": { cities: ["Rancho Cordova"], cardinal: "East", region: "Rancho Cordova" },

  // Citrus Heights (North)
  "95610": { cities: ["Citrus Heights"], cardinal: "North", region: "Citrus Heights" },
  "95611": { cities: ["Citrus Heights"], cardinal: "North", region: "Citrus Heights" },
  "95621": { cities: ["Citrus Heights"], cardinal: "North", region: "Citrus Heights" },

  // Folsom (East)
  "95630": { cities: ["Folsom"], cardinal: "East", region: "Folsom" },
  "95763": { cities: ["Folsom"], cardinal: "East", region: "Folsom" },

  // Carmichael (Northeast)
  "95608": { cities: ["Carmichael"], cardinal: "Northeast", region: "Carmichael" },
  "95609": { cities: ["Carmichael"], cardinal: "Northeast", region: "Carmichael" },

  // Fair Oaks (Northeast)
  "95628": { cities: ["Fair Oaks"], cardinal: "Northeast", region: "Fair Oaks" },

  // Orangevale (Northeast)
  "95662": { cities: ["Orangevale"], cardinal: "Northeast", region: "Orangevale" },

  // North Highlands (North)
  "95660": { cities: ["North Highlands"], cardinal: "North", region: "North Highlands" },
}

// Mapping of ZIP codes to valid cities (for backward compatibility)
export const ZIP_CODE_TO_CITIES: Record<string, string[]> = {}

// Populate ZIP_CODE_TO_CITIES from ZIP_CODE_TO_INFO for backward compatibility
Object.entries(ZIP_CODE_TO_INFO).forEach(([zip, info]) => {
  ZIP_CODE_TO_CITIES[zip] = info.cities
})

export function isValidSacramentoZip(zipCode: string): boolean {
  return SACRAMENTO_ZIP_CODES.includes(zipCode.trim())
}

/**
 * Validates that a city is valid for the given ZIP code
 */
export function isValidCityForZip(zipCode: string, city: string): boolean {
  const validCities = ZIP_CODE_TO_CITIES[zipCode.trim()]
  if (!validCities) return false

  // Case-insensitive comparison
  return validCities.some(validCity =>
    validCity.toLowerCase() === city.trim().toLowerCase()
  )
}

/**
 * Gets cardinal direction for a ZIP code
 */
export function getCardinalDirection(zipCode: string): CardinalDirection {
  const info = ZIP_CODE_TO_INFO[zipCode.trim()]
  return info?.cardinal || "Central"
}

/**
 * Gets region name for a ZIP code
 */
export function getRegionName(zipCode: string): string {
  const info = ZIP_CODE_TO_INFO[zipCode.trim()]
  return info?.region || "Sacramento Area"
}

/**
 * Gets full ZIP code information
 */
export function getZipCodeInfo(zipCode: string): ZipCodeInfo | null {
  return ZIP_CODE_TO_INFO[zipCode.trim()] || null
}

