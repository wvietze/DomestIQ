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

interface BookingListItem {
  id: string
  status: string
  scheduled_date: string
  start_time: string
  end_time: string
  address: string
  total_amount: number
  currency: string
  worker_name: string
  worker_avatar: string | null
  service_name: string
  has_review: boolean
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

const statusAccentColors: Record<string, string> = {
  pending: 'border-l-[#fe932c]',
  accepted: 'border-l-[#005d42]',
  confirmed: 'border-l-[#005d42]',
  in_progress: 'border-l-[#047857]',
  completed: 'border-l-[#6e7a73]',
  cancelled: 'border-l-[#ba1a1a]',
  declined: 'border-l-[#ba1a1a]',
  no_show: 'border-l-[#ba1a1a]',
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ClientBookingsPage() {
  const supabase = createClient()
  const { user, isLoading: userLoading } = useUser()
  const [bookings, setBookings] = useState<BookingListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    async function loadBookings() {
      if (!user) return

      try {
        const { data: bookingData } = await supabase
          .from('bookings')
          .select('id, status, scheduled_date, start_time, end_time, address, total_amount, currency, profiles!worker_id(full_name, avatar_url), services(name)')
          .eq('client_id', user.id)
          .order('scheduled_date', { ascending: false })

        if (!bookingData) return

        const completedIds = bookingData.filter(b => b.status === 'completed').map(b => b.id)
        let reviewedBookingIds: string[] = []
        if (completedIds.length > 0) {
          const { data: reviews } = await supabase.from('reviews').select('booking_id').in('booking_id', completedIds).eq('reviewer_id', user.id)
          reviewedBookingIds = (reviews || []).map(r => r.booking_id)
        }

        const items: BookingListItem[] = bookingData.map(b => {
          const profile = b.profiles as unknown as { full_name: string; avatar_url: string | null }
          const service = b.services as unknown as { name: string }
          return {
            id: b.id, status: b.status, scheduled_date: b.scheduled_date, start_time: b.start_time,
            end_time: b.end_time, address: b.address, total_amount: b.total_amount, currency: b.currency,
            worker_name: profile?.full_name || 'Unknown', worker_avatar: profile?.avatar_url || null,
            service_name: service?.name || 'Service', has_review: reviewedBookingIds.includes(b.id),
          }
        })

        setBookings(items)
      } catch (err) {
        console.error('Bookings load error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    if (!userLoading) loadBookings()
  }, [user, userLoading, supabase])

  const today = new Date().toISOString().split('T')[0]
  const upcomingBookings = bookings.filter(b => b.scheduled_date >= today && !['completed', 'cancelled', 'declined', 'no_show'].includes(b.status))
  const pastBookings = bookings.filter(b => b.scheduled_date < today || ['completed', 'cancelled', 'declined', 'no_show'].includes(b.status))

  const formatDate = (dateStr: string) => new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
  const formatTime = (timeStr: string) => timeStr.slice(0, 5)

  // ---------------------------------------------------------------------------
  // Booking card
  // ---------------------------------------------------------------------------

  const renderBookingCard = (booking: BookingListItem) => (
    <Link key={booking.id} href={`/bookings/${booking.id}`} className="block">
      <div
        className={`bg-white rounded-xl shadow-sm border-l-4 ${statusAccentColors[booking.status] || 'border-l-[#6e7a73]'} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
      >
        <div className="p-4">
          {/* Top row: name + badge */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {booking.worker_avatar ? (
                <Image
                  src={booking.worker_avatar}
                  alt={booking.worker_name}
                  width={40}
                  height={40}
                  unoptimized
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#e8e8e6] flex items-center justify-center flex-shrink-0 text-sm font-bold text-[#3e4943]">
                  {booking.worker_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-heading font-bold text-[#1a1c1b] truncate">
                  {booking.worker_name}
                </p>
                <p className="text-sm text-[#3e4943]">{booking.service_name}</p>
              </div>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${statusBadgeStyles[booking.status] || 'bg-[#e8e8e6] text-[#3e4943]'}`}
            >
              {statusLabels[booking.status] || booking.status}
            </span>
          </div>

          {/* Info rows */}
          <div className="space-y-1.5 text-sm text-[#3e4943]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#005d42] text-[18px]">calendar_today</span>
              <span>{formatDate(booking.scheduled_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#005d42] text-[18px]">schedule</span>
              <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#005d42] text-[18px]">location_on</span>
              <span className="truncate">{booking.address}</span>
            </div>
          </div>

          {/* Review prompt for completed without review */}
          {booking.status === 'completed' && !booking.has_review && (
            <button
              onClick={e => { e.preventDefault(); window.location.href = `/bookings/${booking.id}#review` }}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#ffdcc3] text-[#904d00] text-sm font-medium hover:bg-[#ffdcc3]/30 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">star</span>
              Write Review
            </button>
          )}
        </div>
      </div>
    </Link>
  )

  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------

  const renderEmptyState = (message: string) => (
    <div className="text-center py-16 space-y-4">
      <div className="w-16 h-16 bg-[#f4f4f2] rounded-full flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-[#6e7a73] text-3xl">inbox</span>
      </div>
      <p className="font-heading text-lg font-bold text-[#1a1c1b]">{message}</p>
      <Link
        href="/search"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#005d42] text-white font-bold text-sm hover:bg-[#047857] transition-colors"
      >
        <span className="material-symbols-outlined text-lg">search</span>
        Find a Worker
      </Link>
    </div>
  )

  // ---------------------------------------------------------------------------
  // Loading skeleton
  // ---------------------------------------------------------------------------

  if (userLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-5 pt-6 space-y-4">
        <div className="h-8 w-36 bg-[#e8e8e6] rounded-lg animate-pulse" />
        <div className="h-10 w-full bg-[#e8e8e6] rounded-lg animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 w-full bg-[#e8e8e6] rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-2xl mx-auto px-5 pt-6 pb-8 space-y-5">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#005d42]/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[#005d42]">calendar_today</span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-[#1a1c1b]">My Bookings</h1>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="upcoming" className="flex-1">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1">
            Past ({pastBookings.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex-1">
            All ({bookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3 mt-4">
          {upcomingBookings.length === 0
            ? renderEmptyState('No upcoming bookings')
            : upcomingBookings.map(b => renderBookingCard(b))}
        </TabsContent>

        <TabsContent value="past" className="space-y-3 mt-4">
          {pastBookings.length === 0
            ? renderEmptyState('No past bookings')
            : pastBookings.map(b => renderBookingCard(b))}
        </TabsContent>

        <TabsContent value="all" className="space-y-3 mt-4">
          {bookings.length === 0
            ? renderEmptyState('No bookings yet')
            : bookings.map(b => renderBookingCard(b))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
