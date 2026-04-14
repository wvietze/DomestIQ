'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useUser } from '@/lib/hooks/use-user'
import { useFavoritesStore } from '@/lib/stores/favorites-store'
import { FavoriteButton } from '@/components/shared/favorite-button'

interface FavoriteItem {
  id: string
  worker_id: string
  profiles: { full_name: string; avatar_url: string | null }
  worker_profiles: {
    hourly_rate: number | null
    overall_rating: number
    total_reviews: number
    id_verified: boolean
    criminal_check_clear: boolean
    bio: string | null
  } | null
}

export default function FavoritesPage() {
  const { user, isLoading: userLoading } = useUser()
  const { setFavorites } = useFavoritesStore()
  const [favorites, setFavoritesData] = useState<FavoriteItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadFavorites() {
      if (!user) return
      try {
        const res = await fetch('/api/favorites')
        if (res.ok) {
          const data = await res.json()
          setFavoritesData(data.favorites || [])
          setFavorites((data.favorites || []).map((f: FavoriteItem) => f.worker_id))
        }
      } catch {
        // Ignore
      } finally {
        setIsLoading(false)
      }
    }
    if (!userLoading) loadFavorites()
  }, [user, userLoading, setFavorites])

  if (userLoading || isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-[#e8e8e6]" />
          <div className="h-1 w-12 animate-pulse rounded-full bg-[#e8e8e6]" />
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl p-3 shadow-sm flex flex-col items-center">
              <div className="w-20 h-20 rounded-xl animate-pulse bg-[#e8e8e6] mb-2" />
              <div className="h-4 w-20 animate-pulse rounded bg-[#e8e8e6] mb-1" />
              <div className="h-3 w-16 animate-pulse rounded bg-[#e8e8e6]" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span
            className="material-symbols-outlined text-[#005d42] text-[28px]"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            favorite
          </span>
          <h1 className="text-2xl font-heading font-bold tracking-tight text-[#1a1c1b]">
            Saved Professionals
          </h1>
        </div>
        <div className="h-1 w-12 bg-[#005d42] rounded-full" />
        <p className="mt-2 text-sm text-[#3e4943]">
          {favorites.length} professional{favorites.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {favorites.length === 0 ? (
        /* Empty state */
        <div className="text-center py-16 space-y-4">
          <div className="w-20 h-20 bg-[#f4f4f2] rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[#3e4943] text-[40px]">favorite</span>
          </div>
          <p className="text-lg font-heading font-semibold text-[#1a1c1b]">No saved professionals yet</p>
          <p className="text-[#3e4943] text-sm max-w-xs mx-auto">
            Tap the heart icon on any professional to save them for later
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#005d42] text-white rounded-xl text-sm font-medium hover:bg-[#047857] transition-colors duration-200"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            Browse Workers
          </Link>
        </div>
      ) : (
        /* Favorites grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map((fav) => {
            const wp = fav.worker_profiles
            const initials = fav.profiles.full_name
              .split(' ')
              .map(n => n[0])
              .join('')
              .slice(0, 2)

            return (
              <Link
                key={fav.id}
                href={`/workers/${fav.worker_id}`}
                className="bg-white rounded-xl p-3 relative shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow duration-200 group"
              >
                {/* Favorite heart toggle */}
                <div className="absolute top-2 right-2 z-10">
                  <FavoriteButton workerId={fav.worker_id} size="sm" />
                </div>

                {/* Avatar */}
                <div className="w-20 h-20 rounded-xl overflow-hidden mb-2 bg-[#f4f4f2]">
                  {fav.profiles.avatar_url ? (
                    <Image
                      src={fav.profiles.avatar_url}
                      alt={fav.profiles.full_name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#f4f4f2] text-[#005d42] font-semibold text-lg">
                      {initials}
                    </div>
                  )}
                </div>

                {/* Name */}
                <p className="font-heading font-bold text-[#1a1c1b] text-sm truncate max-w-full">
                  {fav.profiles.full_name}
                </p>

                {/* Verification badge */}
                {wp?.id_verified && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <span
                      className="material-symbols-outlined text-[#005d42] text-[14px]"
                      style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                    >
                      verified
                    </span>
                    <span className="text-[#3e4943] text-[10px] font-medium uppercase tracking-wider">Verified</span>
                  </div>
                )}

                {/* Rating */}
                {wp && (
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className="material-symbols-outlined text-[#904d00] text-[14px]"
                      style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                    >
                      star
                    </span>
                    <span className="text-[#1a1c1b] font-bold text-[12px]">{wp.overall_rating.toFixed(1)}</span>
                    <span className="text-[#3e4943] text-[11px]">({wp.total_reviews})</span>
                  </div>
                )}

                {/* Rate badge */}
                {wp?.hourly_rate && (
                  <span className="mt-1.5 inline-block text-[11px] font-medium text-[#005d42] bg-[#f4f4f2] px-2 py-0.5 rounded-full">
                    R{wp.hourly_rate}/hr
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}

      {/* Hint */}
      {favorites.length > 0 && (
        <div className="p-4 bg-[#f4f4f2] rounded-xl">
          <p className="text-xs text-[#3e4943] italic text-center">
            You have {favorites.length} favourited professional{favorites.length !== 1 ? 's' : ''}. Tap a card to view their profile and book their services.
          </p>
        </div>
      )}
    </div>
  )
}
