'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Mail, Phone, MapPin, Star } from 'lucide-react'
import type { CvRenderData } from '@/lib/types/cv'

interface CvPreviewProps {
  data: CvRenderData
}

export function CvPreview({ data }: CvPreviewProps) {
  return (
    <Card className="bg-white dark:bg-gray-950 max-w-2xl mx-auto">
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold text-foreground">{data.full_name}</h1>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
            {data.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{data.phone}</span>}
            {data.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{data.email}</span>}
            {(data.suburb || data.city) && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{[data.suburb, data.city].filter(Boolean).join(', ')}</span>}
          </div>
          {data.services.length > 0 && (
            <p className="text-sm text-blue-600 mt-1">{data.services.join(' | ')}</p>
          )}
          {data.rating && data.review_count ? (
            <div className="flex items-center gap-1 mt-1 text-sm">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{data.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({data.review_count} reviews)</span>
            </div>
          ) : null}
        </div>

        {/* Personal Statement */}
        {data.personal_statement && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">About Me</h2>
            <p className="text-sm text-foreground leading-relaxed">{data.personal_statement}</p>
          </div>
        )}

        {/* Work History */}
        {data.work_history.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Work Experience</h2>
            <div className="space-y-3">
              {data.work_history.map((w, i) => (
                <div key={i} className="border-l-2 border-blue-200 pl-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{w.role}</p>
                      <p className="text-sm text-muted-foreground">{w.employer}</p>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {w.start_date} — {w.end_date || 'Present'}
                    </p>
                  </div>
                  {w.description && <p className="text-xs text-foreground/80 mt-1">{w.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Education</h2>
            <div className="space-y-2">
              {data.education.map((e, i) => (
                <div key={i} className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{e.qualification}</p>
                    <p className="text-sm text-muted-foreground">{e.institution}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{e.year}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills & Languages */}
        <div className="grid grid-cols-2 gap-6">
          {data.skills.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Skills</h2>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}
          {data.languages.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Languages</h2>
              <div className="flex flex-wrap gap-1.5">
                {data.languages.map((l, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">{l}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Service Areas */}
        {data.service_areas && data.service_areas.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Service Areas</h2>
            <div className="flex flex-wrap gap-1.5">
              {data.service_areas.map((area, i) => (
                <span key={i} className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded text-xs">
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Top Traits */}
        {data.top_traits && Object.keys(data.top_traits).length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Client Feedback</h2>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(data.top_traits)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([trait, count]) => (
                  <span key={trait} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded text-xs">
                    {trait} ({count})
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 border-t">
          <p className="text-[10px] text-muted-foreground">
            Generated via DomestIQ &middot; domestiq.co.za
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
