'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import type { Notification } from '@/lib/types'

// ---------------------------------------------------------------------------
// Notification type -> Material Symbols icon mapping (Stitch design system)
// ---------------------------------------------------------------------------

interface IconConfig {
  icon: string
  tint: string
}

const notificationIconMap: Record<string, IconConfig> = {
  booking_request: { icon: 'event', tint: 'text-[#005d42]' },
  new_booking: { icon: 'event', tint: 'text-[#005d42]' },
  booking_accepted: { icon: 'bookmark', tint: 'text-[#005d42]' },
  booking_confirmed: { icon: 'check_circle', tint: 'text-[#005d42]' },
  booking_cancelled: { icon: 'cancel', tint: 'text-[#ba1a1a]' },
  booking_declined: { icon: 'cancel', tint: 'text-[#ba1a1a]' },
  booking_completed: { icon: 'task_alt', tint: 'text-[#005d42]' },
  booking_reminder: { icon: 'calendar_today', tint: 'text-[#005d42]' },
  new_message: { icon: 'chat', tint: 'text-[#005d42]' },
  new_review: { icon: 'star', tint: 'text-[#904d00]' },
  referral_joined: { icon: 'redeem', tint: 'text-[#904d00]' },
  payment_received: { icon: 'payments', tint: 'text-[#005d42]' },
  document_verified: { icon: 'verified', tint: 'text-[#005d42]' },
  verification_approved: { icon: 'shield', tint: 'text-[#005d42]' },
  verification_rejected: { icon: 'gpp_bad', tint: 'text-[#ba1a1a]' },
  system_alert: { icon: 'notifications', tint: 'text-[#3e4943]' },
}

const defaultIconConfig: IconConfig = {
  icon: 'notifications',
  tint: 'text-[#3e4943]',
}

function getIconConfig(type: string): IconConfig {
  return notificationIconMap[type] ?? defaultIconConfig
}

// ---------------------------------------------------------------------------
// Date grouping helpers
// ---------------------------------------------------------------------------

function getDateGroup(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const notifDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  )

  if (notifDate.getTime() === today.getTime()) return 'Today'
  if (notifDate.getTime() === yesterday.getTime()) return 'Yesterday'
  return 'Earlier'
}

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

function groupNotifications(
  notifications: Notification[]
): { label: string; items: Notification[] }[] {
  const groups: Record<string, Notification[]> = {}
  const order = ['Today', 'Yesterday', 'Earlier']

  for (const notif of notifications) {
    const group = getDateGroup(notif.created_at)
    if (!groups[group]) groups[group] = []
    groups[group].push(notif)
  }

  return order
    .filter((label) => groups[label]?.length)
    .map((label) => ({ label, items: groups[label] }))
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function WorkerNotificationsPage() {
  const router = useRouter()
  const { user, isLoading: userLoading } = useUser()
  const supabase = createClient()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  // ---- Fetch notifications -------------------------------------------------

  const fetchNotifications = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      setNotifications(data as Notification[])
    }
    setIsLoading(false)
  }, [supabase, user])

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchNotifications()
    }
  }, [user, fetchNotifications])

  // ---- Realtime subscription -----------------------------------------------

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`worker-notifications-page-${user.id}`)
      .on(
        'postgres_changes' as never,
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user, fetchNotifications])

  // ---- Actions -------------------------------------------------------------

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    )
  }

  const markAllAsRead = async () => {
    if (!user) return
    setMarkingAll(true)

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setMarkingAll(false)
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }
    if (notification.action_url) {
      router.push(notification.action_url)
    }
  }

  // ---- Loading skeleton ----------------------------------------------------

  if (userLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-16 pb-24 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-40 bg-[#e8e8e6] animate-pulse rounded-full" />
          <div className="h-6 w-24 bg-[#e8e8e6] animate-pulse rounded-full" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white shadow-sm flex items-center p-4 rounded-xl h-24"
            >
              <div className="mr-4 w-12 h-12 rounded-full bg-[#f4f4f2] animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-[#e8e8e6] animate-pulse rounded-full" />
                <div className="h-3 w-full bg-[#e8e8e6] animate-pulse rounded-full" />
                <div className="h-3 w-20 bg-[#e8e8e6] animate-pulse rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ---- Grouped data --------------------------------------------------------

  const grouped = groupNotifications(notifications)
  const hasUnread = notifications.some((n) => !n.is_read)

  // ---- Render --------------------------------------------------------------

  return (
    <div className="max-w-2xl mx-auto px-4 pt-16 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f4f4f2] flex items-center justify-center">
            <span
              className="material-symbols-outlined text-[#005d42]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              notifications
            </span>
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#1a1c1b]">
            Notifications
          </h1>
        </div>
        {hasUnread && (
          <button
            onClick={markAllAsRead}
            disabled={markingAll}
            className="text-sm text-[#005d42] font-bold active:scale-95 transition-all disabled:opacity-50"
          >
            {markingAll ? 'Marking...' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* Empty state */}
      {notifications.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center mt-8">
          <div className="relative inline-block mb-6">
            <span
              className="material-symbols-outlined text-[#bdc9c1]"
              style={{ fontSize: '72px' }}
            >
              notifications
            </span>
            <span
              className="material-symbols-outlined text-[#005d42] absolute -bottom-1 -right-1"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: '28px' }}
            >
              check_circle
            </span>
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#6e7a73] mb-2 block">
            All caught up
          </span>
          <h3 className="font-heading font-bold text-xl text-[#1a1c1b] mb-3 leading-tight">
            No notifications
          </h3>
          <p className="text-[#3e4943] text-sm max-w-xs mx-auto leading-relaxed">
            When you receive booking requests, messages, or reviews, they will
            appear here.
          </p>
        </div>
      )}

      {/* Notification groups */}
      {grouped.map((group) => (
        <div key={group.label} className="mt-6">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#6e7a73]">
              {group.label}
            </h2>
            <div className="flex-1 h-px bg-[#e8e8e6]" />
          </div>

          <div className="space-y-3">
            {group.items.map((notification) => {
              const iconConfig = getIconConfig(notification.type)
              const isUnread = !notification.is_read

              return (
                <button
                  type="button"
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left bg-white rounded-xl shadow-sm flex items-start p-4 relative overflow-hidden transition-all active:scale-[0.99] hover:shadow-md ${
                    isUnread ? '' : 'opacity-90'
                  }`}
                >
                  {isUnread && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#005d42]" />
                  )}

                  {/* Icon bubble */}
                  <div className="mr-4 flex-shrink-0 bg-[#f4f4f2] p-3 rounded-full">
                    <span
                      className={`material-symbols-outlined ${iconConfig.tint}`}
                      style={
                        isUnread
                          ? { fontVariationSettings: "'FILL' 1" }
                          : undefined
                      }
                    >
                      {iconConfig.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3
                        className={`text-sm truncate pr-2 ${
                          isUnread
                            ? 'font-bold text-[#1a1c1b]'
                            : 'font-semibold text-[#1a1c1b]'
                        }`}
                      >
                        {notification.title}
                      </h3>
                      {isUnread && (
                        <span className="w-2 h-2 bg-[#005d42] rounded-full mt-1.5 flex-shrink-0" />
                      )}
                    </div>
                    {notification.body && (
                      <p className="text-xs text-[#3e4943] font-medium mt-0.5 line-clamp-2">
                        {notification.body}
                      </p>
                    )}
                    <p className="text-[10px] text-[#6e7a73] mt-1.5 uppercase tracking-wider font-medium">
                      {formatTimestamp(notification.created_at)}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
