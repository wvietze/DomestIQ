'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  MessageSquare,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  showBadge?: boolean
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/worker-dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Calendar',
    href: '/worker-calendar',
    icon: CalendarDays,
  },
  {
    label: 'Bookings',
    href: '/worker-bookings',
    icon: ClipboardList,
  },
  {
    label: 'Messages',
    href: '/worker-messages',
    icon: MessageSquare,
    showBadge: true,
  },
  {
    label: 'Profile',
    href: '/worker-profile',
    icon: User,
  },
]

interface WorkerBottomNavProps {
  unreadCount?: number
}

export function WorkerBottomNav({ unreadCount = 0 }: WorkerBottomNavProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg">
      <div className="flex items-center justify-around pb-4 pt-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-2 py-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <div className="relative">
                <Icon className="h-6 w-6" />
                {item.showBadge && unreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500">
                    <span className="sr-only">
                      {unreadCount} unread messages
                    </span>
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] leading-tight',
                  isActive ? 'font-semibold' : 'font-normal'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
