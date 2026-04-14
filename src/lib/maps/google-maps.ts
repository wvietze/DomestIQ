// Extend the Window interface to avoid `any` casts for Google Maps
declare global {
  interface Window {
    google: typeof google
  }
}

let mapsLoaded = false
let loadPromise: Promise<void> | null = null

export function loadGoogleMaps(): Promise<void> {
  if (mapsLoaded) return Promise.resolve()
  if (loadPromise) return loadPromise
  loadPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') { reject(new Error('Browser only')); return }
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) { reject(new Error('Google Maps API key not set')); return }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`
    script.async = true
    script.defer = true
    script.onload = () => { mapsLoaded = true; resolve() }
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })
  // Clear the cached promise on failure so a later call can retry instead of
  // inheriting the same rejection (e.g. when the first attempt happened on a
  // page with a CSP that blocked Google Maps).
  loadPromise.catch(() => { loadPromise = null })
  return loadPromise
}

export function isGoogleMapsLoaded(): boolean {
  return mapsLoaded && typeof window.google !== 'undefined'
}

function getGoogle(): typeof google {
  return window.google
}

export function createMap(element: HTMLElement, options: { center: { lat: number; lng: number }; zoom?: number }): google.maps.Map | null {
  if (!isGoogleMapsLoaded()) return null
  const g = getGoogle()
  return new g.maps.Map(element, {
    center: options.center, zoom: options.zoom ?? 13,
    disableDefaultUI: true, zoomControl: true, mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
    styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }, { featureType: 'transit', stylers: [{ visibility: 'off' }] }],
  })
}

export function addMarker(map: google.maps.Map, position: { lat: number; lng: number }, options?: { title?: string; draggable?: boolean }): google.maps.Marker {
  const g = getGoogle()
  return new g.maps.Marker({ map, position, title: options?.title, draggable: options?.draggable ?? false })
}

export function addCircleOverlay(map: google.maps.Map, center: { lat: number; lng: number }, radiusKm: number): google.maps.Circle {
  const g = getGoogle()
  return new g.maps.Circle({ map, center, radius: radiusKm * 1000, fillColor: '#2563EB', fillOpacity: 0.1, strokeColor: '#2563EB', strokeOpacity: 0.3, strokeWeight: 2, editable: true, draggable: true })
}
