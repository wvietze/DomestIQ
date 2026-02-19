'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { StarRating } from '@/components/ui/star-rating'
import {
  CalendarDays, Star, ClipboardList, User, ChevronRight,
  Clock, CheckCircle2, XCircle, Loader2, Briefcase,
  TrendingUp, AlertCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/hooks/use-translation'

interface DashboardBooking {
  id: string
  status: string
  scheduled_date: string
  scheduled_start_time: string
  scheduled_end_time: string
  estimated_cost: number | null
  profiles: { full_name: string; avatar_url: string | null }
  services: { name: string }
}

interface WorkerProfileData {
  id: string
  bio: string | null
  hourly_rate: number | null
  overall_rating: number
  total_reviews: number
  profile_completeness: number
  is_active: boolean
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  pending: 'warning',
  confirmed: 'default',
  in_progress: 'success',
  completed: 'secondary',
  cancelled: 'destructive',
  disputed: 'destructive',
}

export default function WorkerDashboard() {
  const { user, profile, isLoading: userLoading } = useUser()
  const { t } = useTranslation()
  const supabase = createClient()

  const [workerProfile, setWorkerProfile] = useState<WorkerProfileData | null>(null)
  const [upcomingBookings, setUpcomingBookings] = useState<DashboardBooking[]>([])
  const [pendingBookings, setPendingBookings] = useState<DashboardBooking[]>([])
  const [totalBookings, setTotalBookings] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return

      // Get worker profile
      const { data: wp } = await supabase
        .from('worker_profiles')
        .select('id, bio, hourly_rate, overall_rating, total_reviews, profile_completeness, is_active')
        .eq('user_id', user.id)
        .single()

      if (!wp) {
        setIsLoading(false)
        return
      }
      setWorkerProfile(wp)

      // Get total bookings count
      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('worker_id', user.id)
        .in('status', ['confirmed', 'in_progress', 'completed'])

      setTotalBookings(count || 0)

      // Get upcoming bookings (confirmed/in_progress)
      const today = new Date().toISOString().split('T')[0]
      const { data: upcoming } = await supabase
        .from('bookings')
        .select('id, status, scheduled_date, scheduled_start_time, scheduled_end_time, estimated_cost, profiles!client_id(full_name, avatar_url), services(name)')
        .eq('worker_id', user.id)
        .in('status', ['confirmed', 'in_progress'])
        .gte('scheduled_date', today)
        .order('scheduled_date', { ascending: true })
        .limit(5)

      if (upcoming) setUpcomingBookings(upcoming as unknown as DashboardBooking[])

      // Get pending bookings (requests)
      const { data: pending } = await supabase
        .from('bookings')
        .select('id, status, scheduled_date, scheduled_start_time, scheduled_end_time, estimated_cost, profiles!client_id(full_name, avatar_url), services(name)')
        .eq('worker_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5)

      if (pending) setPendingBookings(pending as unknown as DashboardBooking[])

      setIsLoading(false)
    }

    if (!userLoading) loadDashboard()
  }, [user, userLoading, supabase])

  const handleBookingAction = async (bookingId: string, action: 'confirmed' | 'cancelled') => {
    setActionLoading(bookingId)
    try {
      await supabase
        .from('bookings')
        .update({ status: action })
        .eq('id', bookingId)

      // Get the booking to find client_id for notification
      const booking = pendingBookings.find(b => b.id === bookingId)
      if (booking) {
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
      }

      // Move from pending to upcoming if confirmed
      if (action === 'confirmed') {
        const moved = pendingBookings.find(b => b.id === bookingId)
        if (moved) {
          setUpcomingBookings(prev => [{ ...moved, status: 'confirmed' }, ...prev])
        }
      }
      setPendingBookings(prev => prev.filter(b => b.id !== bookingId))
    } catch (err) {
      console.error('Failed to update booking:', err)
    } finally {
      setActionLoading(null)
    }
  }

  if (userLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-full rounded-full" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-6 w-40" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    )
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const completeness = workerProfile?.profile_completeness || 0

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold">Welcome back, {firstName}!</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here&apos;s your work overview
        </p>
      </motion.div>

      {/* Profile Completeness */}
      {completeness < 100 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Profile {completeness}% complete</span>
                <Link href="/worker-profile/edit" className="text-xs text-emerald-600 font-medium">
                  Complete Profile
                </Link>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>
              {completeness < 50 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Complete your profile to appear in search results and get more bookings.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        <Card className="overflow-hidden">
          <CardContent className="p-4 text-center relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <div className="w-10 h-10 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-2">
              <Briefcase className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold">{totalBookings}</p>
            <p className="text-xs text-muted-foreground">{t('nav.bookings', 'Bookings')}</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-4 text-center relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <div className="w-10 h-10 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-2">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold">
              {workerProfile?.overall_rating?.toFixed(1) || '0.0'}
            </p>
            <p className="text-xs text-muted-foreground">{t('worker.rating', 'Rating')}</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-4 text-center relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-blue-500" />
            <div className="w-10 h-10 mx-auto bg-sky-50 rounded-full flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-sky-600" />
            </div>
            <p className="text-2xl font-bold">{workerProfile?.total_reviews || 0}</p>
            <p className="text-xs text-muted-foreground">{t('worker.reviews', 'Reviews')}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="grid grid-cols-2 gap-3"
      >
        <Link href="/worker-calendar">
          <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="font-medium text-sm">{t('nav.calendar', 'View Calendar')}</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/worker-profile/edit">
          <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <span className="font-medium text-sm">{t('worker.edit_profile', 'Edit Profile')}</span>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      {/* New Booking Requests */}
      {pendingBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-lg">New Requests</h2>
              <Badge variant="warning">{pendingBookings.length}</Badge>
            </div>
            <Link href="/worker-bookings" className="text-sm text-emerald-600 font-medium flex items-center">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {pendingBookings.map(booking => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{booking.profiles.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.services.name} &middot; {new Date(booking.scheduled_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.scheduled_start_time?.slice(0, 5)} - {booking.scheduled_end_time?.slice(0, 5)}
                        {booking.estimated_cost && ` \u00B7 R${booking.estimated_cost}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      disabled={actionLoading === booking.id}
                      onClick={() => handleBookingAction(booking.id, 'cancelled')}
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
                      className="flex-1"
                      disabled={actionLoading === booking.id}
                      onClick={() => handleBookingAction(booking.id, 'confirmed')}
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
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Upcoming Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Upcoming Bookings</h2>
          <Link href="/worker-bookings" className="text-sm text-emerald-600 font-medium flex items-center">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {upcomingBookings.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <ClipboardList className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No upcoming bookings</p>
              <p className="text-xs text-muted-foreground mt-1">
                New booking requests will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {upcomingBookings.map(booking => (
              <Link key={booking.id} href={`/worker-bookings/${booking.id}`}>
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{booking.profiles.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.services.name} &middot; {new Date(booking.scheduled_date).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.scheduled_start_time?.slice(0, 5)} - {booking.scheduled_end_time?.slice(0, 5)}
                      </p>
                    </div>
                    <Badge variant={statusVariant[booking.status] || 'outline'}>
                      {booking.status.replace('_', ' ')}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
