'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchStore } from '@/lib/stores/search-store'
import { SearchFilters } from '@/components/search/search-filters'
import { WorkerCard } from '@/components/worker/worker-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { SearchX } from 'lucide-react'

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
  services: Array<{ id: string; name: string; icon: string }>
}

export default function SearchPage() {
  const supabase = createClient()
  const { filters, isSearching, setSearching } = useSearchStore()
  const [workers, setWorkers] = useState<WorkerResult[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

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
      if (reset) {
        setWorkers(results)
      } else {
        setWorkers(prev => [...prev, ...results])
      }
      setHasMore(results.length === 20)
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setSearching(false)
    }
  }, [supabase, filters, page, setSearching])

  useEffect(() => {
    searchWorkers(true)
  }, [filters.serviceId, filters.minRating, filters.availableDay, filters.maxDistance, filters.locationLat, filters.locationLng]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Find Workers</h1>

      <SearchFilters />

      <div className="space-y-3">
        {isSearching && workers.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border rounded-xl">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))
        ) : workers.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <SearchX className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-lg font-medium">No workers found</p>
            <p className="text-muted-foreground">Try different filters or expand your search area</p>
          </div>
        ) : (
          <>
            {workers.map(worker => (
              <WorkerCard key={worker.worker_id} worker={worker} />
            ))}
            {hasMore && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setPage(p => p + 1)
                  searchWorkers(false)
                }}
                disabled={isSearching}
              >
                {isSearching ? 'Loading...' : 'Load More'}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
