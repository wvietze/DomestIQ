'use client'

import { WorkerBottomNav } from '@/components/layout/worker-bottom-nav'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { NotificationBell } from '@/components/layout/notification-bell'
import { OfflineIndicator } from '@/components/shared/offline-indicator'
import { PushPrompt } from '@/components/shared/push-prompt'
import { Logo } from '@/components/shared/logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
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
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between gap-3 px-4 py-3 bg-background/90 backdrop-blur-lg border-b border-border">
        <Logo size="sm" href="/worker-dashboard" className="min-w-0" />
        <div className="flex items-center gap-2 shrink-0">
          {user && <NotificationBell userId={user.id} notificationsHref="/worker-notifications" />}
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>

      {/* Push notification prompt */}
      <div className="pt-14">
        <PushPrompt />
      </div>

      {/* Main content area with padding for bottom bar */}
      <main id="main" className="flex-1 pb-20">{children}</main>

      {/* Bottom navigation */}
      <WorkerBottomNav />
    </div>
  )
}
