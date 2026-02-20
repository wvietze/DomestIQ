'use client'

import { useState, useEffect } from 'react'
import { ExternalLink } from 'lucide-react'

interface SponsorData {
  id: string
  partner_name: string
  partner_logo_url: string | null
  headline: string
  description: string | null
  cta_text: string | null
  cta_url: string | null
  bg_color: string
  text_color: string
}

export function SponsorBadge({ placement }: { placement: string }) {
  const [sponsor, setSponsor] = useState<SponsorData | null>(null)

  useEffect(() => {
    async function fetchSponsor() {
      try {
        const res = await fetch(`/api/sponsors/active?placement=${placement}`)
        if (!res.ok) return
        const data = await res.json()
        if (data.sponsorships && data.sponsorships.length > 0) {
          setSponsor(data.sponsorships[0])
        }
      } catch {
        // Non-critical, ignore
      }
    }
    fetchSponsor()
  }, [placement])

  if (!sponsor) return null

  const handleClick = async () => {
    try {
      await fetch('/api/sponsors/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sponsorship_id: sponsor.id }),
      })
    } catch {
      // Non-critical
    }
  }

  return (
    <div
      className="rounded-xl p-3 flex items-center gap-3 text-sm"
      style={{ backgroundColor: sponsor.bg_color, color: sponsor.text_color }}
    >
      {sponsor.partner_logo_url ? (
        <img src={sponsor.partner_logo_url} alt={sponsor.partner_name} className="w-6 h-6 rounded object-contain" />
      ) : (
        <span className="w-6 h-6 rounded bg-white/20 flex items-center justify-center text-xs font-bold">
          {sponsor.partner_name.slice(0, 1)}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-xs leading-tight">{sponsor.headline}</p>
        {sponsor.description && (
          <p className="text-xs opacity-80 mt-0.5 truncate">{sponsor.description}</p>
        )}
      </div>
      {sponsor.cta_text && sponsor.cta_url && (
        <a
          href={sponsor.cta_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="inline-flex items-center gap-1 text-xs font-semibold whitespace-nowrap hover:opacity-80 transition-opacity"
          style={{ color: sponsor.text_color }}
        >
          {sponsor.cta_text}
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
      <span className="text-[10px] opacity-50">Sponsored</span>
    </div>
  )
}
