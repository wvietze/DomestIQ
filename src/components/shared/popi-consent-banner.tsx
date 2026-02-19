'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Shield, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CONSENT_KEY = 'domestiq-popi-consent'

type BannerState = 'hidden' | 'visible' | 'accepted'

async function grantConsent(
  consentType: string,
  consentText: string
): Promise<boolean> {
  try {
    const res = await fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consent_type: consentType,
        consent_text: consentText,
      }),
    })
    // 409 means consent already exists, which is fine
    return res.ok || res.status === 409
  } catch {
    return false
  }
}

export function PopiConsentBanner() {
  const [bannerState, setBannerState] = useState<BannerState>('hidden')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY)
    if (!consent) {
      // Small delay so the slide-up animation is visible
      const timer = setTimeout(() => setBannerState('visible'), 300)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    // Fire all three consent API calls in parallel
    const results = await Promise.allSettled([
      grantConsent(
        'popi_consent',
        'User consented to POPI Act data processing on DomestIQ'
      ),
      grantConsent(
        'privacy_policy',
        'User accepted the DomestIQ Privacy Policy'
      ),
      grantConsent(
        'platform_terms',
        'User accepted the DomestIQ Platform Terms of Use'
      ),
    ])

    // Log failures but don't block the user
    results.forEach((result, i) => {
      if (result.status === 'rejected' || (result.status === 'fulfilled' && !result.value)) {
        console.warn(`Consent API call ${i} did not succeed — stored locally as fallback`)
      }
    })

    // Store acceptance in localStorage as backup
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        consent_given: true,
        consent_types: ['popi_consent', 'privacy_policy', 'platform_terms'],
        timestamp: new Date().toISOString(),
      })
    )

    // Show the success state briefly before hiding
    setBannerState('accepted')
    setTimeout(() => {
      setBannerState('hidden')
    }, 1500)

    setIsSubmitting(false)
  }, [isSubmitting])

  if (bannerState === 'hidden') {
    return null
  }

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-50
        transition-all duration-500 ease-out
        ${bannerState === 'visible' || bannerState === 'accepted'
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0'
        }
      `}
    >
      {/* Subtle top shadow gradient */}
      <div className="pointer-events-none h-8 bg-gradient-to-t from-black/5 to-transparent" />

      <div className="border border-white/60 bg-white/90 px-4 py-4 shadow-2xl backdrop-blur-lg sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left content */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              {bannerState === 'accepted' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 animate-in zoom-in duration-300" />
              ) : (
                <Shield className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="space-y-0.5">
              {bannerState === 'accepted' ? (
                <p className="text-sm font-medium text-emerald-700">
                  Thank you! Your consent has been recorded.
                </p>
              ) : (
                <>
                  <p className="text-sm font-semibold text-gray-900">
                    Your privacy matters
                  </p>
                  <p className="text-sm leading-relaxed text-gray-600">
                    DomestIQ processes personal information in accordance with
                    South Africa&apos;s Protection of Personal Information Act
                    (POPIA). By accepting, you consent to our data practices,
                    privacy policy, and platform terms.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Right actions */}
          {bannerState !== 'accepted' && (
            <div className="flex shrink-0 items-center gap-3 pl-13 sm:pl-0">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Link href="/privacy">Privacy Policy</Link>
              </Button>
              <Button
                size="sm"
                onClick={handleAccept}
                disabled={isSubmitting}
                className="min-w-[100px] shadow-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving...
                  </span>
                ) : (
                  'I Accept'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
