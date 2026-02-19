'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import type { Profile } from '@/lib/types'

// DEV MODE: When true, provides a mock user so pages render without auth
const DEV_MODE = true

const MOCK_USER = {
  id: 'demo-user-001',
  email: 'demo@domestiq.co.za',
  app_metadata: {},
  user_metadata: { full_name: 'Demo User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as unknown as import('@supabase/supabase-js').User

const MOCK_PROFILE: Profile = {
  id: 'demo-user-001',
  role: 'worker',
  full_name: 'Thandi Nkosi',
  phone: '+27 82 123 4567',
  email: 'demo@domestiq.co.za',
  preferred_language: 'en',
  avatar_url: null,
  popi_consent: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export function useUser() {
  const { user, profile, isLoading, setUser, setProfile, setLoading, reset } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    async function getUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          setProfile(profile as Profile | null)
        } else if (DEV_MODE) {
          // No real user - use mock data so pages render in dev
          setUser(MOCK_USER)
          setProfile(MOCK_PROFILE)
        }
      } catch {
        if (DEV_MODE) {
          setUser(MOCK_USER)
          setProfile(MOCK_PROFILE)
        } else {
          reset()
        }
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setProfile(profile as Profile | null)
        } else if (DEV_MODE) {
          setUser(MOCK_USER)
          setProfile(MOCK_PROFILE)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setProfile, setLoading, reset])

  return { user, profile, isLoading }
}
