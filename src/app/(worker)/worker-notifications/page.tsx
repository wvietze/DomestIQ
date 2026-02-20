'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Star,
  DollarSign,
  ShieldCheck,
  CheckCheck,
} from 'lucide-react'
import type { Notification } from '@/lib/types'

// ---------------------------------------------------------------------------
// Notification type icon mapping
// ---------------------------------------------------------------------------

interface IconConfig {
  icon: React.ComponentType<{ className?: string }>
  bgColor: string
  iconColor: string
}

const notificationIconMap: Record<string, IconConfig> = {
  booking_request: {
    icon: CalendarDays,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  new_booking: {
    icon: CalendarDays,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  booking_accepted: {
    icon: CheckCircle2,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  booking_confirmed: {
    icon: CheckCircle2,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  booking_cancelled: {
    icon: XCircle,
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  booking_declined: {
    icon: XCircle,
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  booking_completed: {
    icon: CheckCircle2,
    bgColor: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  booking_reminder: {
    icon: CalendarDays,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  new_message: {
    icon: MessageSquare,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  new_review: {
    icon: Star,
    bgColor: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  payment_received: {
    icon: DollarSign,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  document_verified: {
    icon: ShieldCheck,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  verification_approved: {
    icon: ShieldCheck,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  verification_rejected: {
    icon: XCircle,
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  system_alert: {
    icon: Bell,
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-600',
  },
}

const defaultIconConfig: IconConfig = {
  icon: Bell,
  bgColor: 'bg-gray-100',
  iconColor: 'text-gray-500',
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
      <div className="max-w-2xl mx-auto space-y-6 p-4 pt-16">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardContent>
            </Card>
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
    <div className="max-w-2xl mx-auto space-y-6 p-4 pt-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
        {hasUnread && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={markingAll}
            className="gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            {markingAll ? 'Marking...' : 'Mark all as read'}
          </Button>
        )}
      </div>

      {/* Empty state */}
      {notifications.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-1">
              No notifications
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              When you receive booking requests, messages, or reviews, they
              will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Notification groups */}
      {grouped.map((group) => (
        <div key={group.label}>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {group.label}
            </h2>
            <Separator className="flex-1" />
          </div>

          <div className="space-y-2">
            {group.items.map((notification) => {
              const iconConfig = getIconConfig(notification.type)
              const Icon = iconConfig.icon

              return (
                <Card
                  key={notification.id}
                  className={cn(
                    'cursor-pointer hover:shadow-md transition-shadow',
                    !notification.is_read && 'border-emerald-200 bg-emerald-50/30'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    {/* Type icon */}
                    <div
                      className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
                        iconConfig.bgColor
                      )}
                    >
                      <Icon className={cn('h-5 w-5', iconConfig.iconColor)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            'text-sm leading-snug',
                            !notification.is_read
                              ? 'font-semibold text-gray-900'
                              : 'font-medium text-gray-700'
                          )}
                        >
                          {notification.title}
                        </p>
                        {/* Unread dot */}
                        {!notification.is_read && (
                          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                        )}
                      </div>
                      {notification.body && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.body}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1.5">
                        {formatTimestamp(notification.created_at)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
