'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, CalendarDays, ClipboardList,
  MessageSquare, Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/hooks/use-translation'

interface NavItem {
  labelKey: string
  fallback: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  showBadge?: boolean
}

const navItems: NavItem[] = [
  { labelKey: 'nav.home', fallback: 'Home', href: '/worker-dashboard', icon: LayoutDashboard },
  { labelKey: 'nav.calendar', fallback: 'Calendar', href: '/worker-calendar', icon: CalendarDays },
  { labelKey: 'nav.bookings', fallback: 'Bookings', href: '/worker-bookings', icon: ClipboardList },
  { labelKey: 'nav.messages', fallback: 'Messages', href: '/worker-messages', icon: MessageSquare, showBadge: true },
  { labelKey: 'nav.earnings', fallback: 'Earnings', href: '/worker-earnings', icon: Wallet },
]

interface WorkerBottomNavProps {
  unreadCount?: number
}

export function WorkerBottomNav({ unreadCount = 0 }: WorkerBottomNavProps) {
  const pathname = usePathname()
  const { t } = useTranslation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/90 backdrop-blur-lg shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-3 py-1.5 transition-all rounded-xl',
                isActive
                  ? 'text-emerald-600'
                  : 'text-gray-400 hover:text-gray-600 active:scale-95'
              )}>
              <div className="relative">
                {isActive && (
                  <div className="absolute -inset-2 rounded-xl bg-emerald-50" />
                )}
                <Icon className={cn('h-6 w-6 relative z-10', isActive && 'text-emerald-600')} />
                {item.showBadge && unreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[10px] leading-tight relative z-10',
                isActive ? 'font-bold text-emerald-700' : 'font-medium'
              )}>
                {t(item.labelKey, item.fallback)}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
