'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ReferenceCard } from '@/components/reference/reference-card'
import { Loader2, Star, Sparkles, ArrowRight } from 'lucide-react'

interface SharedData {
  worker: {
    full_name: string
    avatar_url: string | null
    rating: number | null
    review_count: number | null
    services: string[] | null
  }
  references: Array<{
    id: string
    reference_text: string
    relationship: 'employer' | 'client' | 'regular_client'
    duration_months: number | null
    created_at: string
    client: { full_name: string } | null
  }>
  expires_at: string
}

export default function PublicReferencePage() {
  const params = useParams()
  const token = params.token as string
  const [data, setData] = useState<SharedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/references/share?token=${token}`)
        if (!res.ok) {
          const err = await res.json()
          setError(err.error || 'Link not found')
          setLoading(false)
          return
        }
        const json = await res.json()
        setData(json)
      } catch {
        setError('Failed to load references')
      }
      setLoading(false)
    }
    if (token) fetchData()
  }, [token])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-xl font-bold mb-2">Link Not Available</h2>
            <p className="text-muted-foreground mb-4">{error || 'This link may have expired.'}</p>
            <Link href="/">
              <Button variant="outline">Go to DomestIQ</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { worker, references } = data
  const initials = worker.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gradient-brand">DomestIQ</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Worker Info */}
        <div className="text-center">
          <Avatar className="w-20 h-20 mx-auto mb-3">
            <AvatarImage src={worker.avatar_url || undefined} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold">{worker.full_name}</h1>
          {worker.services && worker.services.length > 0 && (
            <p className="text-sm text-blue-600 mt-1">{worker.services.join(', ')}</p>
          )}
          {worker.rating && worker.review_count ? (
            <div className="flex items-center justify-center gap-1 mt-2 text-sm">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{Number(worker.rating).toFixed(1)}</span>
              <span className="text-muted-foreground">({worker.review_count} reviews)</span>
            </div>
          ) : null}
        </div>

        {/* References */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {references.length} Reference{references.length !== 1 ? 's' : ''}
          </h2>
          <div className="space-y-4">
            {references.map(ref => (
              <ReferenceCard
                key={ref.id}
                reference={{
                  ...ref,
                  client: ref.client ? { ...ref.client, avatar_url: null } : undefined,
                }}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950/30 dark:to-emerald-950/30">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-1">Need a trusted worker?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Join DomestIQ to find verified domestic workers with real references.
            </p>
            <Link href="/auth/register">
              <Button className="gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
