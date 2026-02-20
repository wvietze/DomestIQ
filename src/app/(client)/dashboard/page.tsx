'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import {
  Search, CalendarDays, MessageSquare, Star,
  Clock, ChevronRight, Bell,
  CheckCircle2, XCircle, ArrowRight,
} from 'lucide-react'
import type { Notification } from '@/lib/types'

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }

interface DashboardBooking {
  id: string
  status: string
  scheduled_date: string
  start_time: string
  profiles: { full_name: string; avatar_url: string | null }
  services: { name: string }
}

const statusColors: Record<string, string> = {
  pending: 'warning', accepted: 'default', confirmed: 'default',
  in_progress: 'success', completed: 'secondary',
}
const statusLabels: Record<string, string> = {
  pending: 'Pending', accepted: 'Accepted', confirmed: 'Confirmed',
  in_progress: 'In Progress', completed: 'Completed',
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatBookingDate(dateStr: string, timeStr: string): string {
  const bookingDate = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
  const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate())

  let timeLabel = ''
  if (timeStr) {
    const [h, m] = timeStr.split(':').map(Number)
    const period = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 || 12
    timeLabel = ` at ${hour12}:${String(m).padStart(2, '0')} ${period}`
  }

  if (bookingDay.getTime() === today.getTime()) return `Today${timeLabel}`
  if (bookingDay.getTime() === tomorrow.getTime()) return `Tomorrow${timeLabel}`

  const diffDays = Math.floor((bookingDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays > 0 && diffDays <= 6) {
    const dayName = bookingDate.toLocaleDateString(undefined, { weekday: 'short' })
    const monthDay = bookingDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    return `${dayName}, ${monthDay}${timeLabel}`
  }

  const full = bookingDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
  return `${full}${timeLabel}`
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateString).toLocaleDateString()
}

interface IconConfig { icon: React.ComponentType<{ className?: string }>; bgColor: string; iconColor: string }

