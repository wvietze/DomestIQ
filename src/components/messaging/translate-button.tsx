'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TranslateButtonProps {
  text: string
  targetLanguage?: string
  onTranslated?: (translatedText: string) => void
  size?: 'sm' | 'default'
  className?: string
}

export function TranslateButton({ text, targetLanguage = 'en', onTranslated, size = 'sm', className }: TranslateButtonProps) {
  const [translating, setTranslating] = useState(false)
  const [translated, setTranslated] = useState<string | null>(null)
  const [showOriginal, setShowOriginal] = useState(false)

  const handleTranslate = async () => {
    if (translated) { setShowOriginal(!showOriginal); return }
    setTranslating(true)
    try {
      const res = await fetch('/api/ai/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, targetLanguage }) })
      const data = await res.json()
      if (data.translatedText) { setTranslated(data.translatedText); setShowOriginal(false); onTranslated?.(data.translatedText) }
    } catch { /* silent */ }
    setTranslating(false)
  }

  return (
    <div className={cn('', className)}>
      <Button variant="ghost" size={size} onClick={handleTranslate} disabled={translating} className="gap-1.5 text-[#005d42]">
        <span className={cn('material-symbols-outlined text-sm', translating && 'animate-spin')}>
          {translating ? 'progress_activity' : 'translate'}
        </span>
        {translated ? (showOriginal ? 'Translated' : 'Original') : 'Translate'}
      </Button>
      {translated && !showOriginal && <p className="mt-1 text-sm italic text-[#3e4943]">{translated}</p>}
    </div>
  )
}
