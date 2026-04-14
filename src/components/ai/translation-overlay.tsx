'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLanguageStore } from '@/lib/stores/language-store'

interface TranslationOverlayProps {
  text: string
  className?: string
}

export function TranslationOverlay({ text, className }: TranslationOverlayProps) {
  const { language } = useLanguageStore()
  const [translated, setTranslated] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)

  if (language === 'en') return null

  const handleTranslate = async () => {
    if (translated) { setShow(!show); return }
    setLoading(true)
    try {
      const res = await fetch('/api/ai/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, targetLanguage: language }) })
      const data = await res.json()
      if (data.translation) { setTranslated(data.translation); setShow(true) }
    } catch { /* silent */ }
    setLoading(false)
  }

  return (
    <div className={cn('inline-flex items-center', className)}>
      <Button variant="ghost" size="sm" onClick={handleTranslate} disabled={loading} className="h-6 px-2 text-xs gap-1 text-[#005d42]">
        <span className={cn('material-symbols-outlined text-xs', loading && 'animate-spin')}>
          {loading ? 'progress_activity' : 'translate'}
        </span>
        {translated && show ? 'Original' : 'Translate'}
      </Button>
      {show && translated && (
        <div className="ml-2 text-sm italic text-[#3e4943] flex items-center gap-1">
          {translated}
          <button onClick={() => setShow(false)} className="hover:text-[#1a1c1b]"><span className="material-symbols-outlined text-xs">close</span></button>
        </div>
      )}
    </div>
  )
}
