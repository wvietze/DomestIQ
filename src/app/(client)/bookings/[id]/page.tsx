'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { StarRating } from '@/components/ui/star-rating'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogTrigger
} from '@/components/ui/dialog'
import {
  ArrowLeft, CalendarDays, Clock, MapPin, MessageSquare,
  XCircle, Loader2, CheckCircle2, AlertTriangle, FileText, CreditCard
} from 'lucide-react'
import { calculatePlatformFee } from '@/lib/types/payment'

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

interface BookingTransaction {
  id: string
  booking_id: string
  worker_amount: number
  platform_fee: number
  total_amount: number
  platform_fee_percent: number
  currency: string
  status: string
  paystack_reference: string | null
  paid_at: string | null
  created_at: string
}

const statusColors: Record<string, string> = {
  pending: 'warning',
  accepted: 'default',
  confirmed: 'default',
  in_progress: 'success',
  completed: 'secondary',
  cancelled: 'destructive',
  declined: 'destructive',
  no_show: 'destructive',
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
  const [transaction, setTransaction] = useState<BookingTransaction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)
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

          // Fetch transaction for this booking
          const { data: txData } = await supabase
            .from('transactions')
            .select('id, booking_id, worker_amount, platform_fee, total_amount, platform_fee_percent, currency, status, paystack_reference, paid_at, created_at')
            .eq('booking_id', id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (txData) {
            setTransaction(txData as unknown as BookingTransaction)
          }
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
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancellation_reason: cancelReason || null,
          cancelled_by: user.id,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', booking.id)

      if (error) throw error

      setBooking(prev =>
        prev ? { ...prev, status: 'cancelled', cancellation_reason: cancelReason } : null
      )
      setCancelDialogOpen(false)

      // Notify the worker
      await supabase.from('notifications').insert({
        user_id: booking.worker_id,
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        body: `A booking for ${formatDate(booking.scheduled_date)} has been cancelled.`,
        action_url: '/worker-bookings',
      })
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

  const handlePayNow = async () => {
    if (!booking) return
    setIsPaymentLoading(true)

    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: booking.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('Payment init failed:', data.error)
        return
      }

      // Redirect to Paystack checkout
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      }
    } catch (err) {
      console.error('Payment initialization error:', err)
    } finally {
      setIsPaymentLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (timeStr: string) => timeStr.slice(0, 5)

  const canCancel =
    booking &&
    ['pending', 'accepted', 'confirmed'].includes(booking.status)

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-lg font-medium">Booking not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/bookings')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">Booking Details</h1>
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <Badge
          variant={
            (statusColors[booking.status] as
              | 'default'
              | 'secondary'
              | 'destructive'
              | 'outline'
              | 'success'
              | 'warning') || 'outline'
          }
          className="text-sm px-3 py-1"
        >
          {statusLabels[booking.status] || booking.status}
        </Badge>
        <span className="text-sm text-muted-foreground">
          Booked {new Date(booking.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Worker Info */}
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <Avatar className="w-14 h-14">
            <AvatarImage src={booking.worker_avatar || undefined} />
            <AvatarFallback className="text-lg">
              {booking.worker_name
                .split(' ')
                .map(n => n[0])
                .join('')
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-lg">{booking.worker_name}</p>
            <p className="text-muted-foreground">{booking.service_name}</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/messages?with=${booking.worker_id}`)}
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
        </CardContent>
      </Card>

      {/* Schedule & Location */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{formatDate(booking.scheduled_date)}</p>
              <p className="text-sm text-muted-foreground">
                {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                {booking.estimated_duration_mins && (
                  <span> ({booking.estimated_duration_mins} min)</span>
                )}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{booking.address}</p>
              {booking.address_line2 && (
                <p className="text-sm text-muted-foreground">{booking.address_line2}</p>
              )}
              {(booking.city || booking.province) && (
                <p className="text-sm text-muted-foreground">
                  {[booking.city, booking.province, booking.postal_code]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      {booking.instructions && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold">Special Instructions</h3>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {booking.instructions}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Payment Summary */}
      {booking.total_amount > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total Amount</span>
              <span className="text-xl font-bold text-primary">
                R{booking.total_amount.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Status Section */}
      {transaction ? (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Payment Status</h3>
              </div>
              <Badge
                className={
                  transaction.status === 'pending'
                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400'
                    : transaction.status === 'processing'
                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
                    : transaction.status === 'completed'
                    ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                    : transaction.status === 'failed'
                    ? 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400'
                }
              >
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </Badge>
            </div>

            <Separator />

            {/* Price Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Worker&apos;s rate</span>
                <span>{formatCurrency(transaction.worker_amount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Platform fee ({transaction.platform_fee_percent}%)</span>
                <span>{formatCurrency(transaction.platform_fee)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-semibold">
                <span>Total paid</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(transaction.total_amount)}
                </span>
              </div>
            </div>

            {/* Payment Reference */}
            {transaction.paystack_reference && (
              <>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Payment reference</span>
                  <span className="font-mono text-xs">{transaction.paystack_reference}</span>
                </div>
              </>
            )}

            {/* Paid Date */}
            {transaction.paid_at && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Paid on</span>
                <span>
                  {new Date(transaction.paid_at).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ) : ['pending', 'accepted', 'confirmed'].includes(booking.status) && booking.total_amount > 0 ? (
        (() => {
          const feeBreakdown = calculatePlatformFee(booking.total_amount)
          return (
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-semibold">Pay for this booking</h3>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Worker&apos;s rate</span>
                    <span>{formatCurrency(feeBreakdown.workerAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Platform fee ({feeBreakdown.feePercent}%)</span>
                    <span>{formatCurrency(feeBreakdown.platformFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(feeBreakdown.totalAmount)}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handlePayNow}
                  disabled={isPaymentLoading}
                >
                  {isPaymentLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  {isPaymentLoading ? 'Initializing payment...' : `Pay Now - ${formatCurrency(feeBreakdown.totalAmount)}`}
                </Button>
              </CardContent>
            </Card>
          )
        })()
      ) : null}

      {/* Cancellation Info */}
      {booking.status === 'cancelled' && booking.cancellation_reason && (
        <Card className="border-destructive/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h3 className="font-semibold text-destructive">Cancellation Reason</h3>
            </div>
            <p className="text-sm text-muted-foreground">{booking.cancellation_reason}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {canCancel && (
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full gap-2">
              <XCircle className="w-5 h-5" />
              Cancel Booking
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Booking</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this booking? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Why are you cancelling?"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(false)}
              >
                Keep Booking
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Confirm Cancellation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Review Section */}
      {booking.status === 'completed' && (
        <div id="review" className="space-y-4">
          <Separator />
          <h2 className="text-lg font-semibold">Review</h2>

          {review ? (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <StarRating rating={review.overall_rating} />
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
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
          ) : showReviewForm ? (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label>Overall Rating</Label>
                  <StarRating
                    rating={overallRating}
                    interactive
                    onChange={setOverallRating}
                    size="lg"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Punctuality</Label>
                    <StarRating
                      rating={punctualityRating}
                      interactive
                      onChange={setPunctualityRating}
                      size="sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Quality</Label>
                    <StarRating
                      rating={qualityRating}
                      interactive
                      onChange={setQualityRating}
                      size="sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Communication</Label>
                    <StarRating
                      rating={communicationRating}
                      interactive
                      onChange={setCommunicationRating}
                      size="sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Comment (optional)</Label>
                  <Textarea
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder="Share your experience..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSubmitReview}
                    disabled={overallRating === 0 || isSubmittingReview}
                  >
                    {isSubmittingReview ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Submit Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowReviewForm(true)}
            >
              Write a Review
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
