'use client'

import { useState, useCallback, useEffect } from 'react'
import { useLanguageStore } from '@/lib/stores/language-store'

type TranslationDictionary = Record<string, string>

const translationCache: Record<string, TranslationDictionary> = {}

export function useTranslation() {
  const { language } = useLanguageStore()
  const [translations, setTranslations] = useState<TranslationDictionary>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function loadTranslations() {
      if (language === 'en') {
        setTranslations({})
        return
      }

      if (translationCache[language]) {
        setTranslations(translationCache[language])
        return
      }

      setIsLoading(true)
      try {
        const res = await fetch(`/locales/${language}.json`)
        if (res.ok) {
          const data = await res.json()
          translationCache[language] = data
          setTranslations(data)
        }
      } catch {
        // Fallback to English
        setTranslations({})
      } finally {
        setIsLoading(false)
      }
    }

    loadTranslations()
  }, [language])

  const t = useCallback(
    (key: string, fallback?: string) => {
      if (language === 'en') return fallback ?? key
      return translations[key] ?? fallback ?? key
    },
    [language, translations]
  )

  const translateText = useCallback(
    async (text: string, targetLang?: string): Promise<string> => {
      const target = targetLang ?? language
      if (target === 'en') return text

      try {
        const res = await fetch('/api/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLanguage: target }),
        })
        if (res.ok) {
          const data = await res.json()
          return data.translation
        }
      } catch {
        // Return original text on error
      }
      return text
    },
    [language]
  )

  return { t, translateText, language, isLoading }
}
