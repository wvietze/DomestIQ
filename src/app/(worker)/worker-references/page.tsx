'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { WorkerReference, ReferenceShareToken } from '@/lib/types/reference'

export default function WorkerReferencesPage() {
  const [references, setReferences] = useState<WorkerReference[]>([])
  const [loading, setLoading] = useState(true)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [sharing, setSharing] = useState(false)

  const fetchReferences = useCallback(async () => {
    try {
      const refRes = await fetch('/api/references?workerId=self')
      const data = await refRes.json()
      setReferences(data.references || [])
    } catch {
      /* silent */
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReferences()
  }, [fetchReferences])

  const toggleVisibility = (refId: string, visible: boolean) => {
    setReferences((prev) =>
      prev.map((r) =>
        r.id === refId ? { ...r, is_visible_on_profile: visible } : r
      )
    )
  }

  const handleShare = async () => {
    const visibleIds = references
      .filter((r) => r.is_visible_on_profile)
      .map((r) => r.id)
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
    } catch {
      /* silent */
    }
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
      <div className="min-h-screen bg-[#f9f9f7] flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-[#6e7a73] animate-spin">
          progress_activity
        </span>
      </div>
    )
  }

  const visibleCount = references.filter((r) => r.is_visible_on_profile).length

  return (
    <div className="min-h-screen bg-[#f9f9f7] pb-16">
      {/* Top App Bar */}
      <header className="bg-[#f9f9f7] sticky top-0 z-40 flex items-center px-4 h-16 border-b border-[#e8e8e6]/40">
        <Link
          href="/worker-profile/edit"
          className="p-2 -ml-2 rounded-full hover:bg-[#e8e8e6] active:scale-95 transition-all text-[#005d42]"
          aria-label="Back"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="ml-2 font-heading font-bold tracking-tight text-lg text-[#1a1c1b]">
          References
        </h1>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-6 pb-8">
        {/* Stats Row */}
        <section className="flex justify-between items-center mb-6 gap-4">
          <div className="flex flex-col min-w-0">
            <span className="font-heading text-2xl font-bold text-[#1a1c1b] tracking-tight">
              {references.length}{' '}
              {references.length === 1 ? 'Reference' : 'References'}
            </span>
            <span className="text-[11px] font-semibold tracking-wide text-[#3e4943] uppercase">
              Management Dashboard
            </span>
          </div>
          <button
            type="button"
            onClick={handleShare}
            disabled={sharing || visibleCount === 0}
            className="flex items-center gap-2 px-4 py-2 border-2 border-[#005d42] text-[#005d42] rounded-lg text-xs font-bold hover:bg-[#97f5cc]/20 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {sharing ? (
              <span className="material-symbols-outlined text-sm animate-spin">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-sm">share</span>
            )}
            Generate Link
          </button>
        </section>

        {/* Share URL Card */}
        {shareUrl && (
          <section className="bg-[#e8e8e6] rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#904d00]">
                stars
              </span>
              <span className="font-heading font-bold text-[#1a1c1b] text-sm">
                Shareable Link (expires in 30 days)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white rounded-lg h-10 px-3 flex items-center justify-between border border-[#bdc9c1]/50">
                <span className="text-[12px] text-[#3e4943] truncate">
                  {shareUrl}
                </span>
              </div>
              <button
                type="button"
                onClick={copyShareUrl}
                className="bg-[#005d42] text-white w-10 h-10 rounded-lg flex items-center justify-center shadow-sm active:scale-[0.98] transition-transform"
                aria-label={copied ? 'Copied' : 'Copy link'}
              >
                <span className="material-symbols-outlined text-lg">
                  {copied ? 'check' : 'content_copy'}
                </span>
              </button>
            </div>
          </section>
        )}

        {/* Reference Cards */}
        {references.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <span className="material-symbols-outlined text-5xl text-[#bdc9c1] mb-3">
              group
            </span>
            <h3 className="font-heading font-bold text-lg text-[#1a1c1b] mb-1">
              No References Yet
            </h3>
            <p className="text-sm text-[#3e4943]">
              Request references from clients you&apos;ve worked with.
              References help build trust and attract new clients.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {references.map((ref) => {
              const visible = ref.is_visible_on_profile
              const relationshipLabel =
                ref.relationship === 'regular_client'
                  ? 'Regular Client'
                  : ref.relationship === 'employer'
                    ? 'Employer'
                    : 'Client'

              return (
                <div
                  key={ref.id}
                  className={`p-4 rounded-lg transition-all ${
                    visible
                      ? 'bg-white border-l-4 border-[#005d42] shadow-sm'
                      : 'bg-[#f4f4f2] opacity-70'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-heading font-bold text-[#1a1c1b] text-base truncate">
                        {ref.client_name || 'Client'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            ref.relationship === 'employer'
                              ? 'bg-[#ffdcc3] text-[#904d00]'
                              : 'bg-[#97f5cc] text-[#005d42]'
                          }`}
                        >
                          {relationshipLabel}
                        </span>
                        {ref.duration_months != null && (
                          <span className="text-[#3e4943] text-[11px] font-medium">
                            {ref.duration_months >= 12
                              ? `${Math.floor(ref.duration_months / 12)} ${
                                  Math.floor(ref.duration_months / 12) === 1
                                    ? 'year'
                                    : 'years'
                                }`
                              : `${ref.duration_months} months`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => toggleVisibility(ref.id, !visible)}
                      className={`w-11 h-6 rounded-full relative p-0.5 shrink-0 transition-colors ${
                        visible ? 'bg-[#005d42]' : 'bg-[#bdc9c1]'
                      }`}
                      aria-label={visible ? 'Hide from profile' : 'Show on profile'}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${
                          visible ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[#3e4943] text-sm italic leading-relaxed line-clamp-2 mt-3">
                    &ldquo;{ref.reference_text}&rdquo;
                  </p>
                </div>
              )
            })}
          </div>
        )}

        {/* Help footer */}
        {references.length > 0 && (
          <div className="bg-[#f4f4f2] rounded-xl p-5 mt-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#005d42] shrink-0">
                info
              </span>
              <p className="text-sm text-[#3e4943] leading-relaxed">
                Toggle visibility to control which references appear on your
                public profile. Use &ldquo;Generate Link&rdquo; to share a
                verified collection with a prospective client.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
