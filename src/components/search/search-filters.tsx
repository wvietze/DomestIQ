'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/ui/star-rating'
import { Search, SlidersHorizontal, X, MapPin, ShieldCheck, ArrowUpDown } from 'lucide-react'
import { useSearchStore, type SortOption } from '@/lib/stores/search-store'
import { SERVICE_TYPES } from '@/lib/utils/constants'
import { cn } from '@/lib/utils'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Best Match' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_low', label: 'Price: Low' },
  { value: 'price_high', label: 'Price: High' },
  { value: 'reviews', label: 'Most Reviews' },
]

export function SearchFilters() {
  const { filters, setFilter, resetFilters } = useSearchStore()
  const [showFilters, setShowFilters] = useState(false)

  const activeFilterCount = [
    filters.minRating > 0,
    filters.availableDay !== null,
    filters.maxDistance !== 50,
    filters.locationLat !== null,
    filters.minPrice !== null,
    filters.maxPrice !== null,
    filters.verifiedOnly,
  ].filter(Boolean).length

  return (
    <div className="space-y-3">
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
          <div className="relative">
            <SlidersHorizontal className="w-5 h-5" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </div>
        </Button>
      </div>

      {/* Service Type Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
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

      {/* Sort Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <ArrowUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter('sortBy', opt.value)}
            className={cn(
              "text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors shrink-0",
              filters.sortBy === opt.value
                ? "bg-emerald-100 text-emerald-800"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="bg-card border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            <Button variant="ghost" size="sm" onClick={() => { resetFilters(); setShowFilters(false) }}>
              <X className="w-4 h-4 mr-1" /> Clear All
            </Button>
          </div>

          {/* Verified Only */}
          <div>
            <button
              onClick={() => setFilter('verifiedOnly', !filters.verifiedOnly)}
              className={cn(
                "flex items-center gap-2 w-full p-3 rounded-lg border-2 transition-all",
                filters.verifiedOnly
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-border hover:border-emerald-300"
              )}
            >
              <ShieldCheck className={cn("w-5 h-5", filters.verifiedOnly ? "text-emerald-600" : "text-muted-foreground")} />
              <span className={cn("text-sm font-medium", filters.verifiedOnly ? "text-emerald-800" : "text-muted-foreground")}>
                Verified workers only
              </span>
            </button>
          </div>

          {/* Price Range */}
          <div>
            <Label>Price Range (R/hr)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice ?? ''}
                onChange={e => setFilter('minPrice', e.target.value ? Number(e.target.value) : null)}
                className="h-10"
                min={0}
              />
              <span className="text-muted-foreground text-sm">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice ?? ''}
                onChange={e => setFilter('maxPrice', e.target.value ? Number(e.target.value) : null)}
                className="h-10"
                min={0}
              />
            </div>
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
              className="w-full mt-1 accent-emerald-600"
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
