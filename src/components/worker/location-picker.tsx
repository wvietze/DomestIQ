'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type SACity } from '@/lib/data/sa-cities'
import { CitySelector } from '@/components/worker/city-selector'
import { reverseGeocode } from '@/lib/maps/geocoding'
import { loadGoogleMaps, isGoogleMapsLoaded } from '@/lib/maps/google-maps'
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
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectError, setDetectError] = useState('')
  const [addressResult, setAddressResult] = useState<{ name: string; lat: number; lng: number } | null>(null)
  const autocompleteRef = useRef<HTMLInputElement>(null)
  const autocompleteInstance = useRef<google.maps.places.Autocomplete | null>(null)

  const selectedCityNames = serviceAreas.map(a => a.area_name)

  useEffect(() => {
    let mounted = true
    async function init() {
      try {
        await loadGoogleMaps()
        if (!mounted || !autocompleteRef.current || !isGoogleMapsLoaded()) return
        const google = window.google
        autocompleteInstance.current = new google.maps.places.Autocomplete(
          autocompleteRef.current,
          { componentRestrictions: { country: 'za' }, types: ['geocode'] }
        )
        autocompleteInstance.current.addListener('place_changed', () => {
          const place = autocompleteInstance.current?.getPlace()
          if (place?.geometry?.location) {
            const lat = place.geometry.location.lat()
            const lng = place.geometry.location.lng()
            const name = place.formatted_address || place.name || ''
            const components = place.address_components || []
            interface AddressComponent { types: string[]; long_name: string; short_name: string }
            const getComp = (type: string) => components.find((c: AddressComponent) => c.types.includes(type))?.long_name
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
        <div className="rounded-lg bg-[#9ffdd3]/30 border border-[#97f5cc] p-3">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-base text-[#005d42] shrink-0 mt-0.5">location_on</span>
            <div className="flex-1 min-w-0">
              {locationName && (
                <p className="text-sm font-medium text-[#005d42]">
                  {locationName}
                </p>
              )}
              {serviceAreas.length > 0 && (
                <p className="text-xs text-[#005d42] mt-0.5">
                  {serviceAreas.length} {serviceAreas.length === 1 ? 'city' : 'cities'} selected
                  {locationLat ? ` + GPS location` : ''}
                </p>
              )}
              {locationLat && !serviceAreas.length && (
                <p className="text-xs text-[#005d42]">
                  {serviceRadius}km service radius
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-[#ffdcc3]/40 border border-[#ffdcc3] p-3">
          <p className="text-sm text-[#904d00]">
            No location set yet. Clients won&apos;t be able to find you in area searches.
          </p>
        </div>
      )}

      <Tabs defaultValue="cities" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cities" className="text-xs sm:text-sm">
            <span className="material-symbols-outlined text-sm mr-1 hidden sm:inline">location_city</span>
            Select Cities
          </TabsTrigger>
          <TabsTrigger value="address" className="text-xs sm:text-sm">
            <span className="material-symbols-outlined text-sm mr-1 hidden sm:inline">search</span>
            Address
          </TabsTrigger>
          <TabsTrigger value="gps" className="text-xs sm:text-sm">
            <span className="material-symbols-outlined text-sm mr-1 hidden sm:inline">my_location</span>
            Use GPS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cities" className="mt-3">
          <CitySelector
            selectedCities={selectedCityNames}
            onToggleCity={toggleCity}
            maxCities={10}
          />
        </TabsContent>

        <TabsContent value="address" className="space-y-3 mt-3">
          <div>
            <Label className="text-sm mb-1 block">Search for your address</Label>
            <input
              ref={autocompleteRef}
              placeholder="Type an address in South Africa..."
              className="flex h-10 w-full rounded-lg bg-[#f4f4f2] border-none px-3 py-2 text-sm placeholder:text-[#6e7a73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005d42]/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {addressResult && (
            <div className="rounded-lg bg-[#9ffdd3]/30 border border-[#97f5cc] p-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-[#005d42] shrink-0">check_circle</span>
                <p className="text-sm font-medium text-[#005d42]">{addressResult.name}</p>
              </div>
            </div>
          )}

          <RadiusSlider value={serviceRadius} onChange={onRadiusChange} />
        </TabsContent>

        <TabsContent value="gps" className="space-y-3 mt-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="w-full gap-2 h-12 border-[#bdc9c1] text-[#1a1c1b] hover:bg-[#f4f4f2]"
          >
            <span className={`material-symbols-outlined text-base ${isDetecting ? 'animate-spin' : ''}`}>
              {isDetecting ? 'progress_activity' : 'my_location'}
            </span>
            {isDetecting ? 'Detecting...' : locationLat ? 'Re-detect My Location' : 'Detect My Location'}
          </Button>

          {detectError && (
            <p className="text-sm text-[#ba1a1a] text-center">{detectError}</p>
          )}

          {locationLat && locationName && (
            <div className="rounded-lg bg-[#9ffdd3]/30 border border-[#97f5cc] p-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-[#005d42] shrink-0">check_circle</span>
                <p className="text-sm font-medium text-[#005d42]">{locationName}</p>
              </div>
            </div>
          )}

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
        <span className="text-sm font-bold text-[#005d42]">{value} km</span>
      </div>
      <input
        type="range"
        min={5}
        max={100}
        step={5}
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-[#9ffdd3] rounded-lg appearance-none cursor-pointer accent-[#005d42]"
      />
      <div className="flex justify-between text-xs text-[#3e4943]">
        <span>5 km</span>
        <span>50 km</span>
        <span>100 km</span>
      </div>
    </div>
  )
}
