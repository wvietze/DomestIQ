'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

const CONSENT_KEY = 'domestiq-popi-consent'

export function PopiConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY)
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const handleAgree = async () => {
    // Store consent in localStorage
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        consented: true,
        timestamp: new Date().toISOString(),
      })
    )

    // Try to create consent record in Supabase (non-blocking)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await supabase.from('consent_records').insert({
          user_id: user.id,
          consent_type: 'popi',
          consented: true,
          consented_at: new Date().toISOString(),
        })
      }
    } catch {
      // Consent is stored locally even if Supabase call fails
    }

    setShowBanner(false)
  }

  if (!showBanner) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4 shadow-lg sm:p-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm text-gray-600">
            We collect and process your personal information in accordance with
            the Protection of Personal Information Act (POPI). By continuing,
            you consent to our data practices.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button variant="link" size="sm" asChild>
            <Link href="/privacy">Privacy Policy</Link>
          </Button>
          <Button size="sm" onClick={handleAgree}>
            I Agree
          </Button>
        </div>
      </div>
    </div>
  )
}
