'use client'

import { useState } from 'react'
import { WaveBars } from '@/components/loading'
import { REVIEW_TRAITS, TRAIT_LABELS, type ReviewTrait } from '@/lib/types/review'

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
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [selectedTraits, setSelectedTraits] = useState<Set<ReviewTrait>>(new Set())
  const [loading, setLoading] = useState(false)

  const toggleTrait = (trait: ReviewTrait) => {
    setSelectedTraits((prev) => {
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
        comment: comment.trim() || undefined,
      })
    } finally {
      setLoading(false)
    }
  }

  const displayRating = hoverRating || overall

  return (
    <div className="flex flex-col gap-5">
      {/* Overall rating */}
      <section className="flex flex-col items-center gap-3">
        <h2 className="text-center font-heading font-bold tracking-tight text-[#1a1c1b]">
          How was your experience?
        </h2>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setOverall(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform active:scale-90"
              aria-label={`Rate ${star} star${star === 1 ? '' : 's'}`}
            >
              <span
                className={
                  star <= displayRating
                    ? 'material-symbols-outlined text-4xl text-[#904d00]'
                    : 'material-symbols-outlined text-4xl text-[#bdc9c1]'
                }
                style={
                  star <= displayRating
                    ? { fontVariationSettings: "'FILL' 1" }
                    : undefined
                }
              >
                star
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Traits */}
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#3e4943]">
          What stood out? Tap all that apply.
        </h3>
        <div className="flex flex-wrap gap-2">
          {REVIEW_TRAITS.map((trait) => {
            const selected = selectedTraits.has(trait)
            return (
              <button
                type="button"
                key={trait}
                onClick={() => toggleTrait(trait)}
                className={
                  selected
                    ? 'flex items-center gap-1 rounded-full border-2 border-[#005d42] bg-[#005d42]/5 px-3 py-1.5 text-xs font-semibold text-[#005d42] transition-all active:scale-95'
                    : 'rounded-full bg-[#e8e8e6] px-3 py-1.5 text-xs font-medium text-[#3e4943] transition-all hover:bg-[#bdc9c1] active:scale-95'
                }
              >
                {selected && (
                  <span className="material-symbols-outlined text-xs">check</span>
                )}
                {TRAIT_LABELS[trait]}
              </button>
            )
          })}
        </div>
      </section>

      {/* Comment */}
      <section className="flex flex-col gap-2">
        <label
          className="text-xs font-bold uppercase tracking-widest text-[#3e4943]"
          htmlFor="review-comment"
        >
          Share more (optional)
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell others about your experience…"
          rows={3}
          className="w-full rounded-lg border-none bg-[#f4f4f2] p-4 text-sm text-[#1a1c1b] placeholder:text-[#6e7a73] focus:outline-none focus:ring-2 focus:ring-[#005d42]"
        />
      </section>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="h-12 flex-1 rounded-lg border border-[#bdc9c1] bg-white font-bold text-[#1a1c1b] transition-colors hover:bg-[#f4f4f2] active:scale-[0.98]"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={overall === 0 || loading}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#005d42] font-heading font-bold text-white shadow-lg shadow-[#005d42]/10 transition-all active:scale-[0.98] disabled:opacity-40"
        >
          {loading ? (
            <WaveBars size="sm" />
          ) : (
            <>
              <span className="material-symbols-outlined text-lg">send</span>
              Submit Review
            </>
          )}
        </button>
      </div>
    </div>
  )
}
