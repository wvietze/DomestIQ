'use client'

import { cn } from '@/lib/utils'
import { TRAIT_LABELS, TRAIT_EMOJIS, type ReviewTrait } from '@/lib/types/review'

interface TraitBadgeProps {
  trait: ReviewTrait
  count?: number
  selected?: boolean
  interactive?: boolean
  onClick?: () => void
  size?: 'sm' | 'md'
  className?: string
}

export function TraitBadge({
  trait,
  count,
  selected,
  interactive,
  onClick,
  size = 'md',
  className,
}: TraitBadgeProps) {
  const label = TRAIT_LABELS[trait]
  const emoji = TRAIT_EMOJIS[trait]

  return (
    <button
      type="button"
      onClick={interactive ? onClick : undefined}
      disabled={!interactive}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border transition-all',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1.5 text-sm',
        interactive && 'cursor-pointer hover:shadow-sm active:scale-95',
        !interactive && 'cursor-default',
        selected
          ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
          : 'border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400',
        interactive && !selected && 'hover:border-blue-200 hover:bg-blue-50/50',
        className
      )}
    >
      <span>{emoji}</span>
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className={cn(
          'rounded-full font-medium',
          size === 'sm' ? 'text-[10px] ml-0.5' : 'text-xs ml-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50',
        )}>
          {count}
        </span>
      )}
    </button>
  )
}
