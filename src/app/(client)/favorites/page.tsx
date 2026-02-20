'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useUser } from '@/lib/hooks/use-user'
import { useFavoritesStore } from '@/lib/stores/favorites-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/ui/star-rating'
import { Skeleton } from '@/components/ui/skeleton'
import { FavoriteButton } from '@/components/shared/favorite-button'
import { Heart, Search, ShieldCheck } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }

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
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-40" />
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4 p-4 border rounded-xl">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}
      className="max-w-2xl mx-auto p-4 space-y-4">
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
          <Heart className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Saved Workers</h1>
          <p className="text-sm text-muted-foreground">{favorites.length} worker{favorites.length !== 1 ? 's' : ''} saved</p>
        </div>
      </motion.div>

      {favorites.length === 0 ? (
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }}
          className="text-center py-16 space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold">No saved workers yet</p>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Tap the heart icon on any worker to save them for later
          </p>
          <Button asChild className="bg-gradient-to-r from-emerald-600 to-teal-600">
            <Link href="/search">
              <Search className="w-4 h-4 mr-2" />
              Browse Workers
            </Link>
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {favorites.map((fav) => {
            const wp = fav.worker_profiles
            return (
              <motion.div key={fav.id} variants={fadeUp} transition={{ duration: 0.3 }}>
                <Link href={`/workers/${fav.worker_id}`}>
                  <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Avatar className="w-14 h-14 border-2 border-emerald-100">
                        <AvatarImage src={fav.profiles.avatar_url || undefined} />
                        <AvatarFallback className="bg-emerald-50 text-emerald-700 font-semibold">
                          {fav.profiles.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{fav.profiles.full_name}</p>
                          {wp?.id_verified && (
                            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        {wp && (
                          <>
                            <div className="flex items-center gap-2 mt-0.5">
                              <StarRating rating={wp.overall_rating} size="sm" />
                              <span className="text-xs text-muted-foreground">({wp.total_reviews})</span>
                            </div>
                            {wp.hourly_rate && (
                              <Badge variant="secondary" className="mt-1 text-emerald-700 bg-emerald-50 text-xs">
                                R{wp.hourly_rate}/hr
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                      <FavoriteButton workerId={fav.worker_id} size="sm" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