const notificationIconMap: Record<string, IconConfig> = {
  booking_request:   { icon: CalendarDays,  bgColor: 'bg-blue-100',    iconColor: 'text-blue-600' },
  booking_accepted:  { icon: CheckCircle2,  bgColor: 'bg-green-100',   iconColor: 'text-green-600' },
  booking_confirmed: { icon: CheckCircle2,  bgColor: 'bg-green-100',   iconColor: 'text-green-600' },
  booking_cancelled: { icon: XCircle,       bgColor: 'bg-red-100',     iconColor: 'text-red-600' },
  booking_declined:  { icon: XCircle,       bgColor: 'bg-red-100',     iconColor: 'text-red-600' },
  booking_completed: { icon: CheckCircle2,  bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  booking_reminder:  { icon: CalendarDays,  bgColor: 'bg-blue-100',    iconColor: 'text-blue-600' },
  new_message:       { icon: MessageSquare, bgColor: 'bg-blue-100',    iconColor: 'text-blue-600' },
  new_review:        { icon: Star,          bgColor: 'bg-amber-100',   iconColor: 'text-amber-600' },
  system_alert:      { icon: Bell,          bgColor: 'bg-gray-100',    iconColor: 'text-gray-600' },
}

const defaultIconConfig: IconConfig = { icon: Bell, bgColor: 'bg-gray-100', iconColor: 'text-gray-500' }
function getIconConfig(type: string): IconConfig { return notificationIconMap[type] ?? defaultIconConfig }

export default function ClientDashboard() {
  const { user, profile, isLoading: userLoading } = useUser()
  const router = useRouter()
  const supabase = createClient()
  const [bookings, setBookings] = useState<DashboardBooking[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return

      try {
        const { data: bookingData } = await supabase
          .from('bookings')
          .select('id, status, scheduled_date, start_time, profiles!worker_id(full_name, avatar_url), services(name)')
          .eq('client_id', user.id)
          .in('status', ['pending', 'accepted', 'confirmed', 'in_progress'])
          .order('scheduled_date', { ascending: true })
          .limit(5)

        if (bookingData) setBookings(bookingData as unknown as DashboardBooking[])

        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .neq('sender_id', user.id)
          .eq('is_read', false)
        setUnreadMessages(count || 0)

        const { data: notifData } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
        if (notifData) setNotifications(notifData as Notification[])
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (!userLoading) loadDashboard()
  }, [user, userLoading, supabase])

  if (userLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="space-y-2"><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-48" /></div>
        <Skeleton className="h-44 rounded-2xl" />
        <div className="grid grid-cols-4 gap-3">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        <div className="space-y-2"><Skeleton className="h-5 w-40" />{[1, 2].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      </div>
    )
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const nextBooking = bookings[0] ?? null
  const remainingBookings = bookings.slice(1)

  const quickActions = [
    { href: '/search', icon: Search, label: 'Find a Worker', bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { href: '/bookings', icon: CalendarDays, label: 'My Bookings', bg: 'bg-blue-50', color: 'text-blue-600' },
    { href: '/messages', icon: MessageSquare, label: 'Messages', bg: 'bg-violet-50', color: 'text-violet-600', badge: unreadMessages },
    { href: '/reviews', icon: Star, label: 'My Reviews', bg: 'bg-amber-50', color: 'text-amber-500' },
  ]

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl mx-auto p-4 space-y-6">

      {/* Greeting */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold tracking-tight">{getGreeting()}, {firstName}!</h1>
        <p className="text-muted-foreground mt-0.5">What do you need help with today?</p>
      </motion.div>

      {/* Next Booking Hero */}
      {nextBooking && (
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
          <Card className="overflow-hidden border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-background to-background">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-3">Next Booking</p>
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 border-2 border-emerald-100">
                  {nextBooking.profiles.avatar_url && <AvatarImage src={nextBooking.profiles.avatar_url} alt={nextBooking.profiles.full_name} />}
                  <AvatarFallback className="bg-emerald-50 text-emerald-700 font-semibold text-lg">
                    {getInitials(nextBooking.profiles.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base truncate">{nextBooking.profiles.full_name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{nextBooking.services.name}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Clock className="h-3.5 w-3.5 text-emerald-600" />
                      {formatBookingDate(nextBooking.scheduled_date, nextBooking.start_time)}
                    </span>
                    <Badge variant={(statusColors[nextBooking.status] as 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning') || 'outline'}>
                      {statusLabels[nextBooking.status] ?? nextBooking.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button asChild className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700" size="sm">
                <Link href={`/bookings/${nextBooking.id}`}>View Details <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="grid grid-cols-4 gap-3">
        {quickActions.map(action => {
          const Icon = action.icon
          return (
            <Link key={action.href} href={action.href}>
              <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer h-full relative">
                <CardContent className="p-3 flex flex-col items-center justify-center gap-1.5 text-center">
                  <div className={cn('w-11 h-11 rounded-full flex items-center justify-center', action.bg)}>
                    <Icon className={cn('w-5 h-5', action.color)} />
                  </div>
                  <span className="font-medium text-xs leading-tight">{action.label}</span>
                  {action.badge && action.badge > 0 ? (
                    <span className="absolute top-1.5 right-1.5 flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                      {action.badge > 99 ? '99+' : action.badge}
                    </span>
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </motion.div>

      {/* Upcoming Bookings */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Upcoming Bookings</h2>
          <Link href="/bookings" className="text-sm text-emerald-600 font-medium flex items-center">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <CalendarDays className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-muted-foreground">No upcoming bookings</p>
              <Button asChild className="mt-3 bg-gradient-to-r from-emerald-600 to-teal-600" size="sm">
                <Link href="/search">Find a Worker</Link>
              </Button>
            </CardContent>
          </Card>
        ) : remainingBookings.length === 0 ? (
          <Card>
            <CardContent className="p-5 text-center text-sm text-muted-foreground">
              No other upcoming bookings.{' '}
              <Link href="/search" className="text-emerald-600 font-medium hover:underline">Book another service</Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {remainingBookings.map((booking, i) => (
              <motion.div key={booking.id} variants={fadeUp} transition={{ duration: 0.3, delay: i * 0.05 }}>
                <Link href={`/bookings/${booking.id}`}>
                  <Card className="hover:shadow-sm hover:-translate-y-0.5 transition-all">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {booking.profiles.avatar_url && <AvatarImage src={booking.profiles.avatar_url} alt={booking.profiles.full_name} />}
                        <AvatarFallback className="bg-emerald-50 text-emerald-700 text-sm font-medium">
                          {getInitials(booking.profiles.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{booking.profiles.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.services.name} &middot; {formatBookingDate(booking.scheduled_date, booking.start_time)}
                        </p>
                      </div>
                      <Badge variant={(statusColors[booking.status] as 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning') || 'outline'}>
                        {statusLabels[booking.status] ?? booking.status.replace('_', ' ')}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Activity Feed */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Recent Activity</h2>
          <Link href="/notifications" className="text-sm text-emerald-600 font-medium flex items-center">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Bell className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recent activity. Notifications will show up here.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <CardContent className="p-0 divide-y">
              {notifications.map((notification) => {
                const iconConfig = getIconConfig(notification.type)
                const Icon = iconConfig.icon
                return (
                  <button key={notification.id}
                    onClick={() => router.push(notification.action_url || '/notifications')}
                    className={cn(
                      'w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-muted/50 transition-colors',
                      !notification.is_read && 'bg-emerald-50/30'
                    )}>
                    <div className={cn('h-9 w-9 rounded-full flex items-center justify-center shrink-0', iconConfig.bgColor)}>
                      <Icon className={cn('h-4 w-4', iconConfig.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm leading-snug', !notification.is_read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground')}>
                        {notification.title}
                      </p>
                      {notification.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{notification.body}</p>}
                      <p className="text-[11px] text-muted-foreground/70 mt-1">{timeAgo(notification.created_at)}</p>
                    </div>
                    {!notification.is_read && <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />}
                  </button>
                )
              })}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </motion.div>
  )
}
