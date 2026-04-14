'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BookingItem {
  id: string
  status: string
  scheduled_date: string
  scheduled_start_time: string
  scheduled_end_time: string
  estimated_cost: number | null
  location_address: string | null
  profiles: { full_name: string; avatar_url: string | null }
  services: { name: string }
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
  disputed: 'bg-[#ffdad6] text-[#ba1a1a]',
}

const statusAccentColors: Record<string, string> = {
  pending: 'border-l-[#fe932c]',
  accepted: 'border-l-[#005d42]',
  confirmed: 'border-l-[#005d42]',
  in_progress: 'border-l-[#047857]',
  completed: 'border-l-[#6e7a73]',
  cancelled: 'border-l-[#ba1a1a]',
  declined: 'border-l-[#ba1a1a]',
  disputed: 'border-l-[#ba1a1a]',
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function WorkerBookingsPage() {
  const { user, profile, isLoading: userLoading } = useUser()
  const supabase = createClient()

  const [upcomingBookings, setUpcomingBookings] = useState<BookingItem[]>([])
  const [pastBookings, setPastBookings] = useState<BookingItem[]>([])
  const [pendingBookings, setPendingBookings] = useState<BookingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    async function loadBookings() {
      if (!user) return

      const today = new Date().toISOString().split('T')[0]

      // Upcoming (confirmed + in_progress, future dates)
      const { data: upcoming } = await supabase
        .from('bookings')
        .select('id, status, scheduled_date, scheduled_start_time, scheduled_end_time, estimated_cost, location_address, profiles!client_id(full_name, avatar_url), services(name)')
        .eq('worker_id', user.id)
        .in('status', ['confirmed', 'in_progress'])
        .gte('scheduled_date', today)
        .order('scheduled_date', { ascending: true })

      if (upcoming) setUpcomingBookings(upcoming as unknown as BookingItem[])

      // Past (completed, cancelled, or past dates)
      const { data: past } = await supabase
        .from('bookings')
        .select('id, status, scheduled_date, scheduled_start_time, scheduled_end_time, estimated_cost, location_address, profiles!client_id(full_name, avatar_url), services(name)')
        .eq('worker_id', user.id)
        .or(`status.eq.completed,status.eq.cancelled,scheduled_date.lt.${today}`)
        .order('scheduled_date', { ascending: false })
        .limit(20)

      if (past) setPastBookings(past as unknown as BookingItem[])

      // Pending
      const { data: pending } = await supabase
        .from('bookings')
        .select('id, status, scheduled_date, scheduled_start_time, scheduled_end_time, estimated_cost, location_address, profiles!client_id(full_name, avatar_url), services(name)')
        .eq('worker_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (pending) setPendingBookings(pending as unknown as BookingItem[])

      setIsLoading(false)
    }

    if (!userLoading) loadBookings()
  }, [user, userLoading, supabase])

  const handleBookingAction = async (bookingId: string, action: 'confirmed' | 'cancelled') => {
    setActionLoading(bookingId)
    try {
      await supabase
        .from('bookings')
        .update({ status: action })
        .eq('id', bookingId)

      // Create notification for client
      const { data: bookingRow } = await supabase
        .from('bookings')
        .select('client_id')
        .eq('id', bookingId)
        .single()

      if (bookingRow) {
        await supabase.from('notifications').insert({
          user_id: bookingRow.client_id,
          title: action === 'confirmed' ? 'Booking Accepted' : 'Booking Declined',
          body: action === 'confirmed'
            ? `${profile?.full_name || 'A worker'} has accepted your booking request.`
            : `${profile?.full_name || 'A worker'} has declined your booking request.`,
          type: 'booking',
          channel: 'in_app',
          data: { booking_id: bookingId },
        })
      }

      // Move booking between lists
      const booking = pendingBookings.find(b => b.id === bookingId)
      if (action === 'confirmed' && booking) {
        setUpcomingBookings(prev => [{ ...booking, status: 'confirmed' }, ...prev])
      }
      setPendingBookings(prev => prev.filter(b => b.id !== bookingId))
    } catch (err) {
      console.error('Failed to update booking:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // ---------------------------------------------------------------------------
  // Booking card
  // ---------------------------------------------------------------------------

  const renderBookingCard = (booking: BookingItem, showActions = false) => {
    const initials = booking.profiles.full_name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)

    return (
      <div
        key={booking.id}
        className={`bg-white rounded-xl shadow-sm border-l-4 ${statusAccentColors[booking.status] || 'border-l-[#6e7a73]'} hover:shadow-md transition-all duration-200`}
      >
        <Link href={`/worker-bookings/${booking.id}`} className="block p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            {booking.profiles.avatar_url ? (
              <Image
                src={booking.profiles.avatar_url}
                alt={booking.profiles.full_name}
                width={40}
                height={40}
                unoptimized
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#e8e8e6] flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#3e4943]">
                {initials}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-heading font-bold text-[#1a1c1b] truncate">
                  {booking.profiles.full_name}
                </p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${statusBadgeStyles[booking.status] || 'bg-[#e8e8e6] text-[#3e4943]'}`}
                >
                  {booking.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-[#3e4943] mt-0.5">
                {booking.services.name}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-[#6e7a73]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  {new Date(booking.scheduled_date).toLocaleDateString('en-ZA', {
                    weekday: 'short', day: 'numeric', month: 'short'
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {booking.scheduled_start_time?.slice(0, 5)} - {booking.scheduled_end_time?.slice(0, 5)}
                </span>
              </div>
              {booking.estimated_cost != null && booking.estimated_cost > 0 && (
                <p className="text-sm font-bold text-[#005d42] mt-1">
                  R{booking.estimated_cost}
                </p>
              )}
            </div>

            {/* Chevron */}
            <span className="material-symbols-outlined text-[#6e7a73] text-lg flex-shrink-0 mt-1">
              chevron_right
            </span>
          </div>
        </Link>

        {/* Accept / Decline actions */}
        {showActions && booking.status === 'pending' && (
          <div className="flex gap-2 px-4 pb-4 pt-2 border-t border-[#e8e8e6]">
            <button
              className="flex-1 h-10 rounded-xl border border-[#bdc9c1] text-[#3e4943] font-medium text-sm flex items-center justify-center gap-1.5 hover:bg-[#f4f4f2] transition-colors disabled:opacity-50"
              disabled={actionLoading === booking.id}
              onClick={(e) => {
                e.preventDefault()
                handleBookingAction(booking.id, 'cancelled')
              }}
            >
              {actionLoading === booking.id ? (
                <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">close</span>
                  Decline
                </>
              )}
            </button>
            <button
              className="flex-1 h-10 rounded-xl bg-[#005d42] text-white font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-[#047857] transition-colors disabled:opacity-50"
              disabled={actionLoading === booking.id}
              onClick={(e) => {
                e.preventDefault()
                handleBookingAction(booking.id, 'confirmed')
              }}
            >
              {actionLoading === booking.id ? (
                <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">check</span>
                  Accept
                </>
              )}
            </button>
          </div>
        )}
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------

  const renderEmptyState = (message: string) => (
    <div className="text-center py-16 space-y-3">
      <div className="w-16 h-16 bg-[#f4f4f2] rounded-full flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-[#6e7a73] text-3xl">event_busy</span>
      </div>
      <p className="text-[#6e7a73] font-medium">{message}</p>
    </div>
  )

  // ---------------------------------------------------------------------------
  // Loading skeleton
  // ---------------------------------------------------------------------------

  if (userLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="h-8 w-40 bg-[#e8e8e6] rounded-lg animate-pulse" />
        <div className="h-10 w-full bg-[#e8e8e6] rounded-lg animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 bg-[#e8e8e6] rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#005d42]/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[#005d42]">event_note</span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-[#1a1c1b]">My Bookings</h1>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming" className="relative">
            Upcoming
            {upcomingBookings.length > 0 && (
              <span className="ml-1.5 bg-[#005d42] text-white text-[10px] rounded-full w-5 h-5 inline-flex items-center justify-center font-bold">
                {upcomingBookings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingBookings.length > 0 && (
              <span className="ml-1.5 bg-[#fe932c] text-white text-[10px] rounded-full w-5 h-5 inline-flex items-center justify-center font-bold">
                {pendingBookings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3 mt-4">
          {upcomingBookings.length === 0
            ? renderEmptyState('No upcoming bookings')
            : upcomingBookings.map(b => renderBookingCard(b))
          }
        </TabsContent>

        <TabsContent value="pending" className="space-y-3 mt-4">
          {pendingBookings.length === 0
            ? renderEmptyState('No pending requests')
            : pendingBookings.map(b => renderBookingCard(b, true))
          }
        </TabsContent>

        <TabsContent value="past" className="space-y-3 mt-4">
          {pastBookings.length === 0
            ? renderEmptyState('No past bookings')
            : pastBookings.map(b => renderBookingCard(b))
          }
        </TabsContent>
      </Tabs>
    </div>
  )
}
