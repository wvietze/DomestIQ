'use client'

import { useEffect, useRef, useState } from 'react'
import { loadGoogleMaps, isGoogleMapsLoaded } from '@/lib/maps/google-maps'

export interface AddressResult {
  formattedAddress: string
  suburb: string | null
  city: string | null
  province: string | null
  lat: number
  lng: number
}

interface AddressAutocompleteProps {
  id?: string
  value?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  onSelect: (result: AddressResult) => void
  onClear?: () => void
  className?: string
}

interface AddressComponent {
  types: string[]
  long_name: string
  short_name: string
}

// Reusable Google Places Autocomplete input restricted to South Africa.
// Returns a structured AddressResult with lat/lng and parsed suburb/city/province.
export function AddressAutocomplete({
  id,
  value,
  placeholder = 'Start typing your address…',
  required,
  disabled,
  onSelect,
  onClear,
  className = '',
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const instanceRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [internalValue, setInternalValue] = useState(value ?? '')

  // Keep input in sync if parent updates value externally
  useEffect(() => {
    if (value !== undefined) setInternalValue(value)
  }, [value])

  useEffect(() => {
    let mounted = true
    async function init() {
      try {
        await loadGoogleMaps()
        if (!mounted || !inputRef.current || !isGoogleMapsLoaded()) return
        const google = window.google
        instanceRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'za' },
          types: ['geocode'],
          fields: ['formatted_address', 'geometry', 'address_components', 'name'],
        })
        instanceRef.current.addListener('place_changed', () => {
          const place = instanceRef.current?.getPlace()
          if (!place?.geometry?.location) return
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          const components = (place.address_components || []) as AddressComponent[]
          const get = (type: string) =>
            components.find((c) => c.types.includes(type))?.long_name ?? null
          const suburb = get('sublocality') || get('sublocality_level_1') || get('neighborhood')
          const city = get('locality') || get('postal_town')
          const province = get('administrative_area_level_1')
          const formatted = place.formatted_address || place.name || ''
          setInternalValue(formatted)
          onSelect({ formattedAddress: formatted, suburb, city, province, lat, lng })
        })
        setReady(true)
      } catch {
        setLoadError(true)
      }
    }
    init()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={internalValue}
        onChange={(e) => {
          setInternalValue(e.target.value)
          if (e.target.value === '' && onClear) onClear()
        }}
        placeholder={loadError ? 'Address lookup unavailable' : placeholder}
        required={required}
        disabled={disabled || loadError}
        autoComplete="off"
        className={
          className ||
          'flex h-10 w-full rounded-lg bg-[#f4f4f2] border-none px-3 py-2 text-sm placeholder:text-[#6e7a73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005d42]/30 disabled:cursor-not-allowed disabled:opacity-50'
        }
      />
      {!ready && !loadError && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-[#6e7a73] animate-spin">
          progress_activity
        </span>
      )}
    </div>
  )
}
