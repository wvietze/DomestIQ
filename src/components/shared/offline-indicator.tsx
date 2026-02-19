'use client'

import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/lib/hooks/use-online-status'

export function OfflineIndicator() {
  const isOnline = useOnlineStatus()

  if (isOnline) {
    return null
  }

  return (
    <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center gap-2 bg-amber-400 px-4 py-2 text-sm font-medium text-amber-900">
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>You are offline - some features may be limited</span>
    </div>
  )
}
