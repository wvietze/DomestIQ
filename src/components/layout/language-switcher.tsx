'use client'

import { useState, useRef, useEffect } from 'react'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguageStore } from '@/lib/stores/language-store'
import { SUPPORTED_LANGUAGES } from '@/lib/utils/constants'

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguageStore()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLanguage = SUPPORTED_LANGUAGES.find(
    (lang) => lang.code === language
  ) ?? SUPPORTED_LANGUAGES[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-gray-200 bg-white p-1.5 sm:px-2.5 sm:py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline uppercase">{currentLanguage.code}</span>
        <ChevronDown
          className={cn(
            'hidden sm:block h-3.5 w-3.5 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 max-h-64 w-48 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === language

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors',
                  isSelected
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <span className="flex flex-col">
                  <span className="font-medium">{lang.nativeName}</span>
                  <span className="text-xs text-gray-500">{lang.name}</span>
                </span>
                {isSelected && <Check className="h-4 w-4 shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
