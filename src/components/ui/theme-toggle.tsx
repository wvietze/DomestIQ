'use client'

import { useEffect } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useThemeStore } from '@/lib/stores/theme-store'
import { cn } from '@/lib/utils'

function applyTheme(mode: 'system' | 'light' | 'dark') {
  if (typeof window === 'undefined') return
  const root = document.documentElement
  if (mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function ThemeToggle({ className }: { className?: string }) {
  const { mode, setMode } = useThemeStore()

  // Apply theme on mount and when mode changes
  useEffect(() => {
    applyTheme(mode)
  }, [mode])

  // Listen for OS preference changes when in system mode
  useEffect(() => {
    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mode])

  const cycle = () => {
    const next = mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system'
    setMode(next)
  }

  const Icon = mode === 'dark' ? Moon : mode === 'light' ? Sun : Monitor

  return (
    <button
      onClick={cycle}
      aria-label={`Theme: ${mode}. Click to change.`}
      className={cn(
        'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
        'hover:bg-muted text-muted-foreground hover:text-foreground',
        className
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  )
}

/**
 * Inline script to prevent flash of wrong theme on page load.
 * Render this in <head> or at the top of <body>.
 */
export function ThemeScript() {
  const script = `
    (function(){
      try {
        var stored = JSON.parse(localStorage.getItem('domestiq-theme') || '{}');
        var mode = (stored.state && stored.state.mode) || 'system';
        if (mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
        }
      } catch(e) {}
    })();
  `
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
