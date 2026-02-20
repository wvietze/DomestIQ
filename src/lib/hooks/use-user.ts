'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import type { Profile } from '@/lib/types'

// DEV MODE: When true, provides a mock user so pages render without auth
const DEV_MODE = true

const MOCK_WORKER_USER = {
  id: 'demo-worker-001',
  email: 'thandi@domestiq.co.za',
  app_metadata: {},
  user_metadata: { full_name: 'Thandi Nkosi' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as unknown as import('@supabase/supabase-js').User

const MOCK_WORKER_PROFILE: Profile = {
  id: 'demo-worker-001',
  role: 'worker',
  full_name: 'Thandi Nkosi',
  phone: '+27 82 123 4567',
  email: 'thandi@domestiq.co.za',
  preferred_language: 'en',
  avatar_url: null,
  popi_consent: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const MOCK_CLIENT_USER = {
  id: 'demo-client-001',
  email: 'james@domestiq.co.za',
  app_metadata: {},
  user_metadata: { full_name: 'James van der Merwe' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as unknown as import('@supabase/supabase-js').User

const MOCK_CLIENT_PROFILE: Profile = {
  id: 'demo-client-001',
  role: 'client',
  full_name: 'James van der Merwe',
  phone: '+27 83 456 7890',
  email: 'james@domestiq.co.za',
  preferred_language: 'en',
  avatar_url: null,
  popi_consent: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

function getMockData(pathname: string) {
  const isWorkerRoute = pathname.startsWith('/worker')
  return {
    user: isWorkerRoute ? MOCK_WORKER_USER : MOCK_CLIENT_USER,
    profile: isWorkerRoute ? MOCK_WORKER_PROFILE : MOCK_CLIENT_PROFILE,
  }
}

export function useUser() {
  const { user, profile, isLoading, setUser, setProfile, setLoading, reset } = useAuthStore()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    const mock = getMockData(pathname)

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
          setUser(mock.user)
          setProfile(mock.profile)
        }
      } catch {
        if (DEV_MODE) {
          setUser(mock.user)
          setProfile(mock.profile)
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
          setUser(mock.user)
          setProfile(mock.profile)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setProfile, setLoading, reset, pathname])

  return { user, profile, isLoading }
}
