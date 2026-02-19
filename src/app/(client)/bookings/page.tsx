'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { CalendarDays, Clock, MapPin, Star, Inbox } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }

interface BookingListItem {
  id: string; status: string; scheduled_date: string; start_time: string; end_time: string
  address: string; total_amount: number; currency: string; worker_name: string
  worker_avatar: string | null; service_name: string; has_review: boolean
}

const statusColors: Record<string, string> = {
  pending: 'warning', accepted: 'default', confirmed: 'default', in_progress: 'success',
  completed: 'secondary', cancelled: 'destructive', declined: 'destructive', no_show: 'destructive',
}
const statusLabels: Record<string, string> = {
  pending: 'Pending', accepted: 'Accepted', confirmed: 'Confirmed', in_progress: 'In Progress',
  completed: 'Completed', cancelled: 'Cancelled', declined: 'Declined', no_show: 'No Show',
}

export default function ClientBookingsPage() {
  const supabase = createClient()
  const { isLoading: userLoading } = useUser()
  const [bookings, setBookings] = useState<BookingListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    async function loadBookings() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: bookingData } = await supabase
        .from('bookings')
        .select('id, status, scheduled_date, start_time, end_time, address, total_amount, currency, profiles!worker_id(full_name, avatar_url), services(name)')
        .eq('client_id', user.id)
        .order('scheduled_date', { ascending: false })

      if (!bookingData) { setIsLoading(false); return }

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
      setIsLoading(false)
    }
    loadBookings()
  }, [supabase])

  const today = new Date().toISOString().split('T')[0]
  const upcomingBookings = bookings.filter(b => b.scheduled_date >= today && !['completed', 'cancelled', 'declined', 'no_show'].includes(b.status))
  const pastBookings = bookings.filter(b => b.scheduled_date < today || ['completed', 'cancelled', 'declined', 'no_show'].includes(b.status))

  const formatDate = (dateStr: string) => new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
  const formatTime = (timeStr: string) => timeStr.slice(0, 5)

  const renderBookingCard = (booking: BookingListItem, i: number) => (
    <motion.div key={booking.id} variants={fadeUp} transition={{ duration: 0.3, delay: i * 0.04 }}>
      <Link href={`/bookings/${booking.id}`}>
        <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{booking.worker_name}</p>
                <p className="text-sm text-muted-foreground">{booking.service_name}</p>
              </div>
              <Badge variant={(statusColors[booking.status] as 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning') || 'outline'}>
                {statusLabels[booking.status] || booking.status}
              </Badge>
            </div>

            <div className="space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{formatDate(booking.scheduled_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0 text-blue-500" />
                <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0 text-amber-500" />
                <span className="truncate">{booking.address}</span>
              </div>
            </div>

            {booking.status === 'completed' && !booking.has_review && (
              <Button variant="outline" size="sm" className="mt-3 w-full gap-1 border-amber-200 text-amber-700 hover:bg-amber-50"
                onClick={e => { e.preventDefault(); window.location.href = `/bookings/${booking.id}#review` }}>
                <Star className="w-4 h-4" /> Write Review
              </Button>
            )}

            {booking.total_amount > 0 && (
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-bold text-emerald-700">R{booking.total_amount.toFixed(2)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )

  const renderEmptyState = (message: string) => (
    <motion.div variants={fadeUp} className="text-center py-12 space-y-3">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
        <Inbox className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-lg font-semibold">{message}</p>
      <Button asChild className="bg-gradient-to-r from-emerald-600 to-teal-600">
        <Link href="/search">Find a Worker</Link>
      </Button>
    </motion.div>
  )

  if (userLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-10 w-full rounded-lg" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
      </div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl mx-auto space-y-4">
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold">My Bookings</h1>
      </motion.div>

      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="upcoming" className="flex-1">Upcoming ({upcomingBookings.length})</TabsTrigger>
            <TabsTrigger value="past" className="flex-1">Past ({pastBookings.length})</TabsTrigger>
            <TabsTrigger value="all" className="flex-1">All ({bookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-3 mt-4">
            {upcomingBookings.length === 0
              ? renderEmptyState('No upcoming bookings')
              : upcomingBookings.map((b, i) => renderBookingCard(b, i))}
          </TabsContent>

          <TabsContent value="past" className="space-y-3 mt-4">
            {pastBookings.length === 0
              ? renderEmptyState('No past bookings')
              : pastBookings.map((b, i) => renderBookingCard(b, i))}
          </TabsContent>

          <TabsContent value="all" className="space-y-3 mt-4">
            {bookings.length === 0
              ? renderEmptyState('No bookings yet')
              : bookings.map((b, i) => renderBookingCard(b, i))}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
