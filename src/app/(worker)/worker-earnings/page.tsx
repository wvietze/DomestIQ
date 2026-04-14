'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'

type Period = 'week' | 'month' | 'year' | 'all'

interface EarningsSummary {
  total_earnings: number
  total_bookings: number
  avg_booking_value: number
  currency: string
}

interface TransactionRecord {
  id: string
  booking_id: string
  worker_amount: number
  paid_at: string
  status: string
}

interface IncomeStatement {
  id: string
  period_start: string
  period_end: string
  total_earnings: number
  total_bookings: number
  verification_hash: string
  is_shared: boolean
  generated_at: string
}

const PERIOD_LABELS: Record<Period, string> = {
  week: 'Week',
  month: 'Month',
  year: 'Year',
  all: 'All Time',
}

export default function WorkerEarningsPage() {
  const supabase = createClient()
  const { user, isLoading: userLoading } = useUser()

  const [period, setPeriod] = useState<Period>('month')
  const [summary, setSummary] = useState<EarningsSummary | null>(null)
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [statements, setStatements] = useState<IncomeStatement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (!user) return

    async function fetchEarnings() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/income?period=${period}`)
        if (res.ok) {
          const data = await res.json()
          setSummary(data.summary)
          setTransactions(data.transactions)
          setStatements(data.statements)
        }
      } catch (err) {
        console.error('Failed to fetch earnings:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEarnings()
  }, [user, period, supabase])

  const handleGenerateStatement = async () => {
    setIsGenerating(true)
    try {
      const now = new Date()
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split('T')[0]

      const res = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: firstOfMonth }),
      })

      if (res.ok) {
        const refreshRes = await fetch(`/api/income?period=${period}`)
        if (refreshRes.ok) {
          const data = await refreshRes.json()
          setStatements(data.statements)
        }
      }
    } catch (err) {
      console.error('Failed to generate statement:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const formatCurrency = (amount: number) =>
    `R${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`

  const formatShortDate = (dateStr: string) =>
    new Date(dateStr)
      .toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
      .toUpperCase()

  const formatMonthYear = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-ZA', {
      month: 'long',
      year: 'numeric',
    })

  if (userLoading || (isLoading && !summary)) {
    return (
      <div className="min-h-screen bg-[#f9f9f7] flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-[#6e7a73] animate-spin">
          progress_activity
        </span>
      </div>
    )
  }

  const totalEarnings = summary?.total_earnings || 0
  const totalBookings = summary?.total_bookings || 0
  const avgPerJob = summary?.avg_booking_value || 0

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
          Earnings &amp; History
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
            Total Earned this {PERIOD_LABELS[period]}
          </p>
          <h2 className="font-heading font-extrabold text-4xl text-[#1a1c1b] tracking-tight">
            {formatCurrency(totalEarnings)}
          </h2>
          <div className="flex items-center gap-8 mt-5 pt-5 border-t border-[#f4f4f2]">
            <div>
              <p className="text-[#3e4943] text-[10px] font-bold uppercase tracking-wider">
                Jobs Completed
              </p>
              <p className="font-heading font-bold text-xl text-[#005d42] mt-0.5">
                {totalBookings}
              </p>
            </div>
            <div>
              <p className="text-[#3e4943] text-[10px] font-bold uppercase tracking-wider">
                Avg per Job
              </p>
              <p className="font-heading font-bold text-xl text-[#904d00] mt-0.5">
                {formatCurrency(avgPerJob)}
              </p>
            </div>
          </div>
        </section>

        {/* Recent Jobs List */}
        <section className="mt-10">
          <h3 className="font-heading font-bold text-lg text-[#1a1c1b] mb-6">
            Recent Jobs
          </h3>
          {transactions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center">
              <span className="material-symbols-outlined text-5xl text-[#bdc9c1] mb-3">
                work_history
              </span>
              <p className="text-[#3e4943] font-medium">
                No completed jobs yet
              </p>
              <p className="text-sm text-[#6e7a73] mt-1">
                Your completed work will be tracked here
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex justify-between items-start"
                >
                  <div className="flex gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-[#e8e8e6] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#005d42]">
                        cleaning_services
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#1a1c1b] truncate">
                        Completed Job
                      </p>
                      <p className="text-sm text-[#3e4943]">
                        {tx.status}
                      </p>
                      <p className="text-[11px] font-bold text-[#3e4943] mt-1 uppercase tracking-wider">
                        {tx.paid_at ? formatShortDate(tx.paid_at) : 'Pending'}
                      </p>
                    </div>
                  </div>
                  <p className="font-heading font-extrabold text-[#1a1c1b] shrink-0">
                    {formatCurrency(Number(tx.worker_amount))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Financial Verification Section */}
        <section className="mt-12 bg-[#eeeeec] rounded-xl p-6 border border-[#bdc9c1]/40">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-[#005d42]">
              verified_user
            </span>
            <h3 className="font-heading font-bold text-lg text-[#1a1c1b]">
              Financial Verification
            </h3>
          </div>
          <p className="text-[#3e4943] text-sm leading-relaxed mb-6">
            Generate a verifiable income statement for banks, landlords, or loan
            applications. Your work history at DomestIQ serves as official proof
            of earnings.
          </p>
          <button
            type="button"
            onClick={handleGenerateStatement}
            disabled={isGenerating}
            className="w-full py-4 bg-[#005d42] text-white font-bold rounded-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isGenerating ? (
              <span className="material-symbols-outlined animate-spin">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-base">
                picture_as_pdf
              </span>
            )}
            {isGenerating ? 'Generating...' : 'Generate Statement'}
          </button>

          {/* Previous Statements */}
          {statements.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[#bdc9c1]/40">
              <p className="text-[10px] font-bold text-[#3e4943] uppercase tracking-widest mb-4">
                Previous Statements
              </p>
              <div className="space-y-2">
                {statements.map((stmt) => (
                  <div
                    key={stmt.id}
                    className="flex items-center justify-between bg-white p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="material-symbols-outlined text-[#3e4943] shrink-0">
                        description
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-[#1a1c1b] truncate">
                          {formatMonthYear(stmt.period_start)} —{' '}
                          {formatCurrency(Number(stmt.total_earnings))}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] font-bold text-[#005d42] uppercase">
                            Verified
                          </span>
                          <span className="material-symbols-outlined text-xs text-[#005d42]">
                            check_circle
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        className="p-2 rounded hover:bg-[#f4f4f2] transition-colors text-[#3e4943]"
                        aria-label="Share"
                      >
                        <span className="material-symbols-outlined text-lg">
                          share
                        </span>
                      </button>
                      <button
                        type="button"
                        className="p-2 rounded hover:bg-[#f4f4f2] transition-colors text-[#3e4943]"
                        aria-label="Download"
                      >
                        <span className="material-symbols-outlined text-lg">
                          download
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
