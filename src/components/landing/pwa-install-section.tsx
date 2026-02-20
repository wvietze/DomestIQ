'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smartphone, X, Download, Share } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PwaInstallSection() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already dismissed
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('domestiq_pwa_dismissed') === 'true') {
        setDismissed(true)
        return
      }
    }

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(ios)

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return

    // Listen for install prompt on Android/Chrome
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Show iOS prompt after a delay if on mobile
    if (ios && /Mobi/.test(navigator.userAgent)) {
      const timer = setTimeout(() => setShowPrompt(true), 3000)
      return () => {
        window.removeEventListener('beforeinstallprompt', handler)
        clearTimeout(timer)
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt && 'prompt' in deferredPrompt) {
      (deferredPrompt as { prompt: () => void }).prompt()
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('domestiq_pwa_dismissed', 'true')
  }

  if (dismissed || !showPrompt) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed bottom-4 left-4 right-4 z-40 sm:left-auto sm:right-4 sm:max-w-sm"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">Add DomestIQ to Home Screen</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Get quick access to bookings, messages, and more.
              </p>
            </div>
          </div>

          {isIOS ? (
            <div className="mt-3 bg-gray-50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                <Share className="w-3.5 h-3.5" /> Tap the share button
              </p>
              <p className="text-xs text-gray-600">
                Then select &quot;Add to Home Screen&quot;
              </p>
            </div>
          ) : (
            <Button
              onClick={handleInstall}
              className="w-full mt-3 gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              size="sm"
            >
              <Download className="w-4 h-4" />
              Install App
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
