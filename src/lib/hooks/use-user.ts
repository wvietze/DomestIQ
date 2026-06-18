'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import type { Profile } from '@/lib/types'

export function useUser() {
  const { user, profile, isLoading, setUser, setProfile, setLoading, reset } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()
    let active = true

    async function loadProfile(userId: string) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (active) setProfile(data as Profile | null)
    }

    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!active) return
        setUser(user)
        if (user) await loadProfile(user.id)
      } catch {
        if (active) reset()
      } finally {
        if (active) setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return
        setUser(session?.user ?? null)
        // IMPORTANT: never `await` a Supabase call directly inside this callback.
        // onAuthStateChange runs while GoTrue holds its internal auth lock, so an
        // awaited query here deadlocks getUser()/getSession() and the app hangs on
        // its loading state. Defer the profile fetch out of the lock with setTimeout.
        if (session?.user) {
          const userId = session.user.id
          setTimeout(() => { if (active) void loadProfile(userId) }, 0)
        } else {
          setProfile(null)
        }
      }
    )

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [setUser, setProfile, setLoading, reset])

  return { user, profile, isLoading }
}
