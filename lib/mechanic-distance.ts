export type MechanicDistanceCategory = "near" | "intermediate" | "far" | "optional"

export interface LocationCoordinates {
  latitude?: number | null
  longitude?: number | null
  zipCode?: string | null
}

export interface RankedMechanic<TMechanic> {
  mechanic: TMechanic
  distanceMiles: number
  category: MechanicDistanceCategory
  rank: number
}

const ZIP_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  "92203": { latitude: 33.7553, longitude: -116.2346 },
  "95605": { latitude: 38.5923, longitude: -121.5405 },
  "95608": { latitude: 38.6284, longitude: -121.3283 },
  "95610": { latitude: 38.6946, longitude: -121.2694 },
  "95621": { latitude: 38.6942, longitude: -121.3096 },
  "95624": { latitude: 38.4241, longitude: -121.3374 },
  "95628": { latitude: 38.6538, longitude: -121.2535 },
  "95630": { latitude: 38.6779, longitude: -121.1761 },
  "95660": { latitude: 38.6754, longitude: -121.3749 },
  "95662": { latitude: 38.6843, longitude: -121.2222 },
  "95670": { latitude: 38.6042, longitude: -121.2808 },
  "95691": { latitude: 38.5557, longitude: -121.5786 },
  "95741": { latitude: 38.6321, longitude: -121.2144 },
  "95742": { latitude: 38.5715, longitude: -121.1724 },
  "95757": { latitude: 38.3794, longitude: -121.4368 },
  "95758": { latitude: 38.4277, longitude: -121.4444 },
  "95811": { latitude: 38.5828, longitude: -121.4939 },
  "95814": { latitude: 38.5816, longitude: -121.4944 },
  "95815": { latitude: 38.6107, longitude: -121.4494 },
  "95816": { latitude: 38.5735, longitude: -121.4677 },
  "95818": { latitude: 38.5596, longitude: -121.4966 },
  "95819": { latitude: 38.5687, longitude: -121.4368 },
  "95820": { latitude: 38.5343, longitude: -121.4458 },
  "95821": { latitude: 38.6253, longitude: -121.3839 },
  "95822": { latitude: 38.5123, longitude: -121.4956 },
  "95823": { latitude: 38.4776, longitude: -121.4437 },
  "95824": { latitude: 38.5186, longitude: -121.4419 },
  "95825": { latitude: 38.5898, longitude: -121.4081 },
  "95826": { latitude: 38.5439, longitude: -121.3777 },
  "95827": { latitude: 38.5632, longitude: -121.3283 },
  "95828": { latitude: 38.4881, longitude: -121.3957 },
  "95829": { latitude: 38.4835, longitude: -121.3354 },
  "95831": { latitude: 38.4944, longitude: -121.5294 },
  "95832": { latitude: 38.4568, longitude: -121.4991 },
  "95833": { latitude: 38.6151, longitude: -121.5123 },
  "95834": { latitude: 38.6375, longitude: -121.5235 },
  "95835": { latitude: 38.6776, longitude: -121.5253 },
  "95838": { latitude: 38.6462, longitude: -121.4454 },
  "95841": { latitude: 38.6624, longitude: -121.3468 },
  "95842": { latitude: 38.6878, longitude: -121.3504 },
  "95843": { latitude: 38.7158, longitude: -121.3619 },
  "95864": { latitude: 38.5891, longitude: -121.3711 },
}

const DEFAULT_CALIFORNIA_COORDINATES = {
  south: { latitude: 34.0522, longitude: -118.2437 },
  central: { latitude: 36.7378, longitude: -119.7871 },
  north: { latitude: 38.5816, longitude: -121.4944 },
}

function normalizeZipCode(value: string | null | undefined) {
  return (value ?? "").replace(/\D/g, "").slice(0, 5)
}

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

function getCoordinateFallback(zipCode: string | null | undefined) {
  const cleanZip = normalizeZipCode(zipCode)
  if (cleanZip.length !== 5) return null

  const knownCoordinates = ZIP_COORDINATES[cleanZip]
  if (knownCoordinates) return knownCoordinates

  const numericZipCode = Number.parseInt(cleanZip, 10)
  if (Number.isNaN(numericZipCode)) return null

  if (numericZipCode >= 90000 && numericZipCode <= 92999) return DEFAULT_CALIFORNIA_COORDINATES.south
  if (numericZipCode >= 93000 && numericZipCode <= 93999) return DEFAULT_CALIFORNIA_COORDINATES.central
  if (numericZipCode >= 94000 && numericZipCode <= 96199) return DEFAULT_CALIFORNIA_COORDINATES.north

  return null
}

export function getUsableCoordinates(location: LocationCoordinates) {
  const latitude = typeof location.latitude === "number" ? location.latitude : null
  const longitude = typeof location.longitude === "number" ? location.longitude : null

  if (latitude !== null && longitude !== null && Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return { latitude, longitude }
  }

  return getCoordinateFallback(location.zipCode)
}

export function getDistanceMiles(firstLocation: LocationCoordinates, secondLocation: LocationCoordinates) {
  const firstCoordinates = getUsableCoordinates(firstLocation)
  const secondCoordinates = getUsableCoordinates(secondLocation)

  if (!firstCoordinates || !secondCoordinates) return null

  const earthRadiusMiles = 3958.8
  const latitudeDelta = toRadians(secondCoordinates.latitude - firstCoordinates.latitude)
  const longitudeDelta = toRadians(secondCoordinates.longitude - firstCoordinates.longitude)

  const firstLatitude = toRadians(firstCoordinates.latitude)
  const secondLatitude = toRadians(secondCoordinates.latitude)

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2

  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

function getDistanceCategory(distanceMiles: number, sameZipCode: boolean): MechanicDistanceCategory | null {
  if (sameZipCode || distanceMiles <= 6) return "near"
  if (distanceMiles <= 12) return "optional"
  if (distanceMiles <= 25) return "intermediate"
  if (distanceMiles <= 45) return "far"
  return null
}

export function rankMechanicsByDistance<TMechanic extends LocationCoordinates>(
  appointmentLocation: LocationCoordinates,
  mechanics: TMechanic[],
): Array<RankedMechanic<TMechanic>> {
  const appointmentZipCode = normalizeZipCode(appointmentLocation.zipCode)

  return mechanics
    .map((mechanic) => {
      const distanceMiles = getDistanceMiles(appointmentLocation, mechanic)
      if (distanceMiles === null) return null

      const sameZipCode = Boolean(appointmentZipCode && appointmentZipCode === normalizeZipCode(mechanic.zipCode))
      const category = getDistanceCategory(distanceMiles, sameZipCode)
      if (!category) return null

      return {
        mechanic,
        distanceMiles,
        category,
      }
    })
    .filter((match): match is Omit<RankedMechanic<TMechanic>, "rank"> => Boolean(match))
    .sort((first, second) => first.distanceMiles - second.distanceMiles)
    .map((match, index) => ({
      ...match,
      rank: index + 1,
    }))
}
