'use client'

import { useEffect, useRef } from 'react'
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
  // Rendered via defaultValue only. Parents that need to reset or prefill
  // after mount should pass a new `key` to force a remount — the input must
  // stay uncontrolled so Google Places can mutate it directly without React
  // fighting back (this was the bug behind the previous 'cannot type' issue).
  initialValue?: string
  placeholder?: string
  required?: boolean
  onSelect: (result: AddressResult) => void
  className?: string
}

interface AddressComponent {
  types: string[]
  long_name: string
  short_name: string
}

export function AddressAutocomplete({
  id,
  initialValue,
  placeholder = 'Start typing your address…',
  required,
  onSelect,
  className = '',
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const instanceRef = useRef<google.maps.places.Autocomplete | null>(null)

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
          onSelect({ formattedAddress: formatted, suburb, city, province, lat, lng })
        })
      } catch {
        // Google Maps unavailable — the input still works as a plain text field.
      }
    }
    init()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      defaultValue={initialValue ?? ''}
      placeholder={placeholder}
      required={required}
      autoComplete="new-password"
      className={
        className ||
        'flex h-10 w-full rounded-lg bg-[#f4f4f2] border-none px-3 py-2 text-sm placeholder:text-[#6e7a73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005d42]/30'
      }
    />
  )
}
