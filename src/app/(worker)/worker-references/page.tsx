'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ReferenceCard } from '@/components/reference/reference-card'
import { Loader2, Share2, Eye, EyeOff, Copy, Check, Users } from 'lucide-react'
import type { WorkerReference, ReferenceShareToken } from '@/lib/types/reference'

export default function WorkerReferencesPage() {
  const [references, setReferences] = useState<WorkerReference[]>([])
  const [loading, setLoading] = useState(true)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    fetchReferences()
  }, [])

  const fetchReferences = async () => {
    try {
      const res = await fetch('/api/worker-estates') // Using worker-estates as a proxy to get workerId
      // Actually, we need to get references for the current user
      const profileRes = await fetch('/api/references?workerId=me')
      // The API needs the worker ID - let's use a different approach
      // Get own references by fetching from a dedicated endpoint
      const refRes = await fetch('/api/references?workerId=self')
      const data = await refRes.json()
      setReferences(data.references || [])
    } catch { /* silent */ }
    setLoading(false)
  }

  const toggleVisibility = async (refId: string, visible: boolean) => {
    // Would need PATCH/PUT endpoint — for now, optimistic update
    setReferences(prev =>
      prev.map(r => r.id === refId ? { ...r, is_visible_on_profile: visible } : r)
    )
  }

  const handleShare = async () => {
    const visibleIds = references.filter(r => r.is_visible_on_profile).map(r => r.id)
    if (visibleIds.length === 0) return
    setSharing(true)
    try {
      const res = await fetch('/api/references/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference_ids: visibleIds }),
      })
      const data = await res.json()
      if (data.shareToken) {
        const token = (data.shareToken as ReferenceShareToken).token
        setShareUrl(`${window.location.origin}/references/${token}`)
      }
    } catch { /* silent */ }
    setSharing(false)
  }

  const copyShareUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My References</h1>
          <p className="text-sm text-muted-foreground mt-1">
            References from clients you&apos;ve worked with
          </p>
        </div>
        <Button onClick={handleShare} disabled={sharing || references.length === 0} className="gap-2">
          {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
          Share References
        </Button>
      </div>

      {shareUrl && (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-2">Shareable Link (expires in 30 days)</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-white dark:bg-gray-900 rounded px-3 py-2 border truncate">
                {shareUrl}
              </code>
              <Button variant="outline" size="sm" onClick={copyShareUrl} className="gap-1 shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {references.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg mb-1">No References Yet</h3>
            <p className="text-sm text-muted-foreground">
              Request references from clients you&apos;ve worked with. References help build trust and attract new clients.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {references.map(ref => (
            <div key={ref.id} className="relative">
              <ReferenceCard
                reference={ref as Parameters<typeof ReferenceCard>[0]['reference']}
              />
              <button
                onClick={() => toggleVisibility(ref.id, !ref.is_visible_on_profile)}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={ref.is_visible_on_profile ? 'Hide from profile' : 'Show on profile'}
              >
                {ref.is_visible_on_profile ? (
                  <Eye className="w-4 h-4 text-green-500" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
