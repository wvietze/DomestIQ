'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Notification } from '@/lib/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface NotificationBellProps {
  userId: string
  /** Where the "View all notifications" link navigates to. Defaults to /notifications. */
  notificationsHref?: string
}

export function NotificationBell({ userId, notificationsHref = '/notifications' }: NotificationBellProps) {
  const router = useRouter()
  const supabase = createClient()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // ---- Fetch recent notifications ------------------------------------------

  const fetchNotifications = useCallback(async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!error && data) {
      setNotifications(data as Notification[])
    }
    setIsLoading(false)
  }, [supabase, userId])

  const fetchUnreadCount = useCallback(async () => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    setUnreadCount(count ?? 0)
  }, [supabase, userId])

  // ---- Initial load --------------------------------------------------------

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications()
    fetchUnreadCount()
  }, [fetchNotifications, fetchUnreadCount])

  // ---- Realtime subscription -----------------------------------------------

  useEffect(() => {
    const channel = supabase
      .channel(`notifications-bell-${userId}`)
      .on(
        'postgres_changes' as never,
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Re-fetch on any change to keep the list accurate
          fetchNotifications()
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId, fetchNotifications, fetchUnreadCount])

  // ---- Click-outside handler -----------------------------------------------

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // ---- Actions -------------------------------------------------------------

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }
    setIsOpen(false)
    if (notification.action_url) {
      router.push(notification.action_url)
    }
  }

  // ---- Badge text ----------------------------------------------------------

  const badgeText = unreadCount >= 10 ? `${unreadCount}` : null
  const showBadge = unreadCount > 0

  // ---- Render --------------------------------------------------------------

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <span className="material-symbols-outlined text-xl">notifications</span>
        {showBadge && (
          <span
            className={cn(
              'absolute flex items-center justify-center rounded-full bg-[#ba1a1a] text-white font-bold',
              badgeText
                ? 'top-0 right-0 h-5 min-w-5 px-1 text-[10px]'
                : 'top-1 right-1 h-2.5 w-2.5'
            )}
          >
            {badgeText}
          </span>
        )}
      </Button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#bdc9c1] z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e8e6]">
            <h3 className="font-semibold text-sm text-[#1a1c1b]">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[#005d42] hover:underline font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#eeeeec] mt-1.5 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-3/4 rounded bg-[#eeeeec]" />
                      <div className="h-3 w-full rounded bg-[#eeeeec]" />
                      <div className="h-2.5 w-16 rounded bg-[#eeeeec]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-[#bdc9c1] mb-2 block">notifications</span>
                <p className="text-sm text-[#3e4943]">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    'w-full text-left px-4 py-3 flex gap-3 hover:bg-[#f4f4f2] transition-colors border-b border-[#e8e8e6] last:border-b-0',
                    !notification.is_read && 'bg-[#9ffdd3]/20'
                  )}
                >
                  {/* Unread indicator */}
                  <div className="pt-1.5 shrink-0">
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full',
                        notification.is_read ? 'bg-transparent' : 'bg-[#005d42]'
                      )}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm leading-snug',
                        !notification.is_read
                          ? 'font-semibold text-[#1a1c1b]'
                          : 'font-medium text-[#3e4943]'
                      )}
                    >
                      {notification.title}
                    </p>
                    {notification.body && (
                      <p className="text-xs text-[#3e4943] mt-0.5 line-clamp-2">
                        {notification.body}
                      </p>
                    )}
                    <p className="text-[11px] text-[#6e7a73] mt-1">
                      {timeAgo(notification.created_at)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-[#e8e8e6] px-4 py-2.5">
              <button
                onClick={() => {
                  setIsOpen(false)
                  router.push(notificationsHref)
                }}
                className="text-sm text-[#005d42] hover:underline font-medium w-full text-center"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
