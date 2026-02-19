'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { StarRating } from '@/components/ui/star-rating'
import { Separator } from '@/components/ui/separator'
import { Star, ChevronRight, MessageSquareOff } from 'lucide-react'

interface ReviewItem {
  id: string
  booking_id: string
  overall_rating: number
  sub_ratings: {
    punctuality: number
    quality: number
    communication: number
  }
  comment: string | null
  created_at: string
  worker_name: string
  worker_avatar: string | null
  service_name: string
}

interface UnreviewedBooking {
  id: string
  scheduled_date: string
  worker_name: string
  service_name: string
}

export default function ClientReviewsPage() {
  const supabase = createClient()
  const { isLoading: userLoading } = useUser()
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [unreviewedBookings, setUnreviewedBookings] = useState<UnreviewedBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadReviews() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch reviews written by this user
      const { data: reviewData } = await supabase
        .from('reviews')
        .select(`
          id, booking_id, overall_rating, sub_ratings, comment, created_at,
          profiles!reviewee_id(full_name, avatar_url),
          bookings!inner(services(name))
        `)
        .eq('reviewer_id', user.id)
        .order('created_at', { ascending: false })

      if (reviewData) {
        const items: ReviewItem[] = reviewData.map(r => {
          const worker = r.profiles as unknown as { full_name: string; avatar_url: string | null }
          const booking = r.bookings as unknown as { services: { name: string } }
          return {
            id: r.id,
            booking_id: r.booking_id,
            overall_rating: r.overall_rating,
            sub_ratings: r.sub_ratings as unknown as ReviewItem['sub_ratings'],
            comment: r.comment,
            created_at: r.created_at,
            worker_name: worker?.full_name || 'Unknown',
            worker_avatar: worker?.avatar_url || null,
            service_name: booking?.services?.name || 'Service',
          }
        })
        setReviews(items)

        // Find completed bookings without reviews
        const reviewedBookingIds = items.map(r => r.booking_id)

        const { data: completedBookings } = await supabase
          .from('bookings')
          .select('id, scheduled_date, profiles!worker_id(full_name), services(name)')
          .eq('client_id', user.id)
          .eq('status', 'completed')

        if (completedBookings) {
          const unreviewed = completedBookings
            .filter(b => !reviewedBookingIds.includes(b.id))
            .map(b => {
              const profile = b.profiles as unknown as { full_name: string }
              const service = b.services as unknown as { name: string }
              return {
                id: b.id,
                scheduled_date: b.scheduled_date,
                worker_name: profile?.full_name || 'Unknown',
                service_name: service?.name || 'Service',
              }
            })
          setUnreviewedBookings(unreviewed)
        }
      }

      setIsLoading(false)
    }

    loadReviews()
  }, [supabase])

  if (userLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-36" />
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">My Reviews</h1>

      {/* Pending Reviews */}
      {unreviewedBookings.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Pending Reviews ({unreviewedBookings.length})
          </h2>
          <div className="space-y-2">
            {unreviewedBookings.map(booking => (
              <Link key={booking.id} href={`/bookings/${booking.id}#review`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{booking.worker_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.service_name} -{' '}
                        {new Date(booking.scheduled_date + 'T00:00:00').toLocaleDateString(
                          undefined,
                          { month: 'short', day: 'numeric' }
                        )}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1">
                      Write Review
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <Separator />
        </div>
      )}

      {/* Reviews Written */}
      {reviews.length === 0 && unreviewedBookings.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <MessageSquareOff className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-lg font-medium">No reviews yet</p>
          <p className="text-muted-foreground">
            Complete a booking to leave a review for your worker.
          </p>
          <Button asChild>
            <Link href="/bookings">View Bookings</Link>
          </Button>
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-3">
          {unreviewedBookings.length > 0 && (
            <h2 className="font-semibold text-lg">Your Reviews ({reviews.length})</h2>
          )}
          {reviews.map(review => (
            <Card key={review.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={review.worker_avatar || undefined} />
                    <AvatarFallback>
                      {review.worker_name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{review.worker_name}</p>
                    <p className="text-sm text-muted-foreground">{review.service_name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>

                <StarRating rating={review.overall_rating} />

                {review.comment && (
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}

                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Punctuality: {review.sub_ratings.punctuality}/5</span>
                  <span>Quality: {review.sub_ratings.quality}/5</span>
                  <span>Communication: {review.sub_ratings.communication}/5</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  )
}
