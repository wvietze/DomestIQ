'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { StarRating } from '@/components/ui/star-rating'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogTrigger
} from '@/components/ui/dialog'

// Payment imports — commented out for future restoration
// import { calculatePlatformFee } from '@/lib/types/payment'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BookingDetail {
  id: string
  client_id: string
  worker_id: string
  service_id: string
  status: string
  scheduled_date: string
  start_time: string
  end_time: string
  estimated_duration_mins: number | null
  address: string
  address_line2: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  instructions: string | null
  total_amount: number
  currency: string
  cancellation_reason: string | null
  created_at: string
  worker_name: string
  worker_avatar: string | null
  service_name: string
}

interface ExistingReview {
  id: string
  overall_rating: number
  sub_ratings: {
    punctuality: number
    quality: number
    communication: number
  }
  comment: string | null
  created_at: string
}

// ---------------------------------------------------------------------------
// Status config — Stitch design system
// ---------------------------------------------------------------------------

const statusBadgeStyles: Record<string, string> = {
  pending: 'bg-[#ffdcc3] text-[#904d00]',
  accepted: 'bg-[#97f5cc] text-[#005d42]',
  confirmed: 'bg-[#97f5cc] text-[#005d42]',
  in_progress: 'bg-[#97f5cc] text-[#005d42]',
  completed: 'bg-[#e8e8e6] text-[#3e4943]',
  cancelled: 'bg-[#ffdad6] text-[#ba1a1a]',
  declined: 'bg-[#ffdad6] text-[#ba1a1a]',
  no_show: 'bg-[#ffdad6] text-[#ba1a1a]',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  declined: 'Declined',
  no_show: 'No Show',
}

