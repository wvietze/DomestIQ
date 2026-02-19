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
  Phone, FileText, DollarSign
} from 'lucide-react'
import { motion } from 'framer-motion'

interface BookingDetail {
  id: string
  client_id: string
  status: string
  scheduled_date: string
  scheduled_start_time: string
  scheduled_end_time: string
  actual_start_time: string | null
  actual_end_time: string | null
  location_address: string | null
  location_lat: number | null
  location_lng: number | null
  estimated_cost: number | null
  final_cost: number | null
  client_notes: string | null
  worker_notes: string | null
  profiles: { full_name: string; avatar_url: string | null; phone: string | null }
  services: { name: string; category: string }
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  pending: 'warning',
  confirmed: 'default',
  in_progress: 'success',
  completed: 'secondary',
  cancelled: 'destructive',
  disputed: 'destructive',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
}

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
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    async function loadBooking() {
      if (!user) return

      const { data } = await supabase
        .from('bookings')
        .select('id, client_id, status, scheduled_date, scheduled_start_time, scheduled_end_time, actual_start_time, actual_end_time, location_address, location_lat, location_lng, estimated_cost, final_cost, client_notes, worker_notes, profiles!client_id(full_name, avatar_url, phone), services(name, category)')
        .eq('id', id)
        .eq('worker_id', user.id)
        .single()

      if (data) setBooking(data as unknown as BookingDetail)
      setIsLoading(false)
    }

    if (!userLoading) loadBooking()
  }, [id, user, userLoading, supabase])

  const updateBookingStatus = async (newStatus: string) => {
    if (!booking) return
    setActionLoading(true)

    try {
      const updateData: Record<string, unknown> = { status: newStatus }
      if (newStatus === 'in_progress') {
        updateData.actual_start_time = new Date().toISOString()
      }
      if (newStatus === 'completed') {
        updateData.actual_end_time = new Date().toISOString()
      }

      await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', booking.id)

      // Create notification for client
      const titleMap: Record<string, string> = {
        confirmed: 'Booking Accepted',
        cancelled: 'Booking Declined',
        in_progress: 'Job Started',
        completed: 'Job Completed',
      }
      const bodyMap: Record<string, string> = {
        confirmed: `${profile?.full_name || 'Your worker'} has accepted your booking.`,
        cancelled: `${profile?.full_name || 'Your worker'} has declined your booking.`,
        in_progress: `${profile?.full_name || 'Your worker'} has started the job.`,
        completed: `${profile?.full_name || 'Your worker'} has completed the job. Please leave a review!`,
      }

      await supabase.from('notifications').insert({
        user_id: booking.client_id,
        title: titleMap[newStatus] || 'Booking Updated',
        body: bodyMap[newStatus] || 'Your booking status has been updated.',
        type: 'booking',
        channel: 'in_app',
        data: { booking_id: booking.id },
      })

      setBooking(prev => prev ? { ...prev, status: newStatus, ...updateData } : null)
    } catch (err) {
      console.error('Failed to update booking status:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const getDirectionsUrl = () => {
    if (booking?.location_lat && booking?.location_lng) {
      return `https://www.google.com/maps/dir/?api=1&destination=${booking.location_lat},${booking.location_lng}`
    }
    if (booking?.location_address) {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.location_address)}`
    }
    return null
  }

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
      </div>
    )
  }

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
            <p className="text-muted-foreground">This booking could not be found or you do not have access to it.</p>
            <Button asChild className="mt-4">
              <a href="/worker-bookings">Back to Bookings</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const clientInitials = booking.profiles.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)

  const directionsUrl = getDirectionsUrl()
  const showAddress = ['confirmed', 'in_progress', 'completed'].includes(booking.status)

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold">Booking Details</h1>
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
              <p className="font-semibold text-lg">{statusLabels[booking.status] || booking.status}</p>
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
              <div className="flex-1">
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
                  <p className="text-sm font-medium">
                    {new Date(booking.scheduled_date).toLocaleDateString('en-ZA', {
                      weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="text-sm font-medium">
                    {booking.scheduled_start_time?.slice(0, 5)} - {booking.scheduled_end_time?.slice(0, 5)}
                  </p>
                </div>
              </div>
            </div>

            {(booking.estimated_cost || booking.final_cost) && (
              <>
                <Separator />
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {booking.final_cost ? 'Final Amount' : 'Estimated Amount'}
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      R{booking.final_cost || booking.estimated_cost}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Address - only shown for confirmed or later */}
      {showAddress && booking.location_address && (
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
              <p className="text-sm">{booking.location_address}</p>
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

      {/* Instructions */}
      {(booking.client_notes || booking.worker_notes) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {booking.client_notes && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Client Notes</p>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{booking.client_notes}</p>
                </div>
              )}
              {booking.worker_notes && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Your Notes</p>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{booking.worker_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t"
      >
        <div className="max-w-2xl mx-auto">
          {booking.status === 'pending' && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12"
                disabled={actionLoading}
                onClick={() => updateBookingStatus('cancelled')}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline
                  </>
                )}
              </Button>
              <Button
                className="flex-1 h-12"
                disabled={actionLoading}
                onClick={() => updateBookingStatus('confirmed')}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Accept
                  </>
                )}
              </Button>
            </div>
          )}

          {booking.status === 'confirmed' && (
            <Button
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
              disabled={actionLoading}
              onClick={() => updateBookingStatus('in_progress')}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Job
                </>
              )}
            </Button>
          )}

          {booking.status === 'in_progress' && (
            <Button
              className="w-full h-12"
              disabled={actionLoading}
              onClick={() => updateBookingStatus('completed')}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <Flag className="w-4 h-4 mr-2" />
                  Complete Job
                </>
              )}
            </Button>
          )}

          {(booking.status === 'completed' || booking.status === 'cancelled') && (
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => router.push('/worker-bookings')}
            >
              Back to Bookings
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
