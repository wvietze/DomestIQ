'use client'

import { TraitBadge } from './trait-badge'
import type { ReviewTrait } from '@/lib/types/review'

interface TraitSummaryProps {
  topTraits: Record<string, number>
  className?: string
}

export function TraitSummary({ topTraits, className }: TraitSummaryProps) {
  const entries = Object.entries(topTraits)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)

  if (entries.length === 0) return null

  return (
    <div className={className}>
      <p className="text-sm font-medium text-muted-foreground mb-2">Top Traits</p>
      <div className="flex flex-wrap gap-1.5">
        {entries.map(([trait, count]) => (
          <TraitBadge
            key={trait}
            trait={trait as ReviewTrait}
            count={count}
            size="sm"
          />
        ))}
      </div>
    </div>
  )
}
