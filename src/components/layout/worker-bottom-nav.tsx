'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/hooks/use-translation'

interface NavItem {
  labelKey: string
  fallback: string
  href: string
  icon: string
  showBadge?: boolean
}

const navItems: NavItem[] = [
  { labelKey: 'nav.home', fallback: 'Home', href: '/worker-dashboard', icon: 'home' },
  { labelKey: 'nav.calendar', fallback: 'Calendar', href: '/worker-calendar', icon: 'calendar_today' },
  { labelKey: 'nav.bookings', fallback: 'Bookings', href: '/worker-bookings', icon: 'event' },
  { labelKey: 'nav.messages', fallback: 'Messages', href: '/worker-messages', icon: 'chat', showBadge: true },
  { labelKey: 'nav.history', fallback: 'History', href: '/worker-earnings', icon: 'history' },
]

interface WorkerBottomNavProps {
  unreadCount?: number
}

export function WorkerBottomNav({ unreadCount = 0 }: WorkerBottomNavProps) {
  const pathname = usePathname()
  const { t } = useTranslation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-3 bg-[#f9f9f7] shadow-[0_-8px_24px_rgba(26,28,27,0.06)]">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center p-2 transition-all duration-200 relative',
              isActive
                ? 'bg-[#047857] text-white rounded-2xl px-4 active:scale-90'
                : 'text-[#3e4943] hover:bg-[#f4f4f2] active:scale-95'
            )}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-medium">{t(item.labelKey, item.fallback)}</span>
            {item.showBadge && unreadCount > 0 && (
              <div className="absolute top-1 right-3 w-2 h-2 bg-[#904d00] rounded-full" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
