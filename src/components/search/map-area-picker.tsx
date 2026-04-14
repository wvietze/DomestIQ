'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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
      <Label className="text-[#1a1c1b]">Search Area</Label>
      {!center ? (
        <Button type="button" variant="outline" className="w-full h-14 border-[#bdc9c1] text-[#1a1c1b] hover:bg-[#f4f4f2]" onClick={detectLocation} disabled={detecting}>
          {detecting ? <WaveBars size="sm" /> : <span className="material-symbols-outlined text-xl mr-2">location_on</span>}
          {detecting ? 'Detecting...' : 'Set My Location'}
        </Button>
      ) : (
        <>
          <div ref={mapRef} className="w-full h-48 rounded-xl bg-[#f4f4f2] border border-[#bdc9c1] overflow-hidden" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#3e4943]">Radius: {radius} km</span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="icon" className="w-8 h-8 border-[#bdc9c1]" onClick={() => onRadiusChange(Math.max(1, radius - 5))}><span className="material-symbols-outlined text-base">remove</span></Button>
              <Button type="button" variant="outline" size="icon" className="w-8 h-8 border-[#bdc9c1]" onClick={() => onRadiusChange(Math.min(100, radius + 5))}><span className="material-symbols-outlined text-base">add</span></Button>
            </div>
          </div>
          <Button type="button" variant="ghost" size="sm" className="text-[#005d42]" onClick={detectLocation} disabled={detecting}><span className="material-symbols-outlined text-base mr-1">location_on</span>Re-detect location</Button>
        </>
      )}
    </div>
  )
}
