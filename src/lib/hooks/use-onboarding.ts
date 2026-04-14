'use client'

import { useState } from 'react'
import { useUser } from './use-user'

const TEN_MINUTES = 10 * 60 * 1000
const STORAGE_KEY = 'domestiq_onboarding_complete'

function readLocalFlag(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

export function useOnboarding() {
  const { profile, isLoading } = useUser()
  const [localComplete, setLocalComplete] = useState<boolean>(readLocalFlag)
  const [mountTime] = useState(() => Date.now())

  const needsOnboarding = (() => {
    if (isLoading || localComplete) return false
    if (!profile?.created_at) return false
    return mountTime - new Date(profile.created_at).getTime() < TEN_MINUTES
  })()

  const completeOnboarding = () => {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, 'true')
    setLocalComplete(true)
  }

  return { needsOnboarding, checked: !isLoading, completeOnboarding }
}
