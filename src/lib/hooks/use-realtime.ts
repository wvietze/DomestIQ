'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE'

interface UseRealtimeOptions {
  table: string
  filter?: string
  event?: RealtimeEvent | '*'
  onInsert?: (payload: Record<string, unknown>) => void
  onUpdate?: (payload: Record<string, unknown>) => void
  onDelete?: (payload: Record<string, unknown>) => void
  enabled?: boolean
}

export function useRealtime({
  table,
  filter,
  event = '*',
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!enabled) return

    const supabase = createClient()

    const channelConfig: Record<string, string> = {
      event,
      schema: 'public',
      table,
    }
    if (filter) channelConfig.filter = filter

    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes' as never,
        channelConfig,
        (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => {
          if (payload.eventType === 'INSERT' && onInsert) {
            onInsert(payload.new)
          } else if (payload.eventType === 'UPDATE' && onUpdate) {
            onUpdate(payload.new)
          } else if (payload.eventType === 'DELETE' && onDelete) {
            onDelete(payload.old)
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter, event, onInsert, onUpdate, onDelete, enabled])

  return channelRef
}
