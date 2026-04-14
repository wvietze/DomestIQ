'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { usePushNotifications } from '@/lib/hooks/use-push-notifications'

export function PushPrompt() {
  const { state, isLoading, subscribe } = usePushNotifications()
  const [dismissed, setDismissed] = useState(false)

  // Only show if permission hasn't been granted/denied and not dismissed
  if (state !== 'prompt' || dismissed) return null

  return (
    <div className="mx-4 mt-2 mb-0 rounded-xl bg-[#f4f4f2] border border-[#bdc9c1] p-3 flex items-center gap-3">
      <div className="w-9 h-9 bg-[#97f5cc] rounded-full flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[#005d42] text-lg">notifications</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1a1c1b]">Never miss a booking</p>
        <p className="text-xs text-[#3e4943]">Get notified instantly when clients request you</p>
      </div>
      <Button
        size="sm"
        className="shrink-0 h-8 bg-[#005d42] hover:bg-[#047857] text-white text-xs"
        onClick={subscribe}
        disabled={isLoading}
      >
        {isLoading ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> : 'Enable'}
      </Button>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 text-[#6e7a73] hover:text-[#1a1c1b]"
      >
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  )
}
