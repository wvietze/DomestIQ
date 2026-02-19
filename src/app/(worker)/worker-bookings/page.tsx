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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Clock, CheckCircle2, XCircle, Loader2, CalendarDays,
  ChevronRight, ClipboardList
} from 'lucide-react'
import { motion } from 'framer-motion'

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

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  pending: 'warning',
  confirmed: 'default',
  in_progress: 'success',
  completed: 'secondary',
  cancelled: 'destructive',
  disputed: 'destructive',
}

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

  const renderBookingCard = (booking: BookingItem, showActions = false) => {
    const initials = booking.profiles.full_name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)

    return (
      <Card key={booking.id} className="hover:shadow-sm transition-shadow">
        <CardContent className="p-4">
          <Link href={`/worker-bookings/${booking.id}`} className="flex items-start gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={booking.profiles.avatar_url || undefined} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium truncate">{booking.profiles.full_name}</p>
                <Badge variant={statusVariant[booking.status] || 'outline'} className="flex-shrink-0">
                  {booking.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {booking.services.name}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  {new Date(booking.scheduled_date).toLocaleDateString('en-ZA', {
                    weekday: 'short', day: 'numeric', month: 'short'
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {booking.scheduled_start_time?.slice(0, 5)} - {booking.scheduled_end_time?.slice(0, 5)}
                </span>
              </div>
              {booking.estimated_cost && (
                <p className="text-sm font-bold text-emerald-700 mt-1">
                  R{booking.estimated_cost}
                </p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
          </Link>

          {showActions && booking.status === 'pending' && (
            <div className="flex gap-2 mt-3 pt-3 border-t">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                disabled={actionLoading === booking.id}
                onClick={(e) => {
                  e.preventDefault()
                  handleBookingAction(booking.id, 'cancelled')
                }}
              >
                {actionLoading === booking.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-1" />
                    Decline
                  </>
                )}
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                disabled={actionLoading === booking.id}
                onClick={(e) => {
                  e.preventDefault()
                  handleBookingAction(booking.id, 'confirmed')
                }}
              >
                {actionLoading === booking.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Accept
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderEmptyState = (message: string) => (
    <Card>
      <CardContent className="p-8 text-center">
        <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )

  if (userLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-full rounded-lg" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold">My Bookings</h1>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming" className="relative">
            Upcoming
            {upcomingBookings.length > 0 && (
              <span className="ml-1.5 bg-primary text-primary-foreground text-[10px] rounded-full w-5 h-5 inline-flex items-center justify-center">
                {upcomingBookings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingBookings.length > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-[10px] rounded-full w-5 h-5 inline-flex items-center justify-center">
                {pendingBookings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-2 mt-4">
          {upcomingBookings.length === 0
            ? renderEmptyState('No upcoming bookings')
            : upcomingBookings.map(b => renderBookingCard(b))
          }
        </TabsContent>

        <TabsContent value="pending" className="space-y-2 mt-4">
          {pendingBookings.length === 0
            ? renderEmptyState('No pending requests')
            : pendingBookings.map(b => renderBookingCard(b, true))
          }
        </TabsContent>

        <TabsContent value="past" className="space-y-2 mt-4">
          {pastBookings.length === 0
            ? renderEmptyState('No past bookings')
            : pastBookings.map(b => renderBookingCard(b))
          }
        </TabsContent>
      </Tabs>
    </div>
  )
}
