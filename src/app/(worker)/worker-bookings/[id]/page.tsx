'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'

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
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [reviewRequested, setReviewRequested] = useState(false)

  // -------------------------------------------------------------------------
  // Load booking
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

      if (data) setBooking(data as unknown as BookingDetail)

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
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Failed to update booking' }))
        throw new Error(error || 'Failed to update booking')
      }

      const { booking: updated } = await res.json()
      setBooking(prev => prev ? { ...prev, ...updated } : null)
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-ZA', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatDateShort = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
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
      <div className="max-w-2xl mx-auto px-5 pt-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-[#e8e8e6] animate-pulse" />
          <div className="h-6 w-40 bg-[#e8e8e6] rounded-lg animate-pulse" />
        </div>
        <div className="h-20 bg-[#e8e8e6] rounded-xl animate-pulse" />
        <div className="h-40 bg-[#e8e8e6] rounded-xl animate-pulse" />
        <div className="h-32 bg-[#e8e8e6] rounded-xl animate-pulse" />
        <div className="h-24 bg-[#e8e8e6] rounded-xl animate-pulse" />
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Not found
  // -------------------------------------------------------------------------

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto px-5 pt-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#e8e8e6] flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[#6e7a73] text-3xl">search_off</span>
        </div>
        <p className="font-heading text-lg font-bold text-[#1a1c1b]">Booking not found</p>
        <p className="text-sm text-[#6e7a73]">
          This booking could not be found or you do not have access to it.
        </p>
        <Link
          href="/worker-bookings"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#005d42] text-white font-bold text-sm hover:bg-[#047857] transition-colors"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Bookings
        </Link>
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
    <div className="max-w-2xl mx-auto pb-32">
      {/* Header */}
      <div className="flex items-center px-4 h-16 sticky top-0 bg-[#f9f9f7] z-20">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full text-[#005d42] hover:bg-[#e2e3e1] transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="ml-4 font-heading font-bold tracking-tight text-[#1a1c1b] flex-1">
          Booking Details
        </h1>
        <button
          onClick={handleMessageClient}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#005d42] border border-[#005d42]/20 text-sm font-medium hover:bg-[#005d42]/5 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">chat_bubble</span>
          Message
        </button>
      </div>

      <main className="px-6 space-y-8 pt-4">
        {/* Status & Title */}
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
            {booking.services.name} <br />
            <span className="text-[#005d42]">{formatDateShort(booking.scheduled_date)}</span>
          </h2>
        </section>

        {/* Accepted — waiting for client */}
        {booking.status === 'accepted' && (
          <div className="bg-[#ffdcc3] border border-[#904d00]/20 rounded-xl p-5 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#904d00] shrink-0">hourglass_top</span>
            <div>
              <p className="font-heading font-bold text-[#904d00]">
                Waiting for Client Confirmation
              </p>
              <p className="text-sm text-[#904d00]/80 mt-0.5">
                You have accepted this booking. The client needs to confirm before you can start the job.
              </p>
            </div>
          </div>
        )}

        {/* Client Card */}
        <div className="bg-white rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(26,28,27,0.04)] flex relative border-l-4 border-[#005d42]">
          <div className="p-6 flex items-center space-x-5 w-full">
            {booking.profiles.avatar_url ? (
              <Image
                className="w-16 h-16 rounded-lg object-cover"
                src={booking.profiles.avatar_url}
                alt={booking.profiles.full_name}
                width={64}
                height={64}
                unoptimized
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-[#e8e8e6] flex items-center justify-center text-[#3e4943] font-heading font-bold text-lg">
                {clientInitials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[#3e4943] text-xs font-medium uppercase tracking-widest mb-1">
                Client
              </p>
              <h3 className="font-heading text-xl font-bold text-[#1a1c1b]">
                {booking.profiles.full_name}
              </h3>
              {booking.profiles.phone && showAddress && (
                <a
                  href={`tel:${booking.profiles.phone}`}
                  className="text-sm text-[#005d42] flex items-center gap-1 mt-1 hover:underline"
                >
                  <span className="material-symbols-outlined text-sm">phone</span>
                  {booking.profiles.phone}
                </a>
              )}
            </div>
            <button
              onClick={handleMessageClient}
              className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-[#005d42] hover:bg-[#e2e3e1] transition-colors"
            >
              <span className="material-symbols-outlined">chat_bubble</span>
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Service */}
          <div className="bg-[#f4f4f2] rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-2 text-[#3e4943]">
              <span className="material-symbols-outlined text-[18px]">home_repair_service</span>
              <span className="text-xs font-bold uppercase tracking-tight">Service</span>
            </div>
            <p className="text-sm font-semibold text-[#1a1c1b]">{booking.services.name}</p>
            <p className="text-xs text-[#6e7a73]">{booking.services.category}</p>
          </div>

          {/* Date */}
          <div className="bg-[#f4f4f2] rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-2 text-[#3e4943]">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              <span className="text-xs font-bold uppercase tracking-tight">Date</span>
            </div>
            <p className="text-sm font-semibold text-[#1a1c1b]">{formatDate(booking.scheduled_date)}</p>
          </div>

          {/* Time */}
          <div className="bg-[#f4f4f2] rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-2 text-[#3e4943]">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              <span className="text-xs font-bold uppercase tracking-tight">Time</span>
            </div>
            <p className="text-sm font-semibold text-[#1a1c1b]">
              {formatTime(booking.start_time)}
              {booking.end_time ? ` — ${formatTime(booking.end_time)}` : ''}
            </p>
          </div>

          {/* Booking Amount */}
          {booking.total_amount != null && booking.total_amount > 0 && (
            <div className="bg-[#f4f4f2] rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-2 text-[#3e4943]">
                <span className="material-symbols-outlined text-[18px]">payments</span>
                <span className="text-xs font-bold uppercase tracking-tight">Amount</span>
              </div>
              <p className="text-sm font-bold text-[#005d42]">R{booking.total_amount}</p>
            </div>
          )}
        </div>

        {/* Address — only visible for confirmed, in_progress, completed */}
        {showAddress && booking.address && (
          <div className="bg-[#f4f4f2] p-6 rounded-xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-[#e2e3e1] p-2 rounded-lg">
                <span className="material-symbols-outlined text-[#005d42]">location_on</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#3e4943] text-xs font-medium">Location</p>
                <p className="font-heading font-bold text-[#1a1c1b]">
                  {booking.address}
                  {booking.suburb ? `, ${booking.suburb}` : ''}
                </p>
              </div>
            </div>
            {directionsUrl && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-xl border border-[#005d42]/20 text-[#005d42] font-medium flex items-center justify-center gap-2 hover:bg-[#005d42]/5 transition-colors"
              >
                <span className="material-symbols-outlined">navigation</span>
                Get Directions
              </a>
            )}
          </div>
        )}

        {/* Address hidden notice for pending / accepted */}
        {!showAddress && (
          <div className="border border-dashed border-[#bdc9c1] rounded-xl p-5 flex items-center gap-3 text-[#6e7a73]">
            <span className="material-symbols-outlined shrink-0">shield</span>
            <p className="text-sm">
              The client&apos;s address will be visible once the booking is confirmed.
            </p>
          </div>
        )}

        {/* Client Instructions */}
        {booking.instructions && (
          <div className="bg-[#f4f4f2] p-6 rounded-xl">
            <div className="flex items-center space-x-3 mb-3">
              <span className="material-symbols-outlined text-[#005d42]">assignment</span>
              <p className="text-[#3e4943] text-xs font-medium uppercase tracking-widest">
                Client Instructions
              </p>
            </div>
            <div className="bg-white border-l-4 border-[#005d42] rounded-lg p-4 shadow-sm">
              <p className="text-sm text-[#1a1c1b] italic leading-snug whitespace-pre-wrap">
                &ldquo;{booking.instructions}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* Payment: Payment card (earnings, client paid, platform fee, Paystack reference)
         * commented out for future restoration. See git history for full implementation. */}
      </main>

      {/* Action Buttons — fixed at bottom */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-[#f9f9f7]/95 backdrop-blur-sm border-t border-[#e8e8e6] z-10">
        <div className="max-w-2xl mx-auto">
          {/* Pending: Accept / Decline */}
          {booking.status === 'pending' && (
            <div className="flex gap-3">
              <button
                className="flex-1 h-12 rounded-xl border border-[#bdc9c1] text-[#3e4943] font-medium flex items-center justify-center gap-2 hover:bg-[#f4f4f2] transition-colors disabled:opacity-50"
                disabled={actionLoading !== null}
                onClick={() => updateBookingStatus('declined')}
              >
                {actionLoading === 'declined' ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined">close</span>
                    Decline
                  </>
                )}
              </button>
              <button
                className="flex-1 h-12 rounded-xl bg-[#005d42] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#047857] transition-colors disabled:opacity-50"
                disabled={actionLoading !== null}
                onClick={() => updateBookingStatus('accepted')}
              >
                {actionLoading === 'accepted' ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined">check</span>
                    Accept
                  </>
                )}
              </button>
            </div>
          )}

          {/* Accepted: Waiting for client confirmation */}
          {booking.status === 'accepted' && (
            <button
              className="w-full h-12 rounded-xl border border-[#bdc9c1] text-[#6e7a73] font-medium flex items-center justify-center gap-2 cursor-not-allowed opacity-70"
              disabled
            >
              <span className="material-symbols-outlined">hourglass_top</span>
              Waiting for Client Confirmation
            </button>
          )}

          {/* Confirmed: Start Job */}
          {booking.status === 'confirmed' && (
            <button
              className="w-full h-12 rounded-xl bg-[#005d42] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#047857] transition-colors disabled:opacity-50 shadow-lg shadow-[#005d42]/20"
              disabled={actionLoading !== null}
              onClick={() => updateBookingStatus('in_progress')}
            >
              {actionLoading === 'in_progress' ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined">play_arrow</span>
                  Start Job
                </>
              )}
            </button>
          )}

          {/* In Progress: Mark Complete */}
          {booking.status === 'in_progress' && (
            <button
              className="w-full h-12 rounded-xl bg-[#005d42] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#047857] transition-colors disabled:opacity-50 shadow-lg shadow-[#005d42]/20"
              disabled={actionLoading !== null}
              onClick={() => updateBookingStatus('completed')}
            >
              {actionLoading === 'completed' ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined">flag</span>
                  Mark Complete
                </>
              )}
            </button>
          )}

          {/* Completed: Request Review + Back */}
          {booking.status === 'completed' && (
            <div className="flex gap-3">
              <button
                className="flex-1 h-12 rounded-xl border border-[#bdc9c1] text-[#3e4943] font-medium flex items-center justify-center gap-2 hover:bg-[#f4f4f2] transition-colors"
                onClick={() => router.push('/worker-bookings')}
              >
                <span className="material-symbols-outlined">arrow_back</span>
                All Bookings
              </button>
              <button
                className={`flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
                  reviewRequested
                    ? 'bg-[#e8e8e6] text-[#3e4943]'
                    : 'bg-[#005d42] text-white hover:bg-[#047857]'
                }`}
                disabled={actionLoading === 'review' || reviewRequested}
                onClick={requestReview}
              >
                {actionLoading === 'review' ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : reviewRequested ? (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    Review Requested
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">star</span>
                    Request Review
                  </>
                )}
              </button>
            </div>
          )}

          {/* Cancelled / Declined / No-show: Back */}
          {['cancelled', 'declined', 'no_show'].includes(booking.status) && (
            <button
              className="w-full h-12 rounded-xl border border-[#bdc9c1] text-[#3e4943] font-medium flex items-center justify-center gap-2 hover:bg-[#f4f4f2] transition-colors"
              onClick={() => router.push('/worker-bookings')}
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Bookings
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
