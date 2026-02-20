'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, ExternalLink } from 'lucide-react'

interface AdData {
  id: string
  advertiser_name: string
  advertiser_logo_url: string | null
  headline: string
  description: string | null
  image_url: string | null
  cta_text: string
  cta_url: string
}

interface DashboardAdProps {
  placement: string
  role: string
  service?: string
}

export function DashboardAd({ placement, role, service }: DashboardAdProps) {
  const [ad, setAd] = useState<AdData | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    async function fetchAd() {
      try {
        const params = new URLSearchParams({ placement, role })
        if (service) params.set('service', service)
        const res = await fetch(`/api/ads/serve?${params}`)
        if (!res.ok) return
        const data = await res.json()
        if (data.ad) setAd(data.ad)
      } catch {
        // Non-critical, ignore
      }
    }
    fetchAd()
  }, [placement, role, service])

  if (!ad || dismissed) return null

  const handleClick = async () => {
    try {
      await fetch('/api/ads/serve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad_id: ad.id }),
      })
    } catch {
      // Non-critical
    }
  }

  return (
    <Card className="overflow-hidden border-dashed">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {ad.image_url ? (
            <img src={ad.image_url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
          ) : ad.advertiser_logo_url ? (
            <img src={ad.advertiser_logo_url} alt={ad.advertiser_name} className="w-10 h-10 rounded-lg object-contain shrink-0" />
          ) : null}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-sm">{ad.headline}</p>
              <button
                onClick={() => setDismissed(true)}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                aria-label="Dismiss ad"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {ad.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{ad.description}</p>
            )}
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-muted-foreground/60">Ad &middot; {ad.advertiser_name}</span>
              <a
                href={ad.cta_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
              >
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  {ad.cta_text}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
