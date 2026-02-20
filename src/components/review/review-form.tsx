'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { StarRating } from '@/components/ui/star-rating'
import { TraitBadge } from './trait-badge'
import { Loader2, Send } from 'lucide-react'
import { REVIEW_TRAITS, type ReviewTrait } from '@/lib/types/review'

interface ReviewFormProps {
  bookingId: string
  revieweeId: string
  onSubmit: (review: {
    bookingId: string
    revieweeId: string
    overall_rating: number
    traits: ReviewTrait[]
    comment?: string
  }) => Promise<void>
  onCancel?: () => void
}

export function ReviewForm({ bookingId, revieweeId, onSubmit, onCancel }: ReviewFormProps) {
  const [overall, setOverall] = useState(0)
  const [selectedTraits, setSelectedTraits] = useState<Set<ReviewTrait>>(new Set())
  const [loading, setLoading] = useState(false)

  const toggleTrait = (trait: ReviewTrait) => {
    setSelectedTraits(prev => {
      const next = new Set(prev)
      if (next.has(trait)) {
        next.delete(trait)
      } else {
        next.add(trait)
      }
      return next
    })
  }

  const handleSubmit = async () => {
    if (overall === 0) return
    setLoading(true)
    try {
      await onSubmit({
        bookingId,
        revieweeId,
        overall_rating: overall,
        traits: Array.from(selectedTraits),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-base font-semibold">Overall Rating</Label>
        <p className="text-sm text-muted-foreground mb-2">How was your experience?</p>
        <StarRating rating={overall} interactive onChange={setOverall} size="lg" />
      </div>

      <div>
        <Label className="text-base font-semibold">What stood out?</Label>
        <p className="text-sm text-muted-foreground mb-3">Tap all that apply</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {REVIEW_TRAITS.map(trait => (
            <TraitBadge
              key={trait}
              trait={trait}
              selected={selectedTraits.has(trait)}
              interactive
              onClick={() => toggleTrait(trait)}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1 h-12">
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={overall === 0 || loading}
          className="flex-1 h-12 text-base"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Review
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
