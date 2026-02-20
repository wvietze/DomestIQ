'use client'

import { useState } from 'react'
import { Bell, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePushNotifications } from '@/lib/hooks/use-push-notifications'

export function PushPrompt() {
  const { state, isLoading, subscribe } = usePushNotifications()
  const [dismissed, setDismissed] = useState(false)

  // Only show if permission hasn't been granted/denied and not dismissed
  if (state !== 'prompt' || dismissed) return null

  return (
    <div className="mx-4 mt-2 mb-0 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-3 flex items-center gap-3">
      <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
        <Bell className="w-4 h-4 text-emerald-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-emerald-900">Never miss a booking</p>
        <p className="text-xs text-emerald-700">Get notified instantly when clients request you</p>
      </div>
      <Button
        size="sm"
        className="shrink-0 h-8 bg-emerald-600 hover:bg-emerald-700 text-xs"
        onClick={subscribe}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Enable'}
      </Button>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 text-emerald-400 hover:text-emerald-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
