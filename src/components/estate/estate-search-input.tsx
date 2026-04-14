'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Estate } from '@/lib/types/estate'

interface EstateSearchInputProps {
  onSelect: (estate: Estate) => void
  onAddNew?: (name: string) => void
  placeholder?: string
}

export function EstateSearchInput({ onSelect, onAddNew, placeholder = 'Search estates...' }: EstateSearchInputProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Estate[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/estates?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.estates || [])
        setOpen(true)
      } catch { /* silent */ }
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-[#3e4943]">search</span>
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="pl-9 pr-9 bg-[#f4f4f2] border-none focus:ring-2 focus:ring-[#005d42]/30"
        />
        {loading && <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-base animate-spin text-[#3e4943]">progress_activity</span>}
      </div>
      {open && (results.length > 0 || query.length >= 2) && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-[#bdc9c1] rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map(estate => (
            <button
              key={estate.id}
              onClick={() => { onSelect(estate); setQuery(''); setOpen(false) }}
              className="w-full text-left px-3 py-2.5 hover:bg-[#f4f4f2] flex items-center gap-2 text-sm"
            >
              <span className="material-symbols-outlined text-base text-[#005d42] shrink-0">location_on</span>
              <div className="min-w-0">
                <p className="font-medium truncate text-[#1a1c1b]">{estate.name}</p>
                <p className="text-xs text-[#3e4943]">{estate.suburb}, {estate.city}</p>
              </div>
            </button>
          ))}
          {results.length === 0 && query.length >= 2 && !loading && onAddNew && (
            <Button
              variant="ghost"
              onClick={() => { onAddNew(query); setQuery(''); setOpen(false) }}
              className="w-full justify-start gap-2 text-sm px-3 py-2.5 h-auto text-[#005d42]"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Add &ldquo;{query}&rdquo; as new estate
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
