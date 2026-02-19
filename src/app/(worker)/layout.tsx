'use client'

import { WorkerBottomNav } from '@/components/layout/worker-bottom-nav'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { OfflineIndicator } from '@/components/shared/offline-indicator'

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <OfflineIndicator />

      {/* Language switcher in top-right */}
      <div className="fixed right-4 top-4 z-40">
        <LanguageSwitcher />
      </div>

      {/* Main content area with bottom padding for nav bar */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom navigation */}
      <WorkerBottomNav />
    </div>
  )
}
