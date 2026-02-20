'use client'

import { X, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EstateTagProps {
  name: string
  suburb?: string
  onRemove?: () => void
  className?: string
}

export function EstateTag({ name, suburb, onRemove, className }: EstateTagProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1 text-sm',
      'dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
      className
    )}>
      <MapPin className="w-3 h-3" />
      <span className="truncate max-w-[200px]">{name}</span>
      {suburb && <span className="text-emerald-500 text-xs">({suburb})</span>}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800 p-0.5 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  )
}
