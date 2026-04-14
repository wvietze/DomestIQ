'use client'

import { useState, useEffect } from 'react'
import { useLanguageStore } from '@/lib/stores/language-store'
import { SUPPORTED_LANGUAGES } from '@/lib/utils/constants'

interface LegalLanguageNoticeProps {
  documentType: 'terms' | 'privacy'
}

export function LegalLanguageNotice({ documentType }: LegalLanguageNoticeProps) {
  const { language } = useLanguageStore()
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === language)
  const langName = langInfo?.nativeName || langInfo?.name || language

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSummary(null)
    setError(false)
  }, [language])

  if (language === 'en') return null

  const title = documentType === 'terms' ? 'Terms of Service' : 'Privacy Policy'

  const handleLoadSummary = async () => {
    if (summary) return
    setLoading(true)
    setError(false)
    try {
      const summaryText = documentType === 'terms'
        ? `Please provide a plain-language summary of a Terms of Service for DomestIQ, a South African platform connecting households with domestic workers. Key points to summarize: DomestIQ is a matching platform only (not an employer), workers keep 100% of their rate, clients pay a platform fee on top, bookings can be cancelled with refund policies, workers are independent contractors responsible for their own taxes, verification is optional, reviews must be honest, disputes are resolved through mediation then arbitration, South African law applies. Keep it simple and clear for someone who may not read legal English well. About 200 words.`
        : `Please provide a plain-language summary of a Privacy Policy for DomestIQ, a South African platform connecting households with domestic workers. Key points to summarize: We collect names, phone numbers, profiles, location data, and booking info. We use it for matching workers with clients, facilitating bookings, and verification. Workers control their own data through a consent dashboard. We never sell data. Data is encrypted and secure. Users can access, correct, or delete their data under POPIA. We notify users of data breaches within 72 hours. Keep it simple and clear for someone who may not read legal English well. About 200 words.`

      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: summaryText, targetLanguage: language }),
      })
      const data = await res.json()
      if (data.translation) {
        setSummary(data.translation)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    }
    setLoading(false)
  }

  return (
    <div className="mb-8 rounded-xl border border-[#ffdcc3] bg-[#ffdcc3]/40 p-5">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-[#904d00] shrink-0">language</span>
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#904d00]">
            This {title} is in English. The English version is the legally binding document.
          </p>
          {!summary && !loading && (
            <button
              onClick={handleLoadSummary}
              className="text-sm font-medium text-[#904d00] underline underline-offset-2 hover:text-[#1a1c1b] transition-colors"
            >
              Load a {langName} summary
            </button>
          )}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-[#904d00]">
              <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
              Generating {langName} summary...
            </div>
          )}
          {error && (
            <p className="text-sm text-[#ba1a1a]">
              Could not generate summary. Please try again later.
            </p>
          )}
          {summary && (
            <div className="mt-3 rounded-lg bg-white/70 border border-[#ffdcc3] p-4">
              <p className="text-xs font-medium text-[#904d00] mb-2 uppercase tracking-wider">
                {langName} Summary (not legally binding)
              </p>
              <p className="text-sm text-[#1a1c1b]/80 leading-relaxed whitespace-pre-line">
                {summary}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
