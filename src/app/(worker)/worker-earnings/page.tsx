'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useUser } from '@/lib/hooks/use-user'

type Period = 'week' | 'month' | 'year' | 'all'

interface CompletedBooking {
  id: string
  client_id: string
  status: string
  scheduled_date: string
  completed_at: string | null
  created_at: string
  service: { id: string; name: string; category: string | null } | null
  client: { id: string; full_name: string | null; avatar_url: string | null } | null
}

interface ReceivedReview {
  id: string
  rating: number
  comment: string | null
  created_at: string
  reviewer: { id: string; full_name: string | null } | null
  booking: { id: string; service: { id: string; name: string } | null } | null
}

const PERIOD_LABELS: Record<Period, string> = {
  week: 'Week',
  month: 'Month',
  year: 'Year',
  all: 'All Time',
}

function periodCutoff(period: Period): Date | null {
  const now = new Date()
  if (period === 'week') {
    const d = new Date(now)
    d.setDate(d.getDate() - 7)
    return d
  }
  if (period === 'month') {
    const d = new Date(now)
    d.setMonth(d.getMonth() - 1)
    return d
  }
  if (period === 'year') {
    const d = new Date(now)
    d.setFullYear(d.getFullYear() - 1)
    return d
  }
  return null
}

export default function WorkerHistoryPage() {
  const { user, isLoading: userLoading } = useUser()

  const [period, setPeriod] = useState<Period>('month')
  const [bookings, setBookings] = useState<CompletedBooking[]>([])
  const [reviews, setReviews] = useState<ReceivedReview[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    async function fetchHistory() {
      setIsLoading(true)
      try {
        const [bookingsRes, reviewsRes] = await Promise.all([
          fetch('/api/bookings?status=completed&limit=100'),
          fetch(`/api/reviews?userId=${user!.id}&limit=100`),
        ])

        if (bookingsRes.ok) {
          const data = await bookingsRes.json()
          setBookings((data.bookings as CompletedBooking[]) || [])
        }
        if (reviewsRes.ok) {
          const data = await reviewsRes.json()
          setReviews((data.reviews as ReceivedReview[]) || [])
        }
      } catch (err) {
        console.error('Failed to fetch work history:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [user])

  // ---------------------------------------------------------------------------
  // Derived data — filtered by selected period, no money involved
  // ---------------------------------------------------------------------------

  const bookingDate = (b: CompletedBooking) =>
    new Date(b.completed_at || b.scheduled_date || b.created_at)

  const periodBookings = useMemo(() => {
    const cutoff = periodCutoff(period)
    if (!cutoff) return bookings
    return bookings.filter((b) => bookingDate(b) >= cutoff)
  }, [bookings, period])

  const jobsCompleted = periodBookings.length

  const repeatClients = useMemo(() => {
    const counts = new Map<string, number>()
    for (const b of periodBookings) {
      if (!b.client_id) continue
      counts.set(b.client_id, (counts.get(b.client_id) || 0) + 1)
    }
    let repeats = 0
    counts.forEach((count) => {
      if (count > 1) repeats += 1
    })
    return repeats
  }, [periodBookings])

  const periodReviews = useMemo(() => {
    const cutoff = periodCutoff(period)
    if (!cutoff) return reviews
    return reviews.filter((r) => new Date(r.created_at) >= cutoff)
  }, [reviews, period])

  const averageRating = useMemo(() => {
    if (periodReviews.length === 0) return null
    const sum = periodReviews.reduce((acc, r) => acc + Number(r.rating || 0), 0)
    return sum / periodReviews.length
  }, [periodReviews])

  // ---------------------------------------------------------------------------
  // Formatting helpers
  // ---------------------------------------------------------------------------

  const formatShortDate = (dateStr: string) =>
    new Date(dateStr)
      .toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f9f7] flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-[#6e7a73] animate-spin">
          progress_activity
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f9f7] pb-16">
      {/* Top App Bar */}
      <header className="bg-[#f9f9f7] sticky top-0 z-40 flex items-center px-4 h-16 border-b border-[#e8e8e6]/40">
        <Link
          href="/worker-dashboard"
          className="p-2 -ml-2 rounded-full hover:bg-[#e8e8e6] active:scale-95 transition-all text-[#005d42]"
          aria-label="Back"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="ml-2 font-heading font-bold tracking-tight text-lg text-[#1a1c1b]">
          Work History
        </h1>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-4">
        {/* Period Filter */}
        <div className="flex items-center gap-2 overflow-x-auto py-4 no-scrollbar">
          {(['week', 'month', 'year', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors active:scale-[0.98] ${
                period === p
                  ? 'bg-[#005d42] text-white shadow-sm'
                  : 'bg-[#e8e8e6] text-[#3e4943]'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Summary Stats Card */}
        <section className="mt-4 bg-white rounded-xl p-6 shadow-sm border-l-4 border-[#005d42]">
          <p className="text-[#3e4943] font-semibold text-xs uppercase tracking-widest mb-1">
            Jobs Completed this {PERIOD_LABELS[period]}
          </p>
          <h2 className="font-heading font-extrabold text-4xl text-[#1a1c1b] tracking-tight">
            {jobsCompleted}
          </h2>
          <div className="flex items-center gap-8 mt-5 pt-5 border-t border-[#f4f4f2]">
            <div>
              <p className="text-[#3e4943] text-[10px] font-bold uppercase tracking-wider">
                Repeat Clients
              </p>
              <p className="font-heading font-bold text-xl text-[#005d42] mt-0.5">
                {repeatClients}
              </p>
            </div>
            <div>
              <p className="text-[#3e4943] text-[10px] font-bold uppercase tracking-wider">
                Average Rating
              </p>
              <p className="font-heading font-bold text-xl text-[#904d00] mt-0.5 flex items-center gap-1">
                {averageRating !== null ? (
                  <>
                    {averageRating.toFixed(1)}
                    <span className="material-symbols-outlined text-[18px] text-[#904d00]">
                      star
                    </span>
                  </>
                ) : (
                  <span className="text-[#6e7a73] text-base">—</span>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Completed Jobs List */}
        <section className="mt-10">
          <h3 className="font-heading font-bold text-lg text-[#1a1c1b] mb-6">
            Completed Jobs
          </h3>
          {periodBookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center">
              <span className="material-symbols-outlined text-5xl text-[#bdc9c1] mb-3">
                work_history
              </span>
              <p className="text-[#3e4943] font-medium">No completed jobs yet</p>
              <p className="text-sm text-[#6e7a73] mt-1">
                Your completed work will be tracked here
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {periodBookings.map((b) => (
                <div key={b.id} className="flex justify-between items-start">
                  <div className="flex gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-[#e8e8e6] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#005d42]">
                        cleaning_services
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#1a1c1b] truncate">
                        {b.service?.name || 'Completed Job'}
                      </p>
                      {b.client?.full_name && (
                        <p className="text-sm text-[#3e4943] truncate">
                          {b.client.full_name}
                        </p>
                      )}
                      <p className="text-[11px] font-bold text-[#3e4943] mt-1 uppercase tracking-wider">
                        {formatShortDate(
                          b.completed_at || b.scheduled_date || b.created_at
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-[#005d42] bg-[#ecfdf5] px-2.5 py-1 rounded-full uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Done
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reviews Received */}
        <section className="mt-12">
          <h3 className="font-heading font-bold text-lg text-[#1a1c1b] mb-6">
            Reviews Received
          </h3>
          {periodReviews.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center">
              <span className="material-symbols-outlined text-5xl text-[#bdc9c1] mb-3">
                reviews
              </span>
              <p className="text-[#3e4943] font-medium">No reviews yet</p>
              <p className="text-sm text-[#6e7a73] mt-1">
                Reviews from clients you have worked with will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {periodReviews.map((r) => (
                <div key={r.id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[#1a1c1b] truncate">
                        {r.reviewer?.full_name || 'A client'}
                      </p>
                      {r.booking?.service?.name && (
                        <p className="text-[11px] font-bold text-[#3e4943] uppercase tracking-wider mt-0.5">
                          {r.booking.service.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          className={`material-symbols-outlined text-[16px] ${
                            n <= Math.round(Number(r.rating))
                              ? 'text-[#904d00]'
                              : 'text-[#dcdedc]'
                          }`}
                          style={{
                            fontVariationSettings:
                              n <= Math.round(Number(r.rating)) ? "'FILL' 1" : "'FILL' 0",
                          }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-[#3e4943] leading-relaxed mt-2">
                      “{r.comment}”
                    </p>
                  )}
                  <p className="text-[11px] text-[#6e7a73] mt-2">
                    {formatShortDate(r.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
