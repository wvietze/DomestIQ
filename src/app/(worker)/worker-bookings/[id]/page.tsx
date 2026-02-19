'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft, MapPin, Clock, CalendarDays, Navigation,
  CheckCircle2, XCircle, Play, Flag, Loader2,
  Phone, FileText, DollarSign, MessageSquare, Star,
  Hourglass, ShieldCheck, CreditCard
} from 'lucide-react'
import { motion } from 'framer-motion'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BookingDetail {
  id: string
  client_id: string
  worker_id: string
  status: string
  scheduled_date: string
  start_time: string
  end_time: string | null
  address: string | null
  suburb: string | null
  location_lat: number | null
  location_lng: number | null
  total_amount: number | null
  instructions: string | null
  completed_at: string | null
  created_at: string
  profiles: { full_name: string; avatar_url: string | null; phone: string | null }
  services: { name: string; category: string }
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

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
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

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function WorkerBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { user, profile, isLoading: userLoading } = useUser()
  const supabase = createClient()

  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [transaction, setTransaction] = useState<BookingTransaction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [reviewRequested, setReviewRequested] = useState(false)

  // -------------------------------------------------------------------------
  // Load booking + transaction
  // -------------------------------------------------------------------------

  useEffect(() => {
    async function loadBooking() {
      if (!user) return

      const { data } = await supabase
        .from('bookings')
        .select(`
          id, client_id, worker_id, status, scheduled_date,
          start_time, end_time, address, suburb,
          location_lat, location_lng, total_amount,
          instructions, completed_at, created_at,
          profiles!client_id(full_name, avatar_url, phone),
          services(name, category)
        `)
        .eq('id', id)
        .eq('worker_id', user.id)
        .single()

      if (data) {
        setBooking(data as unknown as BookingDetail)

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

      setIsLoading(false)
    }

    if (!userLoading) loadBooking()
  }, [id, user, userLoading, supabase])

  // -------------------------------------------------------------------------
  // Status actions
  // -------------------------------------------------------------------------

  const updateBookingStatus = async (newStatus: string) => {
    if (!booking) return
    setActionLoading(newStatus)

    try {
      const updateData: Record<string, unknown> = { status: newStatus }
      if (newStatus === 'in_progress') {
        updateData.actual_start_time = new Date().toISOString()
      }
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', booking.id)

      if (error) throw error

      // Create notification for the client
      const titleMap: Record<string, string> = {
        accepted: 'Booking Accepted',
        declined: 'Booking Declined',
        in_progress: 'Job Started',
        completed: 'Job Completed',
      }
      const bodyMap: Record<string, string> = {
        accepted: `${profile?.full_name || 'Your worker'} has accepted your booking. Please confirm to proceed.`,
        declined: `${profile?.full_name || 'Your worker'} has declined your booking.`,
        in_progress: `${profile?.full_name || 'Your worker'} has started working on your job.`,
        completed: `${profile?.full_name || 'Your worker'} has completed the job. Please leave a review!`,
      }

      await supabase.from('notifications').insert({
        user_id: booking.client_id,
        title: titleMap[newStatus] || 'Booking Updated',
        body: bodyMap[newStatus] || 'Your booking status has been updated.',
        type: 'booking',
        data: { booking_id: booking.id },
      })

      setBooking(prev => prev ? { ...prev, status: newStatus, ...updateData } : null)
    } catch (err) {
      console.error('Failed to update booking status:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // -------------------------------------------------------------------------
  // Request review from client
  // -------------------------------------------------------------------------

  const requestReview = async () => {
    if (!booking) return
    setActionLoading('review')

    try {
      await supabase.from('notifications').insert({
        user_id: booking.client_id,
        title: 'Review Request',
        body: `${profile?.full_name || 'Your worker'} would appreciate a review for your recent booking.`,
        type: 'review_request',
        data: { booking_id: booking.id },
      })

      setReviewRequested(true)
    } catch (err) {
      console.error('Failed to request review:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // -------------------------------------------------------------------------
  // Navigate to messages with client
  // -------------------------------------------------------------------------

  const handleMessageClient = async () => {
    if (!booking || !user) return

    // Check for existing conversation with this client
    const { data: existingConvo } = await supabase
      .from('conversations')
      .select('id')
      .or(
        `and(participant_1.eq.${user.id},participant_2.eq.${booking.client_id}),and(participant_1.eq.${booking.client_id},participant_2.eq.${user.id})`
      )
      .limit(1)
      .single()

    if (existingConvo) {
      router.push(`/worker-messages/${existingConvo.id}`)
    } else {
      // Create a new conversation
      const { data: newConvo } = await supabase
        .from('conversations')
        .insert({
          participant_1: user.id,
          participant_2: booking.client_id,
          booking_id: booking.id,
          status: 'active',
        })
        .select('id')
        .single()

      if (newConvo) {
        router.push(`/worker-messages/${newConvo.id}`)
      }
    }
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  const getDirectionsUrl = () => {
    if (booking?.location_lat && booking?.location_lng) {
      return `https://www.google.com/maps/dir/?api=1&destination=${booking.location_lat},${booking.location_lng}`
    }
    if (booking?.address) {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.address)}`
    }
    return null
  }

  const formatCurrency = (amount: number) => {
    return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-ZA', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatTime = (timeStr: string) => timeStr?.slice(0, 5) ?? ''

  // Privacy: worker only sees address once booking is confirmed or later
  const showAddress = ['confirmed', 'in_progress', 'completed'].includes(booking?.status ?? '')
  const directionsUrl = booking ? getDirectionsUrl() : null

  // -------------------------------------------------------------------------
  // Loading skeleton
  // -------------------------------------------------------------------------

  if (userLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Not found
  // -------------------------------------------------------------------------

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold">Booking Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              This booking could not be found or you do not have access to it.
            </p>
            <Button asChild className="mt-4">
              <a href="/worker-bookings">Back to Bookings</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Derived values
  // -------------------------------------------------------------------------

  const clientInitials = booking.profiles.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold flex-1">Booking Details</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleMessageClient}
        >
          <MessageSquare className="w-4 h-4 mr-1.5" />
          Message
        </Button>
      </div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-semibold text-lg">
                {statusLabels[booking.status] || booking.status}
              </p>
            </div>
            <Badge
              variant={statusVariant[booking.status] || 'outline'}
              className="text-sm px-3 py-1"
            >
              {statusLabels[booking.status] || booking.status}
            </Badge>
          </CardContent>
        </Card>
      </motion.div>

      {/* Accepted -- waiting for client confirmation */}
      {booking.status === 'accepted' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 }}
        >
          <Card className="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Hourglass className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-300">
                  Waiting for Client Confirmation
                </p>
                <p className="text-sm text-amber-700/80 dark:text-amber-400/70">
                  You have accepted this booking. The client needs to confirm before you can start the job.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Client Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={booking.profiles.avatar_url || undefined} />
                <AvatarFallback>{clientInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{booking.profiles.full_name}</p>
                {booking.profiles.phone && showAddress && (
                  <a
                    href={`tel:${booking.profiles.phone}`}
                    className="text-sm text-primary flex items-center gap-1 mt-0.5"
                  >
                    <Phone className="w-3 h-3" />
                    {booking.profiles.phone}
                  </a>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={handleMessageClient}
              >
                <MessageSquare className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Service & Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{booking.services.name}</p>
                <p className="text-xs text-muted-foreground">{booking.services.category}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm font-medium">{formatDate(booking.scheduled_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="text-sm font-medium">
                    {formatTime(booking.start_time)}
                    {booking.end_time ? ` - ${formatTime(booking.end_time)}` : ''}
                  </p>
                </div>
              </div>
            </div>

            {booking.total_amount != null && booking.total_amount > 0 && (
              <>
                <Separator />
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Booking Amount</p>
                    <p className="text-sm font-semibold text-primary">
                      {formatCurrency(booking.total_amount)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Address -- only visible for confirmed, in_progress, completed */}
      {showAddress && booking.address && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">
                {booking.address}
                {booking.suburb ? `, ${booking.suburb}` : ''}
              </p>
              {directionsUrl && (
                <Button asChild variant="outline" className="w-full">
                  <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Address hidden notice for pending / accepted */}
      {!showAddress && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-dashed">
            <CardContent className="p-4 flex items-center gap-3 text-muted-foreground">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <p className="text-sm">
                The client&apos;s address will be visible once the booking is confirmed.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Client Instructions */}
      {booking.instructions && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Client Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">
                {booking.instructions}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Payment Info -- if a transaction exists */}
      {transaction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment
                </CardTitle>
                <Badge
                  className={
                    transaction.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : transaction.status === 'pending'
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400'
                  }
                >
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your earnings</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-lg">
                  {formatCurrency(transaction.worker_amount)}
                </span>
              </div>

              <Separator />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Client paid</span>
                  <span>{formatCurrency(transaction.total_amount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Platform fee ({transaction.platform_fee_percent}%)
                  </span>
                  <span className="text-muted-foreground">
                    -{formatCurrency(transaction.platform_fee)}
                  </span>
                </div>
              </div>

              {transaction.paystack_reference && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Reference</span>
                    <span className="font-mono text-xs">{transaction.paystack_reference}</span>
                  </div>
                </>
              )}

              {transaction.paid_at && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Paid on</span>
                  <span>
                    {new Date(transaction.paid_at).toLocaleDateString('en-ZA', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Action Buttons -- fixed at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-20 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t z-10"
      >
        <div className="max-w-2xl mx-auto">
          {/* Pending: Accept / Decline */}
          {booking.status === 'pending' && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12"
                disabled={actionLoading !== null}
                onClick={() => updateBookingStatus('declined')}
              >
                {actionLoading === 'declined' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline
                  </>
                )}
              </Button>
              <Button
                className="flex-1 h-12"
                disabled={actionLoading !== null}
                onClick={() => updateBookingStatus('accepted')}
              >
                {actionLoading === 'accepted' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Accept
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Accepted: Waiting for client confirmation */}
          {booking.status === 'accepted' && (
            <Button
              variant="outline"
              className="w-full h-12"
              disabled
            >
              <Hourglass className="w-4 h-4 mr-2" />
              Waiting for Client Confirmation
            </Button>
          )}

          {/* Confirmed: Start Job */}
          {booking.status === 'confirmed' && (
            <Button
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={actionLoading !== null}
              onClick={() => updateBookingStatus('in_progress')}
            >
              {actionLoading === 'in_progress' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Job
                </>
              )}
            </Button>
          )}

          {/* In Progress: Mark Complete */}
          {booking.status === 'in_progress' && (
            <Button
              className="w-full h-12"
              disabled={actionLoading !== null}
              onClick={() => updateBookingStatus('completed')}
            >
              {actionLoading === 'completed' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Flag className="w-4 h-4 mr-2" />
                  Mark Complete
                </>
              )}
            </Button>
          )}

          {/* Completed: Request Review + Back */}
          {booking.status === 'completed' && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12"
                onClick={() => router.push('/worker-bookings')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                All Bookings
              </Button>
              <Button
                variant={reviewRequested ? 'secondary' : 'default'}
                className="flex-1 h-12"
                disabled={actionLoading === 'review' || reviewRequested}
                onClick={requestReview}
              >
                {actionLoading === 'review' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : reviewRequested ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Review Requested
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 mr-2" />
                    Request Review
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Cancelled / Declined / No-show: Back */}
          {['cancelled', 'declined', 'no_show'].includes(booking.status) && (
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => router.push('/worker-bookings')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bookings
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
