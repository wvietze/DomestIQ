'use client'

import { StarRating } from '@/components/ui/star-rating'
import { cn } from '@/lib/utils'

interface RatingSummaryProps {
  overallRating: number
  totalReviews: number
  breakdown?: { 5: number; 4: number; 3: number; 2: number; 1: number }
  subRatings?: { punctuality: number; quality: number; communication: number }
  className?: string
}

export function RatingSummary({ overallRating, totalReviews, breakdown, subRatings, className }: RatingSummaryProps) {
  const maxCount = breakdown ? Math.max(...Object.values(breakdown), 1) : 1

  return (
    <div className={cn('', className)}>
      <div className="flex items-center gap-4 mb-4">
        <div className="text-center">
          <p className="text-4xl font-bold">{overallRating.toFixed(1)}</p>
          <StarRating rating={overallRating} size="sm" />
          <p className="text-sm text-muted-foreground mt-1">{totalReviews} reviews</p>
        </div>
        {breakdown && (
          <div className="flex-1 space-y-1.5">
            {([5, 4, 3, 2, 1] as const).map(star => (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-muted-foreground">{star}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${((breakdown[star] || 0) / maxCount) * 100}%` }} />
                </div>
                <span className="w-8 text-right text-xs text-muted-foreground">{breakdown[star] || 0}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {subRatings && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center"><p className="text-lg font-bold">{subRatings.punctuality.toFixed(1)}</p><p className="text-xs text-muted-foreground">Punctuality</p></div>
          <div className="text-center"><p className="text-lg font-bold">{subRatings.quality.toFixed(1)}</p><p className="text-xs text-muted-foreground">Quality</p></div>
          <div className="text-center"><p className="text-lg font-bold">{subRatings.communication.toFixed(1)}</p><p className="text-xs text-muted-foreground">Communication</p></div>
        </div>
      )}
    </div>
  )
}
