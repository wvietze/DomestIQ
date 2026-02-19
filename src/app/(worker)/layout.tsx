'use client'

import { WorkerBottomNav } from '@/components/layout/worker-bottom-nav'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { NotificationBell } from '@/components/layout/notification-bell'
import { OfflineIndicator } from '@/components/shared/offline-indicator'
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

      {/* Top bar with notifications and language switcher */}
      <div className="fixed right-4 top-4 z-40 flex items-center gap-2">
        {user && <NotificationBell userId={user.id} notificationsHref="/worker-notifications" />}
        <LanguageSwitcher />
      </div>

      {/* Main content area with bottom padding for nav bar */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom navigation */}
      <WorkerBottomNav />
    </div>
  )
}
