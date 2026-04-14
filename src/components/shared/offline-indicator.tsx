'use client'

import { useOnlineStatus } from '@/lib/hooks/use-online-status'

export function OfflineIndicator() {
  const isOnline = useOnlineStatus()

  if (isOnline) {
    return null
  }

  return (
    <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center gap-2 bg-[#fe932c] px-4 py-2 text-sm font-medium text-[#1a1c1b]">
      <span className="material-symbols-outlined text-base">wifi_off</span>
      <span>You are offline - some features may be limited</span>
    </div>
  )
}
