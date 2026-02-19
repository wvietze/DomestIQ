'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { StarRating } from '@/components/ui/star-rating'
import { Loader2, Send } from 'lucide-react'

interface ReviewFormProps {
  bookingId: string
  revieweeId: string
  onSubmit: (review: { bookingId: string; revieweeId: string; overall_rating: number; punctuality: number; quality: number; communication: number; comment: string }) => Promise<void>
  onCancel?: () => void
}

export function ReviewForm({ bookingId, revieweeId, onSubmit, onCancel }: ReviewFormProps) {
  const [overall, setOverall] = useState(0)
  const [punctuality, setPunctuality] = useState(0)
  const [quality, setQuality] = useState(0)
  const [communication, setCommunication] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (overall === 0) return
    setLoading(true)
    try {
      await onSubmit({ bookingId, revieweeId, overall_rating: overall, punctuality: punctuality || overall, quality: quality || overall, communication: communication || overall, comment: comment.trim() })
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-base font-semibold">Overall Rating</Label>
        <p className="text-sm text-muted-foreground mb-2">How was your experience?</p>
        <StarRating rating={overall} interactive onChange={setOverall} size="lg" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div><Label className="text-sm">Punctuality</Label><div className="mt-1"><StarRating rating={punctuality} interactive onChange={setPunctuality} size="sm" /></div></div>
        <div><Label className="text-sm">Quality</Label><div className="mt-1"><StarRating rating={quality} interactive onChange={setQuality} size="sm" /></div></div>
        <div><Label className="text-sm">Communication</Label><div className="mt-1"><StarRating rating={communication} interactive onChange={setCommunication} size="sm" /></div></div>
      </div>
      <div>
        <Label htmlFor="comment">Comment (optional)</Label>
        <Textarea id="comment" placeholder="Tell others about your experience..." value={comment} onChange={e => setComment(e.target.value)} rows={3} className="mt-1 text-base" />
      </div>
      <div className="flex gap-3">
        {onCancel && <Button variant="outline" onClick={onCancel} className="flex-1 h-12">Cancel</Button>}
        <Button onClick={handleSubmit} disabled={overall === 0 || loading} className="flex-1 h-12 text-base">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" />Submit Review</>}
        </Button>
      </div>
    </div>
  )
}
