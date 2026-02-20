'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { StarRating } from '@/components/ui/star-rating'
import { TraitBadge } from './trait-badge'
import { cn } from '@/lib/utils'
import type { ReviewTrait } from '@/lib/types/review'

interface ReviewCardProps {
  review: {
    id: string; overall_rating: number; punctuality: number | null; quality: number | null
    communication: number | null; comment: string | null; traits?: ReviewTrait[]; created_at: string
    reviewer: { full_name: string; avatar_url: string | null }
  }
  className?: string
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  const date = new Date(review.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
  const hasTraits = review.traits && review.traits.length > 0
  const hasSubRatings = review.punctuality || review.quality || review.communication

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarImage src={review.reviewer.avatar_url || undefined} />
            <AvatarFallback className="text-sm">{review.reviewer.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div><p className="font-semibold text-sm">{review.reviewer.full_name}</p><p className="text-xs text-muted-foreground">{date}</p></div>
              <StarRating rating={review.overall_rating} size="sm" />
            </div>
            {/* Trait badges (new system) */}
            {hasTraits && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {review.traits!.map(trait => (
                  <TraitBadge key={trait} trait={trait} size="sm" />
                ))}
              </div>
            )}
            {review.comment && <p className="mt-2 text-sm text-foreground leading-relaxed">{review.comment}</p>}
            {/* Legacy sub-ratings (backward compat) */}
            {!hasTraits && hasSubRatings && (
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                {review.punctuality && <span>Punctuality: {review.punctuality}/5</span>}
                {review.quality && <span>Quality: {review.quality}/5</span>}
                {review.communication && <span>Comms: {review.communication}/5</span>}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
