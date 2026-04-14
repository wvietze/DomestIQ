'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface AdminNavItem {
  label: string
  href: string
  icon: string
}

const adminNavItems: AdminNavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
  { label: 'Users', href: '/admin/users', icon: 'group' },
  { label: 'Verifications', href: '/admin/verifications', icon: 'verified_user' },
  { label: 'Moderation', href: '/admin/moderation', icon: 'gavel' },
  { label: 'Partners', href: '/admin/partners', icon: 'handshake' },
  { label: 'Sponsors', href: '/admin/sponsors', icon: 'workspace_premium' },
  { label: 'Ads', href: '/admin/ads', icon: 'ads_click' },
]

export default function AdminShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f9f9f7] text-[#1a1c1b]">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-14 flex-col items-center gap-8 border-r border-[#e8e8e6] bg-[#f4f4f2] py-6 transition-transform duration-300 ease-in-out lg:translate-x-0',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#005d42] text-white font-heading font-extrabold text-sm">
            DQ
          </div>
        </div>
        <nav className="flex w-full flex-col items-center gap-2 px-1">
          {adminNavItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileSidebarOpen(false)}
                title={item.label}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-l-lg transition-all duration-150 active:scale-90',
                  isActive
                    ? 'bg-white text-[#005d42] shadow-sm'
                    : 'text-[#6e7a73] hover:bg-[#e8e8e6] hover:text-[#005d42]'
                )}
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Top bar */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-[#e8e8e6] bg-[#f9f9f7] px-4 lg:left-14 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#3e4943] hover:bg-[#e8e8e6] lg:hidden"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            aria-label="Toggle admin navigation"
          >
            <span className="material-symbols-outlined">
              {isMobileSidebarOpen ? 'close' : 'menu'}
            </span>
          </button>
          <h1 className="font-heading text-xs font-bold uppercase tracking-widest text-[#005d42]">
            DomestIQ Admin
          </h1>
          <div className="mx-2 hidden h-6 w-px bg-[#e8e8e6] sm:block" />
          <h2 className="hidden font-heading text-sm font-bold tracking-tight text-[#1a1c1b] sm:block">
            Administration Panel
          </h2>
        </div>
        <div className="flex items-center gap-4 text-[#3e4943]">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#e8e8e6] hover:text-[#005d42]"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#e8e8e6] hover:text-[#005d42]"
            aria-label="Settings"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="min-h-screen pt-16 lg:ml-14">
        <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
