'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchStore, type SortOption } from '@/lib/stores/search-store'
import { useTranslation } from '@/lib/hooks/use-translation'
import { useFavoritesStore } from '@/lib/stores/favorites-store'
import { SERVICE_TYPES } from '@/lib/utils/constants'
import { cn } from '@/lib/utils'
import { StarRating } from '@/components/ui/star-rating'
import { EstateSearchInput } from '@/components/estate/estate-search-input'
import { EstateTag } from '@/components/estate/estate-tag'
import type { Estate } from '@/lib/types/estate'
import { AddressAutocomplete, type AddressResult } from '@/components/address/address-autocomplete'
import Link from 'next/link'
import Image from 'next/image'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface WorkerResult {
  worker_id: string
  user_id: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  hourly_rate: number | null
  overall_rating: number
  total_reviews: number
  id_verified: boolean
  criminal_check_clear: boolean
  distance_km: number | null
  location_name: string | null
  services: Array<{ id: string; name: string; icon: string }>
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
  { value: 'relevance', label: 'Best Match', icon: 'auto_awesome' },
  { value: 'rating', label: 'Highest Rated', icon: 'star' },
  { value: 'price_low', label: 'Price: Low', icon: 'arrow_downward' },
  { value: 'price_high', label: 'Price: High', icon: 'arrow_upward' },
  { value: 'reviews', label: 'Most Reviews', icon: 'reviews' },
]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SearchPage() {
  const supabase = createClient()
  const { filters, setFilter, setFilters, resetFilters, isSearching, setSearching } = useSearchStore()
  const { t } = useTranslation()
  const { setFavorites, loaded: favoritesLoaded } = useFavoritesStore()
  const [workers, setWorkers] = useState<WorkerResult[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedEstate, setSelectedEstate] = useState<Estate | null>(null)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [homeLocation, setHomeLocation] = useState<{ lat: number; lng: number; label: string } | null>(null)

  /* Active filter count for badge */
  const activeFilterCount = [
    filters.minRating > 0,
    filters.availableDay !== null,
    filters.maxDistance !== 50,
    filters.locationLat !== null,
    filters.minPrice !== null,
    filters.maxPrice !== null,
    filters.verifiedOnly,
    filters.estateId !== null,
  ].filter(Boolean).length

  /* ---- Load favorites on mount ---------------------------------- */
  useEffect(() => {
    if (favoritesLoaded) return
    async function loadFavs() {
      try {
        const res = await fetch('/api/favorites')
        if (res.ok) {
          const data = await res.json()
          setFavorites((data.favorites || []).map((f: { worker_id: string }) => f.worker_id))
        }
      } catch { /* ignore */ }
    }
    loadFavs()
  }, [favoritesLoaded, setFavorites])

  /* ---- Load client's saved home address on mount --------------- */
  useEffect(() => {
    let cancelled = false
    async function loadHome() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return

      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('address, suburb, city, location_lat, location_lng')
        .eq('user_id', user.id)
        .single<{
          address: string | null
          suburb: string | null
          city: string | null
          location_lat: number | null
          location_lng: number | null
        }>()

      if (cancelled || !clientProfile?.location_lat || !clientProfile?.location_lng) return

      const label =
        [clientProfile.suburb, clientProfile.city].filter(Boolean).join(', ') ||
        clientProfile.address ||
        'Home'

      setHomeLocation({
        lat: clientProfile.location_lat,
        lng: clientProfile.location_lng,
        label,
      })

      // Only seed the search filter if the user hasn't already set a location
      // this session (e.g. via GPS or estate pick).
      if (filters.locationLat === null) {
        setFilters({
          locationLat: clientProfile.location_lat,
          locationLng: clientProfile.location_lng,
          locationLabel: label,
        })
      }
    }
    loadHome()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---- Search workers ------------------------------------------- */
  const searchWorkers = useCallback(async (reset = false) => {
    setSearching(true)
    const currentPage = reset ? 0 : page
    if (reset) setPage(0)

    try {
      const { data, error } = await supabase.rpc('search_workers', {
        p_lat: filters.locationLat,
        p_lng: filters.locationLng,
        p_radius_km: filters.maxDistance,
        p_service_id: filters.serviceId,
        p_min_rating: filters.minRating,
        p_available_day: filters.availableDay,
        p_limit: 20,
        p_offset: currentPage * 20,
      })

      if (error) throw error
      const results = (data || []) as WorkerResult[]
      if (reset) { setWorkers(results) } else { setWorkers(prev => [...prev, ...results]) }
      setHasMore(results.length === 20)
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setSearching(false)
    }
  }, [supabase, filters, page, setSearching])

  /* ---- Client-side filter + sort -------------------------------- */
  const filteredWorkers = workers.filter(w => {
    if (filters.verifiedOnly && !w.id_verified) return false
    if (filters.minPrice !== null && (w.hourly_rate === null || w.hourly_rate < filters.minPrice)) return false
    if (filters.maxPrice !== null && (w.hourly_rate === null || w.hourly_rate > filters.maxPrice)) return false
    return true
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'rating': return b.overall_rating - a.overall_rating
      case 'price_low': return (a.hourly_rate ?? 999) - (b.hourly_rate ?? 999)
      case 'price_high': return (b.hourly_rate ?? 0) - (a.hourly_rate ?? 0)
      case 'reviews': return b.total_reviews - a.total_reviews
      default: return 0
    }
  })

  /* ---- Re-search on filter change ------------------------------- */
  useEffect(() => {
    searchWorkers(true)
  }, [filters.serviceId, filters.minRating, filters.availableDay, filters.maxDistance, filters.locationLat, filters.locationLng, filters.estateId]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */

  return (
    <div className="min-h-screen bg-[#f9f9f7]">

      {/* ── Top App Bar ─────────────────────────────────────────── */}
      <header className="bg-[#f9f9f7] sticky top-0 z-40 w-full">
        <div className="flex flex-col px-6 pt-4 pb-2 w-full max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#005d42]">search</span>
              <h1 className="font-heading font-bold tracking-tight text-2xl text-[#1a1c1b]">
                {t('search.title', 'Find Help')}
              </h1>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#e2e3e1] transition-colors duration-200"
            >
              <span className="material-symbols-outlined text-[#3e4943]">tune</span>
              {activeFilterCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#005d42] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Location context */}
          <button
            onClick={() => setShowLocationPicker(true)}
            className="flex items-center gap-1.5 mb-2 group min-w-0 text-left"
          >
            <span className="material-symbols-outlined text-[#904d00] text-sm shrink-0">location_on</span>
            <span className="font-semibold text-sm tracking-tight text-[#1a1c1b] truncate group-hover:text-[#005d42] transition-colors">
              {filters.locationLabel ?? (filters.locationLat ? 'Location set' : 'Set your location')}
            </span>
            <span className="material-symbols-outlined text-[#6e7a73] text-xs shrink-0">keyboard_arrow_down</span>
          </button>

          {/* Search input */}
          <div className="relative mb-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7a73] text-xl">search</span>
            <input
              type="text"
              placeholder={t('search.placeholder', 'Search workers...')}
              value={filters.query}
              onChange={e => setFilter('query', e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-[#f4f4f2] border-none rounded-xl text-[#1a1c1b] text-base placeholder:text-[#6e7a73] focus:outline-none focus:ring-2 focus:ring-[#005d42]/30 transition-shadow duration-200"
            />
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="max-w-xl mx-auto px-6 pb-24">

        {/* ── Service Filter Chips ──────────────────────────────── */}
        <section className="mt-2 mb-4 overflow-x-auto flex gap-2.5 whitespace-nowrap -mx-6 px-6 hide-scrollbar">
          <button
            onClick={() => setFilter('serviceId', null)}
            className={cn(
              'px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-colors duration-200 shrink-0',
              filters.serviceId === null
                ? 'bg-[#005d42] text-white'
                : 'bg-white text-[#3e4943] hover:bg-[#e8e8e6]'
            )}
          >
            All Services
          </button>
          {SERVICE_TYPES.map(svc => (
            <button
              key={svc.id}
              onClick={() => setFilter('serviceId', filters.serviceId === svc.id ? null : svc.id)}
              className={cn(
                'px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 shrink-0',
                filters.serviceId === svc.id
                  ? 'bg-[#005d42] text-white'
                  : 'bg-white text-[#3e4943] hover:bg-[#e8e8e6]'
              )}
            >
              {svc.name}
            </button>
          ))}
        </section>

        {/* ── Sort Row ──────────────────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 hide-scrollbar">
          <span className="material-symbols-outlined text-[#6e7a73] text-lg shrink-0">sort</span>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter('sortBy', opt.value)}
              className={cn(
                'text-xs font-medium px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors duration-200 shrink-0',
                filters.sortBy === opt.value
                  ? 'bg-[#005d42]/10 text-[#005d42] font-semibold'
                  : 'bg-[#f4f4f2] text-[#3e4943] hover:bg-[#e8e8e6]'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* ── Expandable Filters Panel ─────────────────────────── */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out',
            showFilters ? 'max-h-[800px] opacity-100 mb-6' : 'max-h-0 opacity-0'
          )}
        >
          <div className="bg-white rounded-xl p-5 space-y-5 shadow-sm border border-[#e8e8e6]">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-[#1a1c1b]">Filters</h3>
              <button
                onClick={() => { resetFilters(); setShowFilters(false) }}
                className="flex items-center gap-1 text-sm text-[#3e4943] hover:text-[#005d42] transition-colors"
              >
                <span className="material-symbols-outlined text-base">close</span>
                Clear All
              </button>
            </div>

            {/* Verified Only */}
            <button
              onClick={() => setFilter('verifiedOnly', !filters.verifiedOnly)}
              className={cn(
                'flex items-center gap-3 w-full p-3.5 rounded-xl border-2 transition-all duration-200',
                filters.verifiedOnly
                  ? 'border-[#005d42] bg-[#005d42]/5'
                  : 'border-[#bdc9c1] hover:border-[#005d42]/40'
              )}
            >
              <span
                className={cn(
                  'material-symbols-outlined text-xl',
                  filters.verifiedOnly ? 'text-[#005d42]' : 'text-[#6e7a73]'
                )}
                style={filters.verifiedOnly ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                verified_user
              </span>
              <span className={cn(
                'text-sm font-medium',
                filters.verifiedOnly ? 'text-[#005d42]' : 'text-[#3e4943]'
              )}>
                Verified workers only
              </span>
            </button>

            {/* Price Range */}
            <div>
              <label className="text-sm font-semibold text-[#1a1c1b]">Price Range (R/hr)</label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice ?? ''}
                  onChange={e => setFilter('minPrice', e.target.value ? Number(e.target.value) : null)}
                  min={0}
                  className="flex-1 h-10 px-3 bg-[#f4f4f2] border-none rounded-lg text-sm text-[#1a1c1b] placeholder:text-[#6e7a73] focus:outline-none focus:ring-2 focus:ring-[#005d42]/30"
                />
                <span className="text-[#6e7a73] text-sm">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice ?? ''}
                  onChange={e => setFilter('maxPrice', e.target.value ? Number(e.target.value) : null)}
                  min={0}
                  className="flex-1 h-10 px-3 bg-[#f4f4f2] border-none rounded-lg text-sm text-[#1a1c1b] placeholder:text-[#6e7a73] focus:outline-none focus:ring-2 focus:ring-[#005d42]/30"
                />
              </div>
            </div>

            {/* Min Rating */}
            <div>
              <label className="text-sm font-semibold text-[#1a1c1b]">Minimum Rating</label>
              <div className="mt-2">
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
              <label className="text-sm font-semibold text-[#1a1c1b]">Available On</label>
              <div className="flex gap-1.5 mt-2">
                {DAYS.map((day, idx) => (
                  <button
                    key={day}
                    onClick={() => setFilter('availableDay', filters.availableDay === idx ? null : idx)}
                    className={cn(
                      'w-10 h-10 rounded-lg text-xs font-medium transition-colors duration-200',
                      filters.availableDay === idx
                        ? 'bg-[#005d42] text-white'
                        : 'bg-[#f4f4f2] text-[#3e4943] hover:bg-[#e8e8e6]'
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance */}
            <div>
              <label className="text-sm font-semibold text-[#1a1c1b]">Max Distance: {filters.maxDistance} km</label>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={filters.maxDistance}
                onChange={e => setFilter('maxDistance', Number(e.target.value))}
                className="w-full mt-2"
                style={{ accentColor: '#005d42' }}
              />
              <div className="flex justify-between text-xs text-[#6e7a73]">
                <span>5 km</span>
                <span>100 km</span>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="text-sm font-semibold text-[#1a1c1b]">Search Location</label>
              <button
                type="button"
                onClick={() => setShowLocationPicker(true)}
                className="mt-2 w-full h-10 flex items-center gap-2 px-3 rounded-lg border border-[#bdc9c1] text-sm font-medium text-[#3e4943] hover:border-[#005d42] hover:text-[#005d42] transition-colors duration-200"
              >
                <span className="material-symbols-outlined text-base shrink-0">edit_location</span>
                <span className="truncate flex-1 text-left">
                  {filters.locationLabel ?? (filters.locationLat ? 'Location set' : 'Set location')}
                </span>
                <span className="material-symbols-outlined text-sm shrink-0">chevron_right</span>
              </button>
            </div>

            {/* Estate Filter */}
            <div>
              <label className="text-sm font-semibold text-[#1a1c1b]">Estate / Complex</label>
              {selectedEstate ? (
                <div className="mt-2">
                  <EstateTag
                    name={selectedEstate.name}
                    suburb={selectedEstate.suburb}
                    onRemove={() => {
                      setSelectedEstate(null)
                      setFilter('estateId', null)
                      setFilter('maxDistance', 50)
                    }}
                  />
                </div>
              ) : (
                <div className="mt-2">
                  <EstateSearchInput
                    placeholder="Filter by estate..."
                    onSelect={(estate: Estate) => {
                      setSelectedEstate(estate)
                      setFilter('estateId', estate.id)
                      if (estate.location_lat && estate.location_lng) {
                        setFilters({
                          locationLat: estate.location_lat,
                          locationLng: estate.location_lng,
                          locationLabel: estate.name,
                          maxDistance: 10,
                        })
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Results ───────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Loading skeletons */}
          {isSearching && workers.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="relative bg-white rounded-xl overflow-hidden animate-pulse">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#bdc9c1]" />
                <div className="p-4 flex gap-5">
                  <div className="w-24 h-32 rounded-lg bg-[#e8e8e6]" />
                  <div className="flex-grow space-y-3 py-1">
                    <div className="h-5 w-32 rounded bg-[#e8e8e6]" />
                    <div className="h-3 w-20 rounded bg-[#e8e8e6]" />
                    <div className="h-3 w-16 rounded bg-[#e8e8e6]" />
                    <div className="flex justify-between mt-4">
                      <div className="h-3 w-24 rounded bg-[#e8e8e6]" />
                      <div className="h-6 w-14 rounded bg-[#e8e8e6]" />
                    </div>
                  </div>
                </div>
              </div>
            ))

          /* Empty state */
          ) : filteredWorkers.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-16 h-16 bg-[#e8e8e6] rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl text-[#6e7a73]">search_off</span>
              </div>
              <p className="text-lg font-heading font-bold text-[#1a1c1b]">
                {t('search.no_results', 'No workers found')}
              </p>
              <p className="text-sm text-[#3e4943] max-w-xs mx-auto">
                {t('search.try_different', 'Try adjusting your filters or search terms')}
              </p>
            </div>

          /* Results list */
          ) : (
            <>
              {/* Result count */}
              <p className="text-sm text-[#3e4943]">
                {filteredWorkers.length}{hasMore ? '+' : ''} workers found
                {filters.sortBy !== 'relevance' && (
                  <span className="ml-1 text-[#6e7a73]">
                    · sorted by {filters.sortBy.replace('_', ' ')}
                  </span>
                )}
              </p>

              {/* Worker cards */}
              {filteredWorkers.map(worker => (
                <StitchWorkerCard key={worker.worker_id} worker={worker} />
              ))}

              {/* Load more */}
              {hasMore && (
                <button
                  onClick={() => { setPage(p => p + 1); searchWorkers(false) }}
                  disabled={isSearching}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border border-[#bdc9c1] text-sm font-semibold text-[#3e4943] hover:border-[#005d42] hover:text-[#005d42] disabled:opacity-50 transition-colors duration-200"
                >
                  {isSearching ? (
                    <>
                      <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                      Loading...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">expand_more</span>
                      Load More Workers
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── Location picker sheet ──────────────────────────────── */}
      {showLocationPicker && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
          onClick={() => setShowLocationPicker(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#1a1c1b]">Search location</h3>
                <p className="text-sm text-[#3e4943] mt-0.5">
                  Looking for someone else? Enter a different address.
                </p>
              </div>
              <button
                onClick={() => setShowLocationPicker(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f4f4f2]"
              >
                <span className="material-symbols-outlined text-[#3e4943]">close</span>
              </button>
            </div>

            {homeLocation && (
              <button
                onClick={() => {
                  setFilters({
                    locationLat: homeLocation.lat,
                    locationLng: homeLocation.lng,
                    locationLabel: homeLocation.label,
                  })
                  setShowLocationPicker(false)
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#bdc9c1] hover:border-[#005d42] hover:bg-[#f4f4f2] text-left transition-colors"
              >
                <span className="material-symbols-outlined text-[#005d42]">home</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#1a1c1b]">My home</p>
                  <p className="text-xs text-[#3e4943] truncate">{homeLocation.label}</p>
                </div>
                <span className="material-symbols-outlined text-[#6e7a73]">chevron_right</span>
              </button>
            )}

            <button
              onClick={() => {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setFilters({
                      locationLat: pos.coords.latitude,
                      locationLng: pos.coords.longitude,
                      locationLabel: 'Current location',
                    })
                    setShowLocationPicker(false)
                  },
                  () => {},
                  { enableHighAccuracy: true }
                )
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#bdc9c1] hover:border-[#005d42] hover:bg-[#f4f4f2] text-left transition-colors"
            >
              <span className="material-symbols-outlined text-[#005d42]">my_location</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#1a1c1b]">Use my current location</p>
                <p className="text-xs text-[#3e4943]">GPS-based</p>
              </div>
              <span className="material-symbols-outlined text-[#6e7a73]">chevron_right</span>
            </button>

            <div>
              <label className="text-sm font-semibold text-[#1a1c1b] block mb-2">Or search a different address</label>
              <AddressAutocomplete
                placeholder="Start typing an address…"
                onSelect={(result: AddressResult) => {
                  const label =
                    [result.suburb, result.city].filter(Boolean).join(', ') || result.formattedAddress
                  setFilters({
                    locationLat: result.lat,
                    locationLng: result.lng,
                    locationLabel: label,
                  })
                  setShowLocationPicker(false)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ================================================================== */
/*  Stitch Worker Card (inline — matches reference HTML)              */
/* ================================================================== */

function StitchWorkerCard({ worker }: { worker: WorkerResult }) {
  const primaryService = worker.services[0]?.name ?? 'Worker'

  /* Verification badge icon */
  const verificationIcon = worker.criminal_check_clear
    ? 'security'
    : worker.id_verified
      ? 'verified'
      : null

  /* Verification label */
  const verificationLabel = worker.id_verified
    ? 'ID Verified'
    : worker.criminal_check_clear
      ? 'Background Checked'
      : null

  /* Initials fallback */
  const initials = worker.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Link
      href={`/workers/${worker.user_id}`}
      className="block relative bg-white rounded-xl overflow-hidden group hover:shadow-md transition-shadow duration-200"
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#005d42]" />

      {/* Favorite — top-right corner so it never steals space from the name */}
      <span className="absolute top-3 right-3 material-symbols-outlined text-xl text-[#bdc9c1] group-hover:text-[#ba1a1a] transition-colors duration-200">
        favorite
      </span>

      <div className="p-4 pl-5 flex gap-4">
        {/* Avatar / Photo */}
        <div className="relative flex-shrink-0">
          {worker.avatar_url ? (
            <Image
              src={worker.avatar_url}
              alt={worker.full_name}
              width={80}
              height={104}
              className="w-20 h-26 object-cover rounded-lg"
              style={{ height: '6.5rem' }}
            />
          ) : (
            <div className="w-20 rounded-lg bg-[#e8e8e6] flex items-center justify-center" style={{ height: '6.5rem' }}>
              <span className="text-xl font-heading font-bold text-[#3e4943]">{initials}</span>
            </div>
          )}
          {verificationIcon && (
            <div className="absolute -top-1.5 -right-1.5 bg-[#005d42] text-white p-1 rounded-full shadow-sm">
              <span
                className="material-symbols-outlined text-[14px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {verificationIcon}
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-grow flex flex-col justify-between min-w-0 pr-6">
          <div className="min-w-0">
            {/* Name — allowed to wrap to 2 lines */}
            <h3 className="text-base font-bold text-[#1a1c1b] leading-snug line-clamp-2 group-hover:text-[#005d42] transition-colors duration-200">
              {worker.full_name}
            </h3>
            <span className="text-[11px] font-bold tracking-widest text-[#3e4943] uppercase mt-0.5 block">
              {primaryService}
            </span>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-1.5">
              <span
                className="material-symbols-outlined text-[#904d00] text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span className="font-heading font-bold text-sm text-[#1a1c1b]">
                {worker.overall_rating > 0 ? worker.overall_rating.toFixed(1) : 'New'}
              </span>
              {worker.total_reviews > 0 && (
                <span className="text-xs text-[#3e4943]">({worker.total_reviews})</span>
              )}
            </div>

            {verificationLabel && (
              <p className="text-[11px] text-[#005d42] font-bold mt-1">{verificationLabel}</p>
            )}
          </div>

          {/* Bottom row: location + price */}
          <div className="flex items-end justify-between gap-2 mt-2.5">
            {(worker.location_name || worker.distance_km !== null) && (
              <div className="flex items-center gap-1 text-[#3e4943] min-w-0">
                <span className="material-symbols-outlined text-xs shrink-0">near_me</span>
                <span className="text-xs font-medium truncate">
                  {worker.distance_km !== null && `${worker.distance_km.toFixed(1)}km`}
                  {worker.distance_km !== null && worker.location_name && ' · '}
                  {worker.location_name}
                </span>
              </div>
            )}
            {worker.hourly_rate !== null && (
              <div className="text-right shrink-0 leading-none">
                <span className="text-lg font-heading font-extrabold text-[#1a1c1b]">
                  R{worker.hourly_rate}
                </span>
                <span className="text-[11px] text-[#3e4943] font-medium">/hr</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
