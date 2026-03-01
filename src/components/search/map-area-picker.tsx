'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { MapPin, Minus, Plus } from 'lucide-react'
import { WaveBars } from '@/components/loading'
import { cn } from '@/lib/utils'

interface MapAreaPickerProps {
  center: { lat: number; lng: number } | null
  radius: number
  onCenterChange: (center: { lat: number; lng: number }) => void
  onRadiusChange: (radius: number) => void
  className?: string
}

export function MapAreaPicker({ center, radius, onCenterChange, onRadiusChange, className }: MapAreaPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [detecting, setDetecting] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)

  const detectLocation = useCallback(() => {
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => { onCenterChange({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setDetecting(false) },
      () => setDetecting(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [onCenterChange])

  useEffect(() => {
    if (!center || !mapRef.current || mapLoaded) return
    const currentCenter = center
    async function initMap() {
      try {
        const { loadGoogleMaps, createMap, addCircleOverlay } = await import('@/lib/maps/google-maps')
        await loadGoogleMaps()
        if (!mapRef.current) return
        const map = createMap(mapRef.current, { center: currentCenter, zoom: 12 })
        if (!map) return
        const circle = addCircleOverlay(map, currentCenter, radius)
        circle.addListener('center_changed', () => { const c = circle.getCenter(); if (c) onCenterChange({ lat: c.lat(), lng: c.lng() }) })
        circle.addListener('radius_changed', () => { onRadiusChange(Math.round(circle.getRadius() / 1000)) })
        setMapLoaded(true)
      } catch { /* Maps not available */ }
    }
    initMap()
  }, [center, radius, mapLoaded, onCenterChange, onRadiusChange])

  return (
    <div className={cn('space-y-3', className)}>
      <Label>Search Area</Label>
      {!center ? (
        <Button type="button" variant="outline" className="w-full h-14" onClick={detectLocation} disabled={detecting}>
          {detecting ? <WaveBars size="sm" /> : <MapPin className="w-5 h-5 mr-2" />}
          {detecting ? 'Detecting...' : 'Set My Location'}
        </Button>
      ) : (
        <>
          <div ref={mapRef} className="w-full h-48 rounded-xl bg-gray-100 border overflow-hidden" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Radius: {radius} km</span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="icon" className="w-8 h-8" onClick={() => onRadiusChange(Math.max(1, radius - 5))}><Minus className="w-4 h-4" /></Button>
              <Button type="button" variant="outline" size="icon" className="w-8 h-8" onClick={() => onRadiusChange(Math.min(100, radius + 5))}><Plus className="w-4 h-4" /></Button>
            </div>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={detectLocation} disabled={detecting}><MapPin className="w-4 h-4 mr-1" />Re-detect location</Button>
        </>
      )}
    </div>
  )
}
