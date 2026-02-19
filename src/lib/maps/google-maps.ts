/* eslint-disable @typescript-eslint/no-explicit-any */

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
  return loadPromise
}

export function isGoogleMapsLoaded(): boolean {
  return mapsLoaded && typeof (window as any).google !== 'undefined'
}

function getGoogle(): any {
  return (window as any).google
}

export function createMap(element: HTMLElement, options: { center: { lat: number; lng: number }; zoom?: number }): any {
  if (!isGoogleMapsLoaded()) return null
  const g = getGoogle()
  return new g.maps.Map(element, {
    center: options.center, zoom: options.zoom ?? 13,
    disableDefaultUI: true, zoomControl: true, mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
    styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }, { featureType: 'transit', stylers: [{ visibility: 'off' }] }],
  })
}

export function addMarker(map: any, position: { lat: number; lng: number }, options?: { title?: string; draggable?: boolean }): any {
  const g = getGoogle()
  return new g.maps.Marker({ map, position, title: options?.title, draggable: options?.draggable ?? false })
}

export function addCircleOverlay(map: any, center: { lat: number; lng: number }, radiusKm: number): any {
  const g = getGoogle()
  return new g.maps.Circle({ map, center, radius: radiusKm * 1000, fillColor: '#2563EB', fillOpacity: 0.1, strokeColor: '#2563EB', strokeOpacity: 0.3, strokeWeight: 2, editable: true, draggable: true })
}
