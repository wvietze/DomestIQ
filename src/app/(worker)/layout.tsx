'use client'

import { WorkerBottomNav } from '@/components/layout/worker-bottom-nav'
import { NotificationBell } from '@/components/layout/notification-bell'
import { OfflineIndicator } from '@/components/shared/offline-indicator'
import { PushPrompt } from '@/components/shared/push-prompt'
import { useUser } from '@/lib/hooks/use-user'
import Link from 'next/link'

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useUser()

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f9f9f7] text-[#1a1c1b]">
      <OfflineIndicator />

      {/* Top App Bar — matches Stitch */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#f9f9f7]">
        <div className="flex items-center gap-3">
          <Link href="/worker-dashboard" className="text-2xl font-bold tracking-tight text-[#005d42] font-heading">
            DomestIQ
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {user && <NotificationBell userId={user.id} notificationsHref="/worker-notifications" />}
          <div className="w-8 h-8 rounded-full bg-[#e8e8e6] overflow-hidden" />
        </div>
      </header>

      {/* Push notification prompt */}
      <div className="pt-16">
        <PushPrompt />
      </div>

      {/* Main content area with padding for bottom bar */}
      <main id="main" className="flex-1 pb-24">{children}</main>

      {/* Bottom navigation */}
      <WorkerBottomNav />
    </div>
  )
}
