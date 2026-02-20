'use client'

import { useState, useEffect } from 'react'
import { useUser } from './use-user'

export function useOnboarding() {
  const { profile, isLoading } = useUser()
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (isLoading) return

    // Check localStorage flag first
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem('domestiq_onboarding_complete')
      if (completed === 'true') {
        setNeedsOnboarding(false)
        setChecked(true)
        return
      }
    }

    // Fall back to checking if profile was recently created (within 10 minutes)
    if (profile?.created_at) {
      const createdAt = new Date(profile.created_at).getTime()
      const now = Date.now()
      const tenMinutes = 10 * 60 * 1000
      if (now - createdAt < tenMinutes) {
        setNeedsOnboarding(true)
        setChecked(true)
        return
      }
    }

    setNeedsOnboarding(false)
    setChecked(true)
  }, [profile, isLoading])

  const completeOnboarding = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('domestiq_onboarding_complete', 'true')
    }
    setNeedsOnboarding(false)
  }

  return { needsOnboarding, checked, completeOnboarding }
}
