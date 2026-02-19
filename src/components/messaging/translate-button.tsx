'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Languages, Loader2 } from 'lucide-react'
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
      <Button variant="ghost" size={size} onClick={handleTranslate} disabled={translating} className="gap-1.5">
        {translating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
        {translated ? (showOriginal ? 'Translated' : 'Original') : 'Translate'}
      </Button>
      {translated && !showOriginal && <p className="mt-1 text-sm italic text-muted-foreground">{translated}</p>}
    </div>
  )
}
