'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { CvRenderData } from '@/lib/types/cv'

interface CvPreviewProps {
  data: CvRenderData
}

export function CvPreview({ data }: CvPreviewProps) {
  return (
    <Card className="bg-white max-w-2xl mx-auto">
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="border-b border-[#e8e8e6] pb-4">
          <h1 className="text-2xl font-bold text-[#1a1c1b]">{data.full_name}</h1>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-[#3e4943]">
            {data.phone && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">phone</span>{data.phone}</span>}
            {data.email && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">mail</span>{data.email}</span>}
            {(data.suburb || data.city) && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">location_on</span>{[data.suburb, data.city].filter(Boolean).join(', ')}</span>}
          </div>
          {data.services.length > 0 && (
            <p className="text-sm text-[#005d42] mt-1">{data.services.join(' | ')}</p>
          )}
          {data.rating && data.review_count ? (
            <div className="flex items-center gap-1 mt-1 text-sm">
              <span className="material-symbols-outlined text-sm text-[#fe932c]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="font-medium text-[#1a1c1b]">{data.rating.toFixed(1)}</span>
              <span className="text-[#3e4943]">({data.review_count} reviews)</span>
            </div>
          ) : null}
        </div>

        {/* Personal Statement */}
        {data.personal_statement && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#3e4943] mb-2">About Me</h2>
            <p className="text-sm text-[#1a1c1b] leading-relaxed">{data.personal_statement}</p>
          </div>
        )}

        {/* Work History */}
        {data.work_history.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#3e4943] mb-3">Work Experience</h2>
            <div className="space-y-3">
              {data.work_history.map((w, i) => (
                <div key={i} className="border-l-2 border-[#9ffdd3] pl-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm text-[#1a1c1b]">{w.role}</p>
                      <p className="text-sm text-[#3e4943]">{w.employer}</p>
                    </div>
                    <p className="text-xs text-[#3e4943] whitespace-nowrap">
                      {w.start_date} — {w.end_date || 'Present'}
                    </p>
                  </div>
                  {w.description && <p className="text-xs text-[#1a1c1b]/80 mt-1">{w.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#3e4943] mb-3">Education</h2>
            <div className="space-y-2">
              {data.education.map((e, i) => (
                <div key={i} className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm text-[#1a1c1b]">{e.qualification}</p>
                    <p className="text-sm text-[#3e4943]">{e.institution}</p>
                  </div>
                  <p className="text-xs text-[#3e4943]">{e.year}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills & Languages */}
        <div className="grid grid-cols-2 gap-6">
          {data.skills.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#3e4943] mb-2">Skills</h2>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-[#f4f4f2] text-[#1a1c1b] rounded text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}
          {data.languages.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#3e4943] mb-2">Languages</h2>
              <div className="flex flex-wrap gap-1.5">
                {data.languages.map((l, i) => (
                  <span key={i} className="px-2 py-0.5 bg-[#f4f4f2] text-[#1a1c1b] rounded text-xs">{l}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Service Areas */}
        {data.service_areas && data.service_areas.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#3e4943] mb-2">Service Areas</h2>
            <div className="flex flex-wrap gap-1.5">
              {data.service_areas.map((area, i) => (
                <span key={i} className="px-2 py-0.5 bg-[#9ffdd3]/30 text-[#005d42] rounded text-xs">
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Top Traits */}
        {data.top_traits && Object.keys(data.top_traits).length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#3e4943] mb-2">Client Feedback</h2>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(data.top_traits)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([trait, count]) => (
                  <span key={trait} className="px-2 py-0.5 bg-[#ffdcc3]/40 text-[#904d00] rounded text-xs">
                    {trait} ({count})
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 border-t border-[#e8e8e6]">
          <p className="text-[10px] text-[#3e4943]">
            Generated via DomestIQ &middot; domestiq.co.za
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
