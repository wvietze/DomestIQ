'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/ui/star-rating'
import { Search, SlidersHorizontal, X, MapPin } from 'lucide-react'
import { useSearchStore } from '@/lib/stores/search-store'
import { SERVICE_TYPES } from '@/lib/utils/constants'
import { cn } from '@/lib/utils'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function SearchFilters() {
  const { filters, setFilter, resetFilters } = useSearchStore()
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search workers..."
          value={filters.query}
          onChange={e => setFilter('query', e.target.value)}
          className="pl-10 h-12 text-base"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Service Type Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        <Badge
          variant={filters.serviceId === null ? 'default' : 'outline'}
          className="cursor-pointer whitespace-nowrap shrink-0 px-3 py-1.5"
          onClick={() => setFilter('serviceId', null)}
        >
          All Services
        </Badge>
        {SERVICE_TYPES.map(svc => (
          <Badge
            key={svc.id}
            variant={filters.serviceId === svc.id ? 'default' : 'outline'}
            className="cursor-pointer whitespace-nowrap shrink-0 px-3 py-1.5"
            onClick={() => setFilter('serviceId', filters.serviceId === svc.id ? null : svc.id)}
          >
            {svc.name}
          </Badge>
        ))}
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="bg-card border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            <Button variant="ghost" size="sm" onClick={() => { resetFilters(); setShowFilters(false) }}>
              <X className="w-4 h-4 mr-1" /> Clear
            </Button>
          </div>

          {/* Min Rating */}
          <div>
            <Label>Minimum Rating</Label>
            <div className="mt-1">
              <StarRating
                rating={filters.minRating}
                interactive
                onChange={r => setFilter('minRating', r)}
                size="lg"
              />
            </div>
          </div>

          {/* Available Day */}
          <div>
            <Label>Available On</Label>
            <div className="flex gap-1.5 mt-1">
              {DAYS.map((day, idx) => (
                <button
                  key={day}
                  onClick={() => setFilter('availableDay', filters.availableDay === idx ? null : idx)}
                  className={cn(
                    "w-10 h-10 rounded-lg text-xs font-medium transition-colors",
                    filters.availableDay === idx
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Distance */}
          <div>
            <Label>Max Distance: {filters.maxDistance} km</Label>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={filters.maxDistance}
              onChange={e => setFilter('maxDistance', Number(e.target.value))}
              className="w-full mt-1"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 km</span>
              <span>100 km</span>
            </div>
          </div>

          {/* Location */}
          <div>
            <Label>Your Location</Label>
            <Button
              variant="outline"
              size="sm"
              className="mt-1 w-full"
              onClick={() => {
                navigator.geolocation.getCurrentPosition(
                  pos => {
                    setFilter('locationLat', pos.coords.latitude)
                    setFilter('locationLng', pos.coords.longitude)
                  },
                  () => {},
                  { enableHighAccuracy: true }
                )
              }}
            >
              <MapPin className="w-4 h-4 mr-2" />
              {filters.locationLat ? 'Location Set' : 'Detect Location'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
