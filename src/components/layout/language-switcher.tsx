'use client'

import { useState, useRef, useEffect } from 'react'
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
        className="flex items-center gap-1.5 rounded-full p-2 sm:rounded-lg sm:border sm:border-[#bdc9c1] sm:bg-white sm:px-2.5 sm:py-1.5 text-sm font-medium text-[#1a1c1b] sm:shadow-sm transition-colors hover:bg-[#f4f4f2]"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <span className="material-symbols-outlined text-base">language</span>
        <span className="hidden sm:inline uppercase">{currentLanguage.code}</span>
        <span
          className={cn(
            'hidden sm:block material-symbols-outlined text-sm transition-transform',
            isOpen && 'rotate-180'
          )}
        >
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 max-h-64 w-48 overflow-auto rounded-lg border border-[#bdc9c1] bg-white py-1 shadow-lg">
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
                    ? 'bg-[#9ffdd3] text-[#005d42]'
                    : 'text-[#1a1c1b] hover:bg-[#f4f4f2]'
                )}
              >
                <span className="flex flex-col">
                  <span className="font-medium">{lang.nativeName}</span>
                  <span className="text-xs text-[#3e4943]">{lang.name}</span>
                </span>
                {isSelected && <span className="material-symbols-outlined text-base shrink-0">check</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
