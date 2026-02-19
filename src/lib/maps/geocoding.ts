export interface GeocodingResult {
  lat: number; lng: number; formattedAddress: string
  suburb: string | null; city: string | null; province: string | null
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) return null
  try {
    const encoded = encodeURIComponent(address + ', South Africa')
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${apiKey}&region=za`)
    const data = await res.json()
    if (data.status !== 'OK' || !data.results?.length) return null
    const result = data.results[0]
    const components = result.address_components || []
    const getComponent = (type: string) => components.find((c: { types: string[] }) => c.types.includes(type))?.long_name ?? null
    return { lat: result.geometry.location.lat, lng: result.geometry.location.lng, formattedAddress: result.formatted_address, suburb: getComponent('sublocality') || getComponent('neighborhood'), city: getComponent('locality'), province: getComponent('administrative_area_level_1') }
  } catch { return null }
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) return null
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&region=za`)
    const data = await res.json()
    if (data.status !== 'OK' || !data.results?.length) return null
    const result = data.results[0]
    const components = result.address_components || []
    const getComponent = (type: string) => components.find((c: { types: string[] }) => c.types.includes(type))?.long_name ?? null
    return { lat, lng, formattedAddress: result.formatted_address, suburb: getComponent('sublocality') || getComponent('neighborhood'), city: getComponent('locality'), province: getComponent('administrative_area_level_1') }
  } catch { return null }
}

export function getSuburbOnly(address: string): string {
  const parts = address.split(',').map(p => p.trim())
  return parts.length >= 2 ? parts[0] + ', ' + parts[1] : parts[0] || 'Unknown area'
}
