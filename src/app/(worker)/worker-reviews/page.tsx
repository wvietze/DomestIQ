'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { StarRating } from '@/components/ui/star-rating'
import { Star, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { TRAIT_LABELS, TRAIT_EMOJIS } from '@/lib/types/review'
import { Badge } from '@/components/ui/badge'

interface ReviewItem {
  id: string
  rating: number
  punctuality_rating: number | null
  quality_rating: number | null
  professionalism_rating: number | null
  traits: string[]
  comment: string | null
  created_at: string
  profiles: { full_name: string; avatar_url: string | null }
}

interface RatingStats {
  overall: number
  totalReviews: number
  topTraits: Record<string, number>
}

export default function WorkerReviewsPage() {
  const { user, isLoading: userLoading } = useUser()
  const supabase = createClient()

  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [stats, setStats] = useState<RatingStats>({
    overall: 0,
    totalReviews: 0,
    topTraits: {},
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadReviews() {
      if (!user) return

      // Get reviews where this worker is the reviewee
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('id, rating, punctuality_rating, quality_rating, professionalism_rating, traits, comment, created_at, profiles!reviewer_id(full_name, avatar_url)')
        .eq('reviewee_id', user.id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (reviewData && reviewData.length > 0) {
        const typedReviews = reviewData as unknown as ReviewItem[]
        setReviews(typedReviews)

        // Calculate stats
        const totalReviews = typedReviews.length
        const avgOverall = typedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews

        // Aggregate trait counts across all reviews
        const traitCounts: Record<string, number> = {}
        typedReviews.forEach(r => {
          if (r.traits && Array.isArray(r.traits)) {
            r.traits.forEach(trait => {
              traitCounts[trait] = (traitCounts[trait] || 0) + 1
            })
          }
        })

        setStats({
          overall: avgOverall,
          totalReviews,
          topTraits: traitCounts,
        })
      }

      setIsLoading(false)
    }

    if (!userLoading) loadReviews()
  }, [user, userLoading, supabase])

  if (userLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
          <Star className="w-5 h-5 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold">My Reviews</h1>
      </motion.div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h2 className="font-semibold text-lg mb-1">No Reviews Yet</h2>
            <p className="text-muted-foreground text-sm">
              Complete bookings to start receiving reviews from clients.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overall Rating Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-5xl font-bold">{stats.overall.toFixed(1)}</p>
                <StarRating rating={stats.overall} size="lg" className="justify-center mt-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Traits */}
          {Object.keys(stats.topTraits).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Top Traits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(stats.topTraits)
                      .sort((a, b) => b[1] - a[1])
                      .map(([trait, count]) => (
                        <Badge
                          key={trait}
                          variant="secondary"
                          className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 px-3 py-1.5 text-sm font-medium"
                        >
                          {TRAIT_EMOJIS[trait as keyof typeof TRAIT_EMOJIS]}{' '}
                          {TRAIT_LABELS[trait as keyof typeof TRAIT_LABELS] || trait}
                          <span className="ml-1.5 bg-emerald-200 text-emerald-800 rounded-full px-1.5 py-0.5 text-xs font-semibold">
                            {count}
                          </span>
                        </Badge>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Individual Reviews */}
          <div>
            <h2 className="font-semibold text-lg mb-3">All Reviews</h2>
            <div className="space-y-3">
              {reviews.map((review, index) => {
                const initials = review.profiles.full_name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .slice(0, 2)

                return (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + index * 0.03 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={review.profiles.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-sm">{review.profiles.full_name}</p>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {new Date(review.created_at).toLocaleDateString('en-ZA', {
                                  day: 'numeric', month: 'short', year: 'numeric'
                                })}
                              </span>
                            </div>
                            <StarRating rating={review.rating} size="sm" className="mt-1" />
                            {review.comment && (
                              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                {review.comment}
                              </p>
                            )}
                            {review.traits && review.traits.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {review.traits.map(trait => (
                                  <span key={trait} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                                    {TRAIT_EMOJIS[trait as keyof typeof TRAIT_EMOJIS]} {TRAIT_LABELS[trait as keyof typeof TRAIT_LABELS] || trait}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
