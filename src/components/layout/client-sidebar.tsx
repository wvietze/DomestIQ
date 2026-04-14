'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useUser } from '@/lib/hooks/use-user'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from './notification-bell'
import { useTranslation } from '@/lib/hooks/use-translation'

interface NavItem {
  labelKey: string
  fallback: string
  href: string
  icon: string
  iconFilled: string
}

const navItems: NavItem[] = [
  { labelKey: 'nav.dashboard', fallback: 'Dashboard', href: '/dashboard', icon: 'home', iconFilled: 'home' },
  { labelKey: 'nav.search', fallback: 'Search Workers', href: '/search', icon: 'search', iconFilled: 'search' },
  { labelKey: 'nav.bookings', fallback: 'Bookings', href: '/bookings', icon: 'event', iconFilled: 'event' },
  { labelKey: 'nav.messages', fallback: 'Messages', href: '/messages', icon: 'chat', iconFilled: 'chat' },
  { labelKey: 'nav.favorites', fallback: 'Favorites', href: '/favorites', icon: 'favorite', iconFilled: 'favorite' },
  { labelKey: 'nav.reviews', fallback: 'Reviews', href: '/reviews', icon: 'rate_review', iconFilled: 'rate_review' },
  { labelKey: 'nav.profile', fallback: 'Profile', href: '/profile', icon: 'person', iconFilled: 'person' },
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
    <div className="flex h-full flex-col bg-[#f9f9f7]">
      {/* Logo & Notifications */}
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/dashboard" className="inline-flex items-center gap-2.5">
          <Image
            src="/icons/icon-512x512.png"
            alt="DomestIQ"
            width={32}
            height={32}
            className="rounded-lg shrink-0"
            priority
          />
          <span className="font-heading font-bold text-xl tracking-tight text-[#005d42]">
            domest<span className="text-[#005d42]">IQ</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {user && <NotificationBell userId={user.id} />}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#bdc9c1] mx-4" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                isActive
                  ? 'bg-[#005d42] text-white shadow-sm'
                  : 'text-[#3e4943] hover:bg-[#f4f4f2] rounded-xl'
              )}
            >
              <span
                className={cn(
                  'material-symbols-outlined text-[20px]',
                  isActive && 'filled-icon'
                )}
                style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
              >
                {isActive ? item.iconFilled : item.icon}
              </span>
              {t(item.labelKey, item.fallback)}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="h-px bg-[#bdc9c1] mx-4" />

      {/* User section */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-[#e8e8e6]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-24 animate-pulse rounded bg-[#e8e8e6]" />
              <div className="h-3 w-32 animate-pulse rounded bg-[#e8e8e6]" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-[#bdc9c1]">
              <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? 'User'} />
              <AvatarFallback className="bg-[#f4f4f2] text-[#005d42] font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#1a1c1b]">{profile?.full_name ?? 'User'}</p>
              <p className="truncate text-xs text-[#3e4943]">{user?.email ?? ''}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="mt-3 w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#3e4943] hover:bg-[#f4f4f2] hover:text-[#ba1a1a] transition-colors duration-200"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          {t('auth.logout', 'Log Out')}
        </button>
      </div>
    </div>
  )
}

export function ClientSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed left-4 top-4 z-50 lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-[#f9f9f7] shadow-sm hover:bg-[#f4f4f2] transition-colors duration-200"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open navigation menu"
      >
        <span className="material-symbols-outlined text-[#1a1c1b]">menu</span>
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-[#bdc9c1] bg-[#f9f9f7] transition-transform duration-300 ease-in-out lg:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          className="absolute right-3 top-3 flex items-center justify-center w-8 h-8 rounded-xl hover:bg-[#f4f4f2] transition-colors duration-200"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close navigation menu"
        >
          <span className="material-symbols-outlined text-[#3e4943] text-[20px]">close</span>
        </button>
        <SidebarContent onNavigate={() => setIsMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[#bdc9c1] bg-[#f9f9f7] lg:block">
        <SidebarContent />
      </aside>
    </>
  )
}