const statusIcons: Record<string, string> = {
  pending: 'schedule',
  accepted: 'task_alt',
  confirmed: 'check_circle',
  in_progress: 'play_circle',
  completed: 'verified',
  cancelled: 'cancel',
  declined: 'block',
  no_show: 'person_off',
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const { user } = useUser()

  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [review, setReview] = useState<ExistingReview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // Payment: isPaymentLoading state commented out for future restoration
  // const [isPaymentLoading, setIsPaymentLoading] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [overallRating, setOverallRating] = useState(0)
  const [punctualityRating, setPunctualityRating] = useState(0)
  const [qualityRating, setQualityRating] = useState(0)
  const [communicationRating, setCommunicationRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  useEffect(() => {
    async function loadBooking() {
      if (!user) return

      try {
        const { data } = await supabase
          .from('bookings')
          .select(`
            *,
            profiles!worker_id(full_name, avatar_url),
            services(name)
          `)
          .eq('id', id)
          .single()

        if (data) {
          const profile = data.profiles as unknown as { full_name: string; avatar_url: string | null }
          const service = data.services as unknown as { name: string }
          setBooking({
            ...data,
            worker_name: profile?.full_name || 'Unknown',
            worker_avatar: profile?.avatar_url || null,
            service_name: service?.name || 'Service',
          } as unknown as BookingDetail)

          // Check for existing review
          if (data.status === 'completed') {
            const { data: reviewData } = await supabase
              .from('reviews')
              .select('*')
              .eq('booking_id', id)
              .eq('reviewer_id', user.id)
              .single()

            if (reviewData) {
              setReview(reviewData as unknown as ExistingReview)
            }
          }

          // Payment: Transaction fetch commented out for future restoration
          // const { data: txData } = await supabase
          //   .from('transactions')
          //   .select('id, booking_id, worker_amount, platform_fee, total_amount, platform_fee_percent, currency, status, paystack_reference, paid_at, created_at')
          //   .eq('booking_id', id)
          //   .order('created_at', { ascending: false })
          //   .limit(1)
          //   .single()
          //
          // if (txData) {
          //   setTransaction(txData as unknown as BookingTransaction)
          // }
        }
      } catch (err) {
        console.error('Booking detail load error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadBooking()
  }, [id, user, supabase])

  // Auto-show review form if hash is #review
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.location.hash === '#review' &&
      booking?.status === 'completed' &&
      !review
    ) {
      setShowReviewForm(true)
    }
  }, [booking, review])

  const handleCancel = async () => {
    if (!user || !booking) return
    setIsCancelling(true)

    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          cancellation_reason: cancelReason || null,
        }),
      })

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Failed to cancel booking' }))
        throw new Error(error || 'Failed to cancel booking')
      }

      setBooking(prev =>
        prev ? { ...prev, status: 'cancelled', cancellation_reason: cancelReason } : null
      )
      setCancelDialogOpen(false)
    } catch (err) {
      console.error('Failed to cancel booking:', err)
    } finally {
      setIsCancelling(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!user || !booking || overallRating === 0) return
    setIsSubmittingReview(true)

    try {
      const { data: newReview, error } = await supabase
        .from('reviews')
        .insert({
          booking_id: booking.id,
          reviewer_id: user.id,
          reviewee_id: booking.worker_id,
          overall_rating: overallRating,
          sub_ratings: {
            punctuality: punctualityRating,
            quality: qualityRating,
            communication: communicationRating,
          },
          comment: reviewComment || null,
          is_public: true,
        })
        .select()
        .single()

      if (error) throw error

      setReview(newReview as unknown as ExistingReview)
      setShowReviewForm(false)

      // Notify the worker
      await supabase.from('notifications').insert({
        user_id: booking.worker_id,
        type: 'new_review',
        title: 'New Review',
        body: `You received a ${overallRating}-star review.`,
        action_url: '/worker-profile',
      })
    } catch (err) {
      console.error('Failed to submit review:', err)
    } finally {
      setIsSubmittingReview(false)
    }
  }

  // Payment: handlePayNow commented out for future restoration
  // const handlePayNow = async () => { ... }

  const formatDateShort = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    })
  }

  const formatTime = (timeStr: string) => timeStr.slice(0, 5)

  const canCancel =
    booking &&
    ['pending', 'accepted', 'confirmed'].includes(booking.status)

  // ---------------------------------------------------------------------------
  // Loading skeleton
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-5 pt-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e8e8e6] animate-pulse" />
          <div className="h-6 w-40 bg-[#e8e8e6] rounded-lg animate-pulse" />
        </div>
        <div className="h-48 w-full bg-[#e8e8e6] rounded-xl animate-pulse" />
        <div className="h-32 w-full bg-[#e8e8e6] rounded-xl animate-pulse" />
        <div className="h-24 w-full bg-[#e8e8e6] rounded-xl animate-pulse" />
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Not found
  // ---------------------------------------------------------------------------

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto px-5 pt-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#e8e8e6] flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[#6e7a73] text-3xl">search_off</span>
        </div>
        <p className="font-heading text-lg font-bold text-[#1a1c1b]">Booking not found</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-lg border border-[#bdc9c1] text-[#3e4943] font-medium text-sm hover:bg-[#f4f4f2] transition-colors"
        >
          Go Back
        </button>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Worker initials
  // ---------------------------------------------------------------------------

  const workerInitials = booking.worker_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center px-4 h-16 sticky top-0 bg-[#f9f9f7] z-20">
        <button
          onClick={() => router.push('/bookings')}
          className="p-2 rounded-full text-[#005d42] hover:bg-[#e2e3e1] transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="ml-4 font-heading font-bold tracking-tight text-[#1a1c1b]">
          Booking Details
        </h1>
      </div>

      <main className="px-6 space-y-10 pt-4">
        {/* Status & Title Section */}
        <section className="space-y-4">
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${statusBadgeStyles[booking.status] || 'bg-[#e8e8e6] text-[#3e4943]'}`}
          >
            <span
              className="material-symbols-outlined text-sm mr-1"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {statusIcons[booking.status] || 'info'}
            </span>
            {statusLabels[booking.status] || booking.status}
          </div>
          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-[#1a1c1b] leading-tight">
            {booking.service_name} <br />
            <span className="text-[#005d42]">{formatDateShort(booking.scheduled_date)}</span>
          </h2>
        </section>

        {/* Worker Card */}
        <div className="bg-white rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(26,28,27,0.04)] flex relative border-l-4 border-[#005d42]">
          <div className="p-6 flex items-center space-x-6 w-full">
            {booking.worker_avatar ? (
              <Image
                className="w-20 h-20 rounded-lg object-cover"
                src={booking.worker_avatar}
                alt={booking.worker_name}
                width={80}
                height={80}
                unoptimized
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-[#e8e8e6] flex items-center justify-center text-[#3e4943] font-heading font-bold text-xl">
                {workerInitials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[#3e4943] text-xs font-medium uppercase tracking-widest mb-1">
                Service Professional
              </p>
              <h3 className="font-heading text-xl font-bold text-[#1a1c1b]">
                {booking.worker_name}
              </h3>
              <p className="text-[#3e4943] text-sm mt-1">{booking.service_name}</p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time and Date */}
          <div className="bg-[#f4f4f2] p-6 rounded-xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-[#e2e3e1] p-2 rounded-lg">
                <span className="material-symbols-outlined text-[#005d42]">schedule</span>
              </div>
              <div>
                <p className="text-[#3e4943] text-xs font-medium">Time Slot</p>
                <p className="font-heading font-bold text-[#1a1c1b]">
                  {formatTime(booking.start_time)} — {formatTime(booking.end_time)}
                </p>
              </div>
            </div>
            {booking.estimated_duration_mins && (
              <div className="pt-4 border-t border-[#bdc9c1]/20">
                <p className="text-[#3e4943] text-xs font-medium">Duration</p>
                <p className="font-semibold text-[#1a1c1b]">
                  {booking.estimated_duration_mins} Minutes
                </p>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="bg-[#f4f4f2] p-6 rounded-xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-[#e2e3e1] p-2 rounded-lg">
                <span className="material-symbols-outlined text-[#005d42]">location_on</span>
              </div>
              <div>
                <p className="text-[#3e4943] text-xs font-medium">Location</p>
                <p className="font-heading font-bold text-[#1a1c1b] truncate">
                  {booking.address}
                </p>
              </div>
            </div>
            {(booking.address_line2 || booking.city || booking.province) && (
              <div className="pt-4 border-t border-[#bdc9c1]/20">
                {booking.address_line2 && (
                  <p className="text-sm text-[#3e4943]">{booking.address_line2}</p>
                )}
                {(booking.city || booking.province) && (
                  <p className="text-sm text-[#3e4943]">
                    {[booking.city, booking.province, booking.postal_code]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Special Instructions (full width) */}
          {booking.instructions && (
            <div className="md:col-span-2 bg-[#f4f4f2] p-6 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <span className="material-symbols-outlined text-[#005d42]">assignment</span>
                <p className="text-[#3e4943] text-xs font-medium uppercase tracking-widest">
                  Special Instructions
                </p>
              </div>
              <p className="text-[#1a1c1b] text-lg font-medium italic whitespace-pre-wrap">
                &ldquo;{booking.instructions}&rdquo;
              </p>
            </div>
          )}

          {/* Estimated Rate — informational only */}
          {booking.total_amount > 0 && (
            <div className="md:col-span-2 bg-[#005d42] text-white p-6 rounded-xl flex justify-between items-center shadow-lg shadow-[#005d42]/10">
              <div>
                <p className="text-[#97f5cc] text-xs font-medium uppercase tracking-widest opacity-80">
                  Estimated Rate
                </p>
                <p className="font-heading text-3xl font-extrabold tracking-tight">
                  R{booking.total_amount}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-70">Arranged directly</p>
                <p className="text-xs font-bold">Between you &amp; the worker</p>
              </div>
            </div>
          )}
        </div>

        {/* Cancellation Info */}
        {booking.status === 'cancelled' && booking.cancellation_reason && (
          <div className="bg-[#ffdad6] border border-[#ba1a1a]/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#ba1a1a]">warning</span>
              <h3 className="font-heading font-bold text-[#ba1a1a]">Cancellation Reason</h3>
            </div>
            <p className="text-sm text-[#93000a]">{booking.cancellation_reason}</p>
          </div>
        )}

        {/* Review Section */}
        {booking.status === 'completed' && (
          <div id="review" className="space-y-6">
            {review ? (
              /* Existing review display */
              <div className="bg-white p-8 rounded-xl border border-[#bdc9c1]/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading text-xl font-bold text-[#1a1c1b]">Your Review</h4>
                  <span className="text-sm text-[#6e7a73]">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <StarRating rating={review.overall_rating} />
                {review.comment && (
                  <p className="text-sm text-[#3e4943] italic">&ldquo;{review.comment}&rdquo;</p>
                )}
                <div className="flex gap-4 text-xs text-[#6e7a73]">
                  <span>Punctuality: {review.sub_ratings.punctuality}/5</span>
                  <span>Quality: {review.sub_ratings.quality}/5</span>
                  <span>Communication: {review.sub_ratings.communication}/5</span>
                </div>
              </div>
            ) : showReviewForm ? (
              /* Review form */
              <div className="bg-white p-8 rounded-xl border border-[#bdc9c1]/20 space-y-5">
                <h4 className="font-heading text-xl font-bold text-[#1a1c1b]">
                  How was {booking.worker_name}?
                </h4>
                <p className="text-[#3e4943]">
                  Your feedback helps maintain our community quality.
                </p>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#3e4943] uppercase tracking-widest">
                    Overall Rating
                  </label>
                  <StarRating
                    rating={overallRating}
                    interactive
                    onChange={setOverallRating}
                    size="lg"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-[#6e7a73]">Punctuality</label>
                    <StarRating
                      rating={punctualityRating}
                      interactive
                      onChange={setPunctualityRating}
                      size="sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#6e7a73]">Quality</label>
                    <StarRating
                      rating={qualityRating}
                      interactive
                      onChange={setQualityRating}
                      size="sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#6e7a73]">Communication</label>
                    <StarRating
                      rating={communicationRating}
                      interactive
                      onChange={setCommunicationRating}
                      size="sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#3e4943] uppercase tracking-widest">
                    Comment (optional)
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder="Share your experience..."
                    rows={4}
                    className="w-full rounded-xl border border-[#bdc9c1] bg-[#f4f4f2] px-4 py-3 text-sm text-[#1a1c1b] placeholder:text-[#6e7a73] focus:outline-none focus:ring-2 focus:ring-[#005d42] focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1 h-12 rounded-xl border border-[#bdc9c1] text-[#3e4943] font-medium hover:bg-[#f4f4f2] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={overallRating === 0 || isSubmittingReview}
                    className="flex-1 h-12 rounded-xl bg-[#005d42] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#047857] transition-colors disabled:opacity-50"
                  >
                    {isSubmittingReview ? (
                      <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                    )}
                    Submit Review
                  </button>
                </div>
              </div>
            ) : (
              /* Review nudge card */
              <div className="bg-white p-8 rounded-xl border border-[#bdc9c1]/20 text-center space-y-4">
                <h4 className="font-heading text-xl font-bold text-[#1a1c1b]">
                  How was {booking.worker_name}?
                </h4>
                <p className="text-[#3e4943]">
                  Your feedback helps maintain our community quality.
                </p>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      onClick={() => {
                        setOverallRating(star)
                        setShowReviewForm(true)
                      }}
                      className="material-symbols-outlined text-[#e8e8e6] text-4xl cursor-pointer hover:text-[#fe932c] transition-colors"
                    >
                      star
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="pt-2 text-[#005d42] font-bold font-heading text-sm uppercase tracking-widest hover:underline"
                >
                  Leave a review
                </button>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-6 pt-2">
          {/* Message Worker */}
          <button
            onClick={() => router.push(`/messages?with=${booking.worker_id}`)}
            className="w-full h-14 rounded-xl bg-[#e2e3e1] text-[#005d42] font-heading font-bold flex items-center justify-center space-x-2 transition-all hover:bg-[#dadad8] active:scale-[0.98] border border-[#005d42]/10"
          >
            <span className="material-symbols-outlined">chat_bubble</span>
            <span>Message {booking.worker_name.split(' ')[0]}</span>
          </button>

          {/* Cancel Booking */}
          {canCancel && (
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
              <DialogTrigger asChild>
                <div className="flex justify-center">
                  <button className="text-[#ba1a1a] font-medium hover:underline text-sm uppercase tracking-widest transition-colors">
                    Cancel Booking
                  </button>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Booking</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel this booking? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1a1c1b]">Reason (optional)</label>
                  <textarea
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    placeholder="Why are you cancelling?"
                    rows={3}
                    className="w-full rounded-xl border border-[#bdc9c1] bg-[#f4f4f2] px-4 py-3 text-sm text-[#1a1c1b] placeholder:text-[#6e7a73] focus:outline-none focus:ring-2 focus:ring-[#005d42] focus:border-transparent resize-none"
                  />
                </div>
                <DialogFooter>
                  <button
                    onClick={() => setCancelDialogOpen(false)}
                    className="px-6 py-2.5 rounded-lg border border-[#bdc9c1] text-[#3e4943] font-medium text-sm hover:bg-[#f4f4f2] transition-colors"
                  >
                    Keep Booking
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="px-6 py-2.5 rounded-lg bg-[#ffdad6] text-[#ba1a1a] font-bold text-sm hover:bg-[#ffdad6]/80 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isCancelling && (
                      <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                    )}
                    Confirm Cancellation
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </main>
    </div>
  )
}
