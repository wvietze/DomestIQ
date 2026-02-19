'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search, CalendarDays, MessageSquare, Star,
  Clock, MapPin, ChevronRight, TrendingUp
} from 'lucide-react'

interface DashboardBooking {
  id: string
  status: string
  scheduled_date: string
  start_time: string
  profiles: { full_name: string }
  services: { name: string }
}

const statusColors: Record<string, string> = {
  pending: 'warning',
  accepted: 'default',
  confirmed: 'default',
  in_progress: 'success',
  completed: 'secondary',
}

export default function ClientDashboard() {
  const { profile, isLoading: userLoading } = useUser()
  const supabase = createClient()
  const [bookings, setBookings] = useState<DashboardBooking[]>([])
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: bookingData } = await supabase
        .from('bookings')
        .select('id, status, scheduled_date, start_time, profiles!worker_id(full_name), services(name)')
        .eq('client_id', user.id)
        .in('status', ['pending', 'accepted', 'confirmed', 'in_progress'])
        .order('scheduled_date', { ascending: true })
        .limit(5)

      if (bookingData) setBookings(bookingData as unknown as DashboardBooking[])

      // Count unread messages
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .neq('sender_id', user.id)
        .eq('is_read', false)

      setUnreadMessages(count || 0)
      setIsLoading(false)
    }

    loadDashboard()
  }, [supabase])

  if (userLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Hello, {profile?.full_name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-muted-foreground">What do you need help with today?</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/search">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <span className="font-medium text-sm">Find Workers</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/bookings">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-secondary" />
              </div>
              <span className="font-medium text-sm">My Bookings</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/messages">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full relative">
            <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-accent-foreground" />
              </div>
              <span className="font-medium text-sm">Messages</span>
              {unreadMessages > 0 && (
                <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground">{unreadMessages}</Badge>
              )}
            </CardContent>
          </Card>
        </Link>
        <Link href="/reviews">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-500" />
              </div>
              <span className="font-medium text-sm">Reviews</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Upcoming Bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Upcoming Bookings</h2>
          <Link href="/bookings" className="text-sm text-primary font-medium flex items-center">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No upcoming bookings</p>
              <Button asChild className="mt-3">
                <Link href="/search">Find a Worker</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {bookings.map(booking => (
              <Link key={booking.id} href={`/bookings/${booking.id}`}>
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{booking.profiles.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.services.name} - {new Date(booking.scheduled_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={statusColors[booking.status] as 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' || 'outline'}>
                      {booking.status.replace('_', ' ')}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
