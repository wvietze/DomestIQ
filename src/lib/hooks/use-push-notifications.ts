'use client'

import { useState, useEffect, useCallback } from 'react'

type PushState = 'unsupported' | 'prompt' | 'granted' | 'denied' | 'subscribed'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i)
  return output
}

function getInitialState(): PushState {
  if (typeof window === 'undefined') return 'unsupported'
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  return 'prompt'
}

export function usePushNotifications() {
  const [state, setState] = useState<PushState>(getInitialState)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (state === 'unsupported' || state === 'denied') return

    let cancelled = false
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        if (cancelled) return
        setState(sub ? 'subscribed' : Notification.permission === 'granted' ? 'granted' : 'prompt')
      })
    })
    return () => { cancelled = true }
  }, [state])

  const subscribe = useCallback(async () => {
    if (state === 'unsupported' || state === 'denied') return false
    setIsLoading(true)

    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState('denied')
        setIsLoading(false)
        return false
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY ? urlBase64ToUint8Array(VAPID_PUBLIC_KEY) : undefined,
      })

      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      })

      if (res.ok) {
        setState('subscribed')
        setIsLoading(false)
        return true
      }
    } catch (err) {
      console.error('Push subscription error:', err)
    }

    setIsLoading(false)
    return false
  }, [state])

  const unsubscribe = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/notifications/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setState('prompt')
    } catch (err) {
      console.error('Push unsubscribe error:', err)
    }
  }, [])

  return { state, isLoading, subscribe, unsubscribe }
}
