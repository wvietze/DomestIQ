'use client'

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
      'inline-flex items-center gap-1.5 rounded-full border border-[#97f5cc] bg-[#9ffdd3]/30 text-[#005d42] px-3 py-1 text-sm',
      className
    )}>
      <span className="material-symbols-outlined text-sm">location_on</span>
      <span className="truncate max-w-[200px]">{name}</span>
      {suburb && <span className="text-[#047857] text-xs">({suburb})</span>}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 rounded-full hover:bg-[#97f5cc] p-0.5 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      )}
    </span>
  )
}
