'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useSearchStore } from '@/lib/stores/search-store'
import { SearchFilters } from '@/components/search/search-filters'
import { WorkerCard } from '@/components/worker/worker-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { SearchX, Search, Loader2 } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }

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
      if (reset) { setWorkers(results) } else { setWorkers(prev => [...prev, ...results]) }
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
    <motion.div initial="hidden" animate="visible" variants={stagger}
      className="max-w-2xl mx-auto p-4 space-y-4">
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Search className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Find Workers</h1>
          <p className="text-sm text-muted-foreground">Trusted workers in your area</p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <SearchFilters />
      </motion.div>

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
          <motion.div variants={fadeUp} transition={{ duration: 0.4 }}
            className="text-center py-16 space-y-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <SearchX className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold">No workers found</p>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">Try different filters or expand your search area to find more workers</p>
          </motion.div>
        ) : (
          <>
            <motion.p variants={fadeUp} className="text-sm text-muted-foreground">
              {workers.length}{hasMore ? '+' : ''} workers found
            </motion.p>
            {workers.map((worker, i) => (
              <motion.div key={worker.worker_id} variants={fadeUp}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}>
                <WorkerCard worker={worker} />
              </motion.div>
            ))}
            {hasMore && (
              <motion.div variants={fadeUp}>
                <Button variant="outline" className="w-full h-12"
                  onClick={() => { setPage(p => p + 1); searchWorkers(false) }}
                  disabled={isSearching}>
                  {isSearching ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading...</> : 'Load More Workers'}
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}
