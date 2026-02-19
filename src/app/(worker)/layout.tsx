'use client'

import { WorkerBottomNav } from '@/components/layout/worker-bottom-nav'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { NotificationBell } from '@/components/layout/notification-bell'
import { OfflineIndicator } from '@/components/shared/offline-indicator'
import { Logo } from '@/components/shared/logo'
import { useUser } from '@/lib/hooks/use-user'

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useUser()

  return (
    <div className="relative flex min-h-screen flex-col">
      <OfflineIndicator />

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <Logo size="sm" href="/worker-dashboard" />
        <div className="flex items-center gap-2">
          {user && <NotificationBell userId={user.id} notificationsHref="/worker-notifications" />}
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main content area with padding for top and bottom bars */}
      <main className="flex-1 pt-16 pb-20">{children}</main>

      {/* Bottom navigation */}
      <WorkerBottomNav />
    </div>
  )
}
