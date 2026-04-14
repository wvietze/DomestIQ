'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/hooks/use-translation'

export function PwaInstallSection() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('domestiq_pwa_dismissed') === 'true') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDismissed(true)
        return
      }
    }

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(ios)

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

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

  const { t } = useTranslation()

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
        <div className="bg-white rounded-2xl shadow-2xl border border-[#e2e3e1] p-4 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-[#6e7a73] hover:text-[#1a1c1b]"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#9ffdd3] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl text-[#005d42]">smartphone</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm text-[#1a1c1b]">{t('landing.pwa.title', 'Add DomestIQ to Home Screen')}</h3>
              <p className="text-xs text-[#3e4943] mt-0.5">
                {t('landing.pwa.desc', 'Get quick access to bookings, messages, and more.')}
              </p>
            </div>
          </div>

          {isIOS ? (
            <div className="mt-3 bg-[#f4f4f2] rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-[#1a1c1b] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">ios_share</span> {t('landing.pwa.ios_step1', 'Tap the share button')}
              </p>
              <p className="text-xs text-[#3e4943]">
                {t('landing.pwa.ios_step2', 'Then select "Add to Home Screen"')}
              </p>
            </div>
          ) : (
            <Button
              onClick={handleInstall}
              className="w-full mt-3 gap-2 bg-[#005d42] hover:bg-[#047857] text-white"
              size="sm"
            >
              <span className="material-symbols-outlined text-base">download</span>
              {t('landing.pwa.install', 'Install App')}
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
