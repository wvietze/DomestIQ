'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Send, Quote } from 'lucide-react'

function WriteReferenceContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const workerId = searchParams.get('workerId')
  const workerName = searchParams.get('workerName') || 'this worker'

  const [referenceText, setReferenceText] = useState('')
  const [relationship, setRelationship] = useState('')
  const [durationMonths, setDurationMonths] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!workerId || !referenceText || !relationship) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker_id: workerId,
          reference_text: referenceText,
          relationship,
          duration_months: durationMonths ? parseInt(durationMonths) : null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to submit reference')
        return
      }

      setSuccess(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!workerId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Missing worker ID.</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mx-auto mb-4">
              <Quote className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Reference Submitted</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for writing a reference for {workerName}. It will appear on their profile.
            </p>
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Quote className="w-5 h-5 text-blue-500" />
            Write a Reference for {workerName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label>Your relationship</Label>
            <Select value={relationship} onValueChange={setRelationship}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select relationship type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employer">Employer (they work for me regularly)</SelectItem>
                <SelectItem value="regular_client">Regular Client (booked multiple times)</SelectItem>
                <SelectItem value="client">Client (one-time booking)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>How long have they worked for you?</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                value={durationMonths}
                onChange={e => setDurationMonths(e.target.value)}
                placeholder="e.g. 12"
                min={1}
                max={240}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">months</span>
            </div>
          </div>

          <div>
            <Label>Reference</Label>
            <Textarea
              value={referenceText}
              onChange={e => setReferenceText(e.target.value)}
              placeholder="Describe your experience working with them. What makes them a great worker? How reliable are they? What would you tell someone considering hiring them?"
              rows={5}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {referenceText.length}/2000 characters (minimum 20)
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            onClick={handleSubmit}
            disabled={!referenceText || !relationship || referenceText.length < 20 || loading}
            className="w-full h-12"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <><Send className="w-4 h-4 mr-2" />Submit Reference</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function WriteReferencePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>}>
      <WriteReferenceContent />
    </Suspense>
  )
}
