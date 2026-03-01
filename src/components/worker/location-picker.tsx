'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SA_CITIES, getCitiesByProvince, type SACity } from '@/lib/data/sa-cities'
import { reverseGeocode } from '@/lib/maps/geocoding'
import { loadGoogleMaps, isGoogleMapsLoaded } from '@/lib/maps/google-maps'
import {
  MapPin, Navigation, Search, CheckCircle2, Loader2, Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkerServiceArea } from '@/lib/types/worker'

export interface LocationPickerProps {
  locationLat: number | null
  locationLng: number | null
  locationName: string
  serviceRadius: number
  serviceAreas: Omit<WorkerServiceArea, 'id' | 'worker_id' | 'created_at'>[]
  onLocationChange: (lat: number, lng: number, name: string) => void
  onRadiusChange: (radius: number) => void
  onServiceAreasChange: (areas: Omit<WorkerServiceArea, 'id' | 'worker_id' | 'created_at'>[]) => void
}

export function LocationPicker({
  locationLat,
  locationLng,
  locationName,
  serviceRadius,
  serviceAreas,
  onLocationChange,
  onRadiusChange,
  onServiceAreasChange,
}: LocationPickerProps) {
  const [citySearch, setCitySearch] = useState('')
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectError, setDetectError] = useState('')
  const [addressInput, setAddressInput] = useState('')
  const [addressResult, setAddressResult] = useState<{ name: string; lat: number; lng: number } | null>(null)
  const autocompleteRef = useRef<HTMLInputElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autocompleteInstance = useRef<any>(null)

  const citiesByProvince = useMemo(() => getCitiesByProvince(), [])

  // Selected city names from service areas
  const selectedCityNames = useMemo(
    () => serviceAreas.map(a => a.area_name),
    [serviceAreas]
  )

  // Filter cities by search
  const filteredProvinces = useMemo(() => {
    const q = citySearch.toLowerCase().trim()
    if (!q) return citiesByProvince
    const filtered: Record<string, SACity[]> = {}
    for (const [province, cities] of Object.entries(citiesByProvince)) {
      const matching = cities.filter(
        c => c.name.toLowerCase().includes(q) || province.toLowerCase().includes(q)
      )
      if (matching.length > 0) filtered[province] = matching
    }
    return filtered
  }, [citySearch, citiesByProvince])

  // Init Google Places Autocomplete
  useEffect(() => {
    let mounted = true
    async function init() {
      try {
        await loadGoogleMaps()
        if (!mounted || !autocompleteRef.current || !isGoogleMapsLoaded()) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const google = (window as any).google
        autocompleteInstance.current = new google.maps.places.Autocomplete(
          autocompleteRef.current,
          { componentRestrictions: { country: 'za' }, types: ['geocode'] }
        )
        autocompleteInstance.current.addListener('place_changed', () => {
          const place = autocompleteInstance.current.getPlace()
          if (place?.geometry?.location) {
            const lat = place.geometry.location.lat()
            const lng = place.geometry.location.lng()
            const name = place.formatted_address || place.name || ''
            // Extract suburb + city for friendly display
            const components = place.address_components || []
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const getComp = (type: string) => components.find((c: any) => c.types.includes(type))?.long_name
            const suburb = getComp('sublocality') || getComp('neighborhood')
            const city = getComp('locality')
            const friendlyName = [suburb, city].filter(Boolean).join(', ') || name
            setAddressResult({ name: friendlyName, lat, lng })
            onLocationChange(lat, lng, friendlyName)
          }
        })
      } catch {
        // Google Maps not available - address tab won't work
      }
    }
    init()
    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleCity = (city: SACity) => {
    const isSelected = selectedCityNames.includes(city.name)
    if (isSelected) {
      onServiceAreasChange(serviceAreas.filter(a => a.area_name !== city.name))
    } else {
      if (serviceAreas.length >= 10) return
      onServiceAreasChange([
        ...serviceAreas,
        { area_name: city.name, center_lat: city.lat, center_lng: city.lng, radius_km: 25 },
      ])
    }
  }

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setDetectError('Geolocation is not supported by your browser')
      return
    }
    setIsDetecting(true)
    setDetectError('')
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        try {
          const result = await reverseGeocode(lat, lng)
          const friendlyName = result
            ? [result.suburb, result.city].filter(Boolean).join(', ') || result.formattedAddress
            : `${lat.toFixed(4)}, ${lng.toFixed(4)}`
          onLocationChange(lat, lng, friendlyName)
        } catch {
          onLocationChange(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
        }
        setIsDetecting(false)
      },
      () => {
        setDetectError('Could not detect your location. Please check permissions.')
        setIsDetecting(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="space-y-4">
      {/* Current location summary */}
      {(locationLat && locationLng) || serviceAreas.length > 0 ? (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              {locationName && (
                <p className="text-sm font-medium text-emerald-900">
                  {locationName}
                </p>
              )}
              {serviceAreas.length > 0 && (
                <p className="text-xs text-emerald-700 mt-0.5">
                  {serviceAreas.length} {serviceAreas.length === 1 ? 'city' : 'cities'} selected
                  {locationLat ? ` + GPS location` : ''}
                </p>
              )}
              {locationLat && !serviceAreas.length && (
                <p className="text-xs text-emerald-700">
                  {serviceRadius}km service radius
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
          <p className="text-sm text-amber-800">
            No location set yet. Clients won&apos;t be able to find you in area searches.
          </p>
        </div>
      )}

      <Tabs defaultValue="cities" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cities" className="text-xs sm:text-sm">
            <Building2 className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
            Select Cities
          </TabsTrigger>
          <TabsTrigger value="address" className="text-xs sm:text-sm">
            <Search className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
            Address
          </TabsTrigger>
          <TabsTrigger value="gps" className="text-xs sm:text-sm">
            <Navigation className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
            Use GPS
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Select Cities */}
        <TabsContent value="cities" className="space-y-3 mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search cities..."
              value={citySearch}
              onChange={e => setCitySearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
            {Object.entries(filteredProvinces).map(([province, cities]) => (
              <div key={province}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 px-1">
                  {province}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {cities.map(city => {
                    const selected = selectedCityNames.includes(city.name)
                    return (
                      <button
                        key={city.name}
                        onClick={() => toggleCity(city)}
                        disabled={!selected && serviceAreas.length >= 10}
                        className={cn(
                          'flex items-center gap-1.5 px-2.5 py-2 text-sm rounded-lg border transition-all text-left',
                          selected
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium'
                            : 'border-border hover:border-emerald-300',
                          !selected && serviceAreas.length >= 10 && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        {selected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                        <span className="truncate">{city.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            {Object.keys(filteredProvinces).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No cities found for &quot;{citySearch}&quot;
              </p>
            )}
          </div>

          {serviceAreas.length > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              {serviceAreas.length}/10 cities selected
            </p>
          )}
        </TabsContent>

        {/* Tab 2: Address + Radius */}
        <TabsContent value="address" className="space-y-3 mt-3">
          <div>
            <Label className="text-sm mb-1 block">Search for your address</Label>
            <Input
              ref={autocompleteRef}
              placeholder="Type an address in South Africa..."
              value={addressInput}
              onChange={e => setAddressInput(e.target.value)}
              className="h-10"
            />
          </div>

          {addressResult && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-sm font-medium text-emerald-900">{addressResult.name}</p>
              </div>
            </div>
          )}

          {/* Radius slider */}
          <RadiusSlider value={serviceRadius} onChange={onRadiusChange} />
        </TabsContent>

        {/* Tab 3: Use GPS */}
        <TabsContent value="gps" className="space-y-3 mt-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="w-full gap-2 h-12"
          >
            {isDetecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            {isDetecting ? 'Detecting...' : locationLat ? 'Re-detect My Location' : 'Detect My Location'}
          </Button>

          {detectError && (
            <p className="text-sm text-destructive text-center">{detectError}</p>
          )}

          {locationLat && locationName && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-sm font-medium text-emerald-900">{locationName}</p>
              </div>
            </div>
          )}

          {/* Radius slider */}
          <RadiusSlider value={serviceRadius} onChange={onRadiusChange} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function RadiusSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">How far will you travel?</Label>
        <span className="text-sm font-bold text-emerald-700">{value} km</span>
      </div>
      <input
        type="range"
        min={5}
        max={100}
        step={5}
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>5 km</span>
        <span>50 km</span>
        <span>100 km</span>
      </div>
    </div>
  )
}
