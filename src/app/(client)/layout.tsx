'use client'

import { ClientSidebar } from '@/components/layout/client-sidebar'
import { OfflineIndicator } from '@/components/shared/offline-indicator'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen">
      <OfflineIndicator />

      {/* Sidebar (includes desktop fixed sidebar + mobile hamburger/drawer) */}
      <ClientSidebar />

      {/* Main content: offset on desktop for the 256px sidebar */}
      <main className="min-h-screen lg:ml-64">
        <div className="p-4 pt-16 sm:p-6 sm:pt-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
