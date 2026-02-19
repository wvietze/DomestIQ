'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Languages, Loader2, X } from 'lucide-react'
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
      if (data.translatedText) { setTranslated(data.translatedText); setShow(true) }
    } catch { /* silent */ }
    setLoading(false)
  }

  return (
    <div className={cn('inline-flex items-center', className)}>
      <Button variant="ghost" size="sm" onClick={handleTranslate} disabled={loading} className="h-6 px-2 text-xs gap-1">
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
        {translated && show ? 'Original' : 'Translate'}
      </Button>
      {show && translated && (
        <div className="ml-2 text-sm italic text-muted-foreground flex items-center gap-1">
          {translated}
          <button onClick={() => setShow(false)} className="hover:text-foreground"><X className="w-3 h-3" /></button>
        </div>
      )}
    </div>
  )
}
