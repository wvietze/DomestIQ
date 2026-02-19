const EARTH_RADIUS_KM = 6371

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`
  if (km < 10) return `${km.toFixed(1)}km`
  return `${Math.round(km)}km`
}

export function isWithinRadius(centerLat: number, centerLng: number, pointLat: number, pointLng: number, radiusKm: number): boolean {
  return calculateDistance(centerLat, centerLng, pointLat, pointLng) <= radiusKm
}

export function getDirectionsUrl(fromLat: number, fromLng: number, toLat: number, toLng: number): string {
  return `https://www.google.com/maps/dir/${fromLat},${fromLng}/${toLat},${toLng}`
}
