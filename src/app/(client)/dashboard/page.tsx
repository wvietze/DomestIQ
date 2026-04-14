'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { useOnboarding } from '@/lib/hooks/use-onboarding'
import { useTranslation } from '@/lib/hooks/use-translation'
import { Skeleton } from '@/components/ui/skeleton'
import type { Notification } from '@/lib/types'
import { PushPrompt } from '@/components/shared/push-prompt'
import { DashboardAd } from '@/components/shared/dashboard-ad'

interface DashboardBooking {
  id: string
  status: string
  scheduled_date: string
  start_time: string
  profiles: { full_name: string; avatar_url: string | null }
  services: { name: string }
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
}

const statusDotColors: Record<string, string> = {
  pending: 'bg-[#fe932c]',
  accepted: 'bg-[#005d42]',
  confirmed: 'bg-[#005d42]',
  in_progress: 'bg-[#047857]',
  completed: 'bg-[#6e7a73]',
}

function getGreeting(): { text: string; icon: string } {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'Good morning', icon: 'light_mode' }
  if (hour < 18) return { text: 'Good afternoon', icon: 'wb_sunny' }
  return { text: 'Good evening', icon: 'dark_mode' }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatBookingDate(dateStr: string, timeStr: string): string {
  const bookingDate = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const bookingDay = new Date(
    bookingDate.getFullYear(),
    bookingDate.getMonth(),
    bookingDate.getDate()
  )

  let timeLabel = ''
  if (timeStr) {
    const [h, m] = timeStr.split(':').map(Number)
    const period = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 || 12
    timeLabel = `, ${hour12}:${String(m).padStart(2, '0')} ${period}`
  }

  if (bookingDay.getTime() === today.getTime()) return `Today${timeLabel}`
  if (bookingDay.getTime() === tomorrow.getTime()) return `Tomorrow${timeLabel}`

  const diffDays = Math.floor(
    (bookingDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (diffDays > 0 && diffDays <= 6) {
    const dayName = bookingDate.toLocaleDateString(undefined, { weekday: 'short' })
    const monthDay = bookingDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
    return `${dayName}, ${monthDay}${timeLabel}`
  }

  const full = bookingDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
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

function getNotificationIcon(type: string): { icon: string; bg: string; color: string } {
  switch (type) {
    case 'booking_request':
    case 'booking_reminder':
      return { icon: 'calendar_today', bg: 'bg-[#97f5cc]', color: 'text-[#005d42]' }
    case 'booking_accepted':
    case 'booking_confirmed':
    case 'booking_completed':
      return { icon: 'check_circle', bg: 'bg-[#97f5cc]', color: 'text-[#005d42]' }
    case 'booking_cancelled':
    case 'booking_declined':
      return { icon: 'cancel', bg: 'bg-[#ffdad6]', color: 'text-[#ba1a1a]' }
    case 'new_message':
      return { icon: 'mail', bg: 'bg-[#e2e3e1]', color: 'text-[#1a1c1b]' }
    case 'new_review':
      return { icon: 'star', bg: 'bg-[#ffdcc3]', color: 'text-[#904d00]' }
    default:
      return { icon: 'notifications', bg: 'bg-[#e2e3e1]', color: 'text-[#3e4943]' }
  }
}

export default function ClientDashboard() {
  const { user, profile, isLoading: userLoading } = useUser()
  const { needsOnboarding, checked: onboardingChecked } = useOnboarding()
  const { t } = useTranslation()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (onboardingChecked && needsOnboarding) {
      router.replace('/onboarding')
    }
  }, [onboardingChecked, needsOnboarding, router])

  const [bookings, setBookings] = useState<DashboardBooking[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [activeBookingsCount, setActiveBookingsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return

      try {
        const { data: bookingData } = await supabase
          .from('bookings')
          .select(
            'id, status, scheduled_date, start_time, profiles!worker_id(full_name, avatar_url), services(name)'
          )
          .eq('client_id', user.id)
          .in('status', ['pending', 'accepted', 'confirmed', 'in_progress'])
          .order('scheduled_date', { ascending: true })
          .limit(5)

        if (bookingData) setBookings(bookingData as unknown as DashboardBooking[])

        const { data: convos } = await supabase
          .from('conversations')
          .select('id')
          .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        const conversationIds = (convos || []).map((c: { id: string }) => c.id)
        if (conversationIds.length > 0) {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('conversation_id', conversationIds)
            .neq('sender_id', user.id)
            .eq('is_read', false)
          setUnreadMessages(count || 0)
        } else {
          setUnreadMessages(0)
        }

        const { count: favCount } = await supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
        setFavoritesCount(favCount || 0)

        const { count: activeCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', user.id)
          .in('status', ['pending', 'accepted', 'confirmed', 'in_progress'])
        setActiveBookingsCount(activeCount || 0)

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

  /* ── Loading skeleton ── */
  if (userLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-12 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Skeleton className="lg:col-span-7 h-72 rounded-xl" />
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const greeting = getGreeting()
  const nextBooking = bookings[0] ?? null
  const remainingBookings = bookings.slice(1)

  return (
    <div className="max-w-7xl mx-auto px-6 pt-8 pb-12">
      {/* ── Welcome Section ── */}
      <section className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-heading text-[#1a1c1b]">
                {greeting.text}, {firstName}
              </h1>
              <span className="material-symbols-outlined text-[#904d00] text-3xl">
                {greeting.icon}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Push Notification Prompt ── */}
      <PushPrompt />

      {/* ── Stats Row ── */}
      <section className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#f4f4f2] p-4 rounded-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#047857] text-white flex items-center justify-center">
            <span className="material-symbols-outlined">calendar_today</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#005d42] leading-none">
              {activeBookingsCount}
            </p>
            <p className="text-xs font-medium text-[#3e4943] uppercase tracking-widest mt-1">
              {t('dashboard.active_bookings', 'Active Bookings')}
            </p>
          </div>
        </div>
        <div className="bg-[#f4f4f2] p-4 rounded-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#904d00] text-white flex items-center justify-center">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#904d00] leading-none">
              {favoritesCount}
            </p>
            <p className="text-xs font-medium text-[#3e4943] uppercase tracking-widest mt-1">
              {t('dashboard.favorites', 'Favorites')}
            </p>
          </div>
        </div>
        <div className="bg-[#f4f4f2] p-4 rounded-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#6e7a73] text-white flex items-center justify-center">
            <span className="material-symbols-outlined">chat_bubble</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#1a1c1b] leading-none">
              {unreadMessages}
            </p>
            <p className="text-xs font-medium text-[#3e4943] uppercase tracking-widest mt-1">
              {t('dashboard.unread_messages', 'Unread Messages')}
            </p>
          </div>
        </div>
      </section>

      {/* ── Bento Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Hero Featured Card (Next Booking) ── */}
        <div className="lg:col-span-7">
          {nextBooking ? (
            <div className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#005d42]" />
              {nextBooking.profiles.avatar_url ? (
                <div className="w-full md:w-2/5 h-64 md:h-auto overflow-hidden">
                  <Image
                    src={nextBooking.profiles.avatar_url}
                    alt={nextBooking.profiles.full_name}
                    width={400}
                    height={400}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full md:w-2/5 h-64 md:h-auto bg-[#e8e8e6] flex items-center justify-center">
                  <span className="text-4xl font-bold text-[#005d42]">
                    {getInitials(nextBooking.profiles.full_name)}
                  </span>
                </div>
              )}
              <div className="p-8 flex flex-col justify-between flex-1">
                <div>
                  <span className="bg-[#97f5cc] text-[#00513a] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 inline-block">
                    {t('dashboard.next_booking', 'Next Booking')}
                  </span>
                  <h2 className="text-2xl font-bold text-[#1a1c1b] font-heading mb-1">
                    {nextBooking.profiles.full_name}
                  </h2>
                  <p className="text-[#005d42] font-medium mb-6">
                    {nextBooking.services.name}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[#3e4943]">
                      <span className="material-symbols-outlined text-[#005d42] text-xl">
                        event
                      </span>
                      <span className="text-sm font-medium">
                        {formatBookingDate(
                          nextBooking.scheduled_date,
                          nextBooking.start_time
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[#3e4943]">
                      <span className="material-symbols-outlined text-[#005d42] text-xl">
                        info
                      </span>
                      <span className="text-sm font-medium flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${statusDotColors[nextBooking.status] || 'bg-[#6e7a73]'}`}
                        />
                        {statusLabels[nextBooking.status] ??
                          nextBooking.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex gap-3">
                  <Link
                    href={`/bookings/${nextBooking.id}`}
                    className="flex-1 bg-[#005d42] text-white py-3 rounded-lg font-bold text-center transition-transform active:scale-[0.98]"
                  >
                    {t('dashboard.view_details', 'View Details')}
                  </Link>
                  <Link
                    href={`/messages?with=${nextBooking.profiles.full_name}`}
                    className="w-12 h-12 flex items-center justify-center bg-[#e2e3e1] text-[#1a1c1b] rounded-lg transition-colors hover:bg-[#bdc9c1]"
                  >
                    <span className="material-symbols-outlined">chat</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center text-center h-full min-h-[280px]">
              <span className="material-symbols-outlined text-5xl text-[#bdc9c1] mb-4">
                calendar_today
              </span>
              <p className="text-[#3e4943] font-medium mb-4">
                {t('dashboard.no_bookings', 'No upcoming bookings')}
              </p>
              <Link
                href="/search"
                className="bg-[#005d42] text-white px-6 py-3 rounded-lg font-bold transition-transform active:scale-[0.98]"
              >
                {t('dashboard.find_worker', 'Find a Worker')}
              </Link>
            </div>
          )}
        </div>

        {/* ── Quick Actions ── */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          <Link
            href="/search"
            className="bg-white p-6 rounded-xl flex flex-col items-start gap-4 transition-all hover:bg-[#eeeeec] hover:-translate-y-0.5 shadow-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-[#97f5cc] text-[#005d42] flex items-center justify-center">
              <span className="material-symbols-outlined">search</span>
            </div>
            <span className="font-bold text-sm tracking-tight text-[#1a1c1b]">
              {t('dashboard.find_worker', 'Find a Worker')}
            </span>
          </Link>
          <Link
            href="/bookings"
            className="bg-white p-6 rounded-xl flex flex-col items-start gap-4 transition-all hover:bg-[#eeeeec] hover:-translate-y-0.5 shadow-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-[#ffdcc3] text-[#904d00] flex items-center justify-center">
              <span className="material-symbols-outlined">history</span>
            </div>
            <span className="font-bold text-sm tracking-tight text-[#1a1c1b]">
              {t('dashboard.my_bookings', 'My Bookings')}
            </span>
          </Link>
          <Link
            href="/messages"
            className="bg-white p-6 rounded-xl flex flex-col items-start gap-4 transition-all hover:bg-[#eeeeec] hover:-translate-y-0.5 shadow-sm relative"
          >
            <div className="w-10 h-10 rounded-lg bg-[#e2e3e1] text-[#1a1c1b] flex items-center justify-center">
              <span className="material-symbols-outlined">forum</span>
            </div>
            <span className="font-bold text-sm tracking-tight text-[#1a1c1b]">
              {t('dashboard.messages', 'Messages')}
            </span>
            {unreadMessages > 0 && (
              <span className="absolute top-3 right-3 flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-[#ba1a1a] text-white text-[10px] font-bold">
                {unreadMessages > 99 ? '99+' : unreadMessages}
              </span>
            )}
          </Link>
          <Link
            href="/help"
            className="bg-white p-6 rounded-xl flex flex-col items-start gap-4 transition-all hover:bg-[#eeeeec] hover:-translate-y-0.5 shadow-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-[#bdc9c1] text-[#3e4943] flex items-center justify-center">
              <span className="material-symbols-outlined">help</span>
            </div>
            <span className="font-bold text-sm tracking-tight text-[#1a1c1b]">
              {t('dashboard.help_center', 'Help Center')}
            </span>
          </Link>
        </div>

        {/* ── Dashboard Ad ── */}
        <div className="lg:col-span-12">
          <DashboardAd placement="client_dashboard" role="client" />
        </div>

        {/* ── Upcoming Bookings (remaining) ── */}
        {remainingBookings.length > 0 && (
          <div className="lg:col-span-12 mt-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold font-heading text-[#1a1c1b]">
                {t('dashboard.upcoming_bookings', 'Upcoming Bookings')}
              </h3>
              <Link
                href="/bookings"
                className="text-sm text-[#005d42] font-semibold flex items-center gap-0.5 transition-colors hover:text-[#047857]"
              >
                {t('dashboard.view_all', 'View All')}
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </Link>
            </div>
            <div className="bg-[#f4f4f2] rounded-xl p-2 space-y-2">
              {remainingBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/bookings/${booking.id}`}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg transition-colors hover:bg-[#f9f9f7]"
                >
                  <div className="w-10 h-10 rounded-full bg-[#e8e8e6] flex items-center justify-center shrink-0 overflow-hidden">
                    {booking.profiles.avatar_url ? (
                      <Image
                        src={booking.profiles.avatar_url}
                        alt={booking.profiles.full_name}
                        width={40}
                        height={40}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-[#005d42]">
                        {getInitials(booking.profiles.full_name)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1a1c1b] font-semibold text-sm truncate">
                      {booking.profiles.full_name}
                    </p>
                    <p className="text-[#3e4943] text-xs mt-0.5">
                      {booking.services.name} &middot;{' '}
                      {formatBookingDate(booking.scheduled_date, booking.start_time)}
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-[#3e4943]">
                    <span
                      className={`w-2 h-2 rounded-full ${statusDotColors[booking.status] || 'bg-[#6e7a73]'}`}
                    />
                    {statusLabels[booking.status] ?? booking.status.replace('_', ' ')}
                  </span>
                  <span className="material-symbols-outlined text-[#6e7a73]">
                    chevron_right
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Recent Activity ── */}
        <div className="lg:col-span-12 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold font-heading text-[#1a1c1b]">
              {t('dashboard.recent_activity', 'Recent Activity')}
            </h3>
            <Link
              href="/notifications"
              className="text-sm text-[#005d42] font-semibold flex items-center gap-0.5 transition-colors hover:text-[#047857]"
            >
              {t('dashboard.view_all', 'View All')}
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </Link>
          </div>

          {notifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center">
              <span className="material-symbols-outlined text-4xl text-[#bdc9c1] mb-3 block">
                notifications
              </span>
              <p className="text-sm text-[#3e4943]">
                {t(
                  'dashboard.no_activity',
                  'No recent activity. Notifications will show up here.'
                )}
              </p>
            </div>
          ) : (
            <div className="bg-[#f4f4f2] rounded-xl p-2 space-y-2">
              {notifications.map((notification) => {
                const iconCfg = getNotificationIcon(notification.type)
                return (
                  <button
                    key={notification.id}
                    onClick={() =>
                      router.push(notification.action_url || '/notifications')
                    }
                    className={`w-full text-left flex items-center gap-6 p-6 rounded-lg transition-colors ${
                      !notification.is_read
                        ? 'bg-white shadow-sm'
                        : 'bg-white hover:bg-[#f9f9f7]'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconCfg.bg}`}
                    >
                      <span
                        className={`material-symbols-outlined ${iconCfg.color}`}
                        style={
                          notification.type === 'new_review'
                            ? { fontVariationSettings: "'FILL' 1" }
                            : undefined
                        }
                      >
                        {iconCfg.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          !notification.is_read
                            ? 'font-semibold text-[#1a1c1b]'
                            : 'font-medium text-[#3e4943]'
                        }`}
                      >
                        {notification.title}
                      </p>
                      {notification.body && (
                        <p className="text-xs text-[#3e4943] mt-0.5 line-clamp-1">
                          {notification.body}
                        </p>
                      )}
                      <p className="text-[11px] text-[#6e7a73] mt-1">
                        {timeAgo(notification.created_at)}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#005d42] shrink-0" />
                    )}
                    <span className="material-symbols-outlined text-[#6e7a73]">
                      chevron_right
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
