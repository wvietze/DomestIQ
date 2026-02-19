'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Search, CalendarDays, MessageSquare,
  Star, User, Menu, X, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useUser } from '@/lib/hooks/use-user'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from './notification-bell'
import { Logo } from '@/components/shared/logo'
import { useTranslation } from '@/lib/hooks/use-translation'

interface NavItem {
  labelKey: string
  fallback: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { labelKey: 'nav.dashboard', fallback: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { labelKey: 'nav.search', fallback: 'Search Workers', href: '/search', icon: Search },
  { labelKey: 'nav.bookings', fallback: 'Bookings', href: '/bookings', icon: CalendarDays },
  { labelKey: 'nav.messages', fallback: 'Messages', href: '/messages', icon: MessageSquare },
  { labelKey: 'nav.reviews', fallback: 'Reviews', href: '/reviews', icon: Star },
  { labelKey: 'nav.profile', fallback: 'Profile', href: '/profile', icon: User },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, isLoading } = useUser()
  const { t } = useTranslation()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = profile
    ? `${profile.full_name?.charAt(0) ?? ''}`.toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="flex h-full flex-col">
      {/* Logo & Notifications */}
      <div className="flex h-16 items-center justify-between px-5">
        <Logo size="sm" href="/dashboard" />
        {user && <NotificationBell userId={user.id} />}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}>
              <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-emerald-600')} />
              {t(item.labelKey, item.fallback)}
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* User section */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-emerald-100">
              <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? 'User'} />
              <AvatarFallback className="bg-emerald-50 text-emerald-700 font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{profile?.full_name ?? 'User'}</p>
              <p className="truncate text-xs text-gray-500">{user?.email ?? ''}</p>
            </div>
          </div>
        )}

        <Button variant="ghost" size="sm"
          className="mt-3 w-full justify-start gap-2 text-gray-600 hover:text-red-600"
          onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          {t('auth.logout', 'Log Out')}
        </Button>
      </div>
    </div>
  )
}

export function ClientSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger */}
      <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(true)} aria-label="Open navigation menu">
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gray-200 bg-white/95 backdrop-blur-lg transition-transform duration-300 ease-in-out lg:hidden',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <Button variant="ghost" size="icon" className="absolute right-3 top-3"
          onClick={() => setIsMobileOpen(false)} aria-label="Close navigation menu">
          <X className="h-5 w-5" />
        </Button>
        <SidebarContent onNavigate={() => setIsMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-gray-200 bg-white/95 backdrop-blur-lg lg:block">
        <SidebarContent />
      </aside>
    </>
  )
}
