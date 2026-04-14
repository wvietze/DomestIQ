'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PlatformStats {
  totalUsers: number
  totalWorkers: number
  totalClients: number
  totalBookings: number
  pendingVerifications: number
  pendingReports: number
  avgRating: number
}

interface Transaction {
  id: string
  created_at: string
  booking_id: string
  worker_amount: number
  platform_fee: number
  total_amount: number
  status: string
}

interface MonthlyRevenue {
  month: string
  label: string
  total: number
}

interface RevenueStats {
  totalRevenue: number
  monthRevenue: number
  totalTransactions: number
  pendingPayouts: number
}

function formatZAR(amount: number): string {
  return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function AdminDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  useEffect(() => {
    async function loadAllData() {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()

      const [
        { count: totalUsers },
        { count: totalWorkers },
        { count: totalClients },
        { count: totalBookings },
        { count: pendingVerifications },
        { count: pendingReports },
        ratingResult,
        totalRevenueResult,
        monthRevenueResult,
        { count: totalTransactions },
        { count: pendingPayouts },
        recentTxResult,
        monthlyRevenueResult,
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'worker'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('documents').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        supabase.from('report_flags').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('worker_profiles').select('overall_rating').gt('overall_rating', 0),
        supabase.from('revenue_ledger').select('platform_fee'),
        supabase.from('revenue_ledger').select('platform_fee').gte('created_at', monthStart),
        supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('worker_payouts').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase
          .from('transactions')
          .select('id, created_at, booking_id, worker_amount, platform_fee, total_amount, status')
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('revenue_ledger')
          .select('platform_fee, created_at')
          .gte('created_at', sixMonthsAgo)
          .order('created_at', { ascending: true }),
      ])

      const ratingData = ratingResult.data
      const avgRating = ratingData?.length
        ? ratingData.reduce((sum, w) => sum + Number(w.overall_rating), 0) / ratingData.length
        : 0

      const totalRevenue =
        totalRevenueResult.data?.reduce((sum, row) => sum + Number(row.platform_fee || 0), 0) ?? 0

      const monthRevenue =
        monthRevenueResult.data?.reduce((sum, row) => sum + Number(row.platform_fee || 0), 0) ?? 0

      const monthlyMap = new Map<string, number>()
      const monthLabels: string[] = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        monthlyMap.set(key, 0)
        monthLabels.push(key)
      }

      monthlyRevenueResult.data?.forEach((row) => {
        const date = new Date(row.created_at)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        if (monthlyMap.has(key)) {
          monthlyMap.set(key, (monthlyMap.get(key) || 0) + Number(row.platform_fee || 0))
        }
      })

      const grouped: MonthlyRevenue[] = monthLabels.map((key) => {
        const [year, month] = key.split('-')
        const d = new Date(Number(year), Number(month) - 1, 1)
        return {
          month: key,
          label: d.toLocaleDateString('en-ZA', { month: 'short' }),
          total: monthlyMap.get(key) || 0,
        }
      })

      setStats({
        totalUsers: totalUsers || 0,
        totalWorkers: totalWorkers || 0,
        totalClients: totalClients || 0,
        totalBookings: totalBookings || 0,
        pendingVerifications: pendingVerifications || 0,
        pendingReports: pendingReports || 0,
        avgRating: Math.round(avgRating * 10) / 10,
      })

      setRevenueStats({
        totalRevenue,
        monthRevenue,
        totalTransactions: totalTransactions || 0,
        pendingPayouts: pendingPayouts || 0,
      })

      setRecentTransactions(recentTxResult.data || [])
      setMonthlyRevenue(grouped)
      setIsLoading(false)
    }

    loadAllData()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-[#e8e8e6]" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-[#eeeeec]" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg bg-[#eeeeec]" />
            ))}
          </div>
          <div className="h-80 animate-pulse rounded-lg bg-[#eeeeec] lg:col-span-8" />
        </div>
        <div className="h-96 animate-pulse rounded-lg bg-[#eeeeec]" />
      </div>
    )
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, accent: 'border-[#005d42]', valueColor: 'text-[#1a1c1b]' },
    { label: 'Workers', value: stats?.totalWorkers ?? 0, accent: 'border-[#005d42]', valueColor: 'text-[#1a1c1b]' },
    { label: 'Clients', value: stats?.totalClients ?? 0, accent: 'border-[#005d42]', valueColor: 'text-[#1a1c1b]' },
    { label: 'Total Bookings', value: stats?.totalBookings ?? 0, accent: 'border-[#005d42]', valueColor: 'text-[#1a1c1b]' },
    { label: 'Pending Ver.', value: stats?.pendingVerifications ?? 0, accent: 'border-[#904d00]', valueColor: 'text-[#904d00]' },
    { label: 'Open Reports', value: stats?.pendingReports ?? 0, accent: 'border-[#ba1a1a]', valueColor: 'text-[#ba1a1a]' },
    { label: 'Avg Rating', value: stats?.avgRating || 'N/A', accent: 'border-[#005d42]', valueColor: 'text-[#1a1c1b]', showStar: true },
  ]

  const maxMonthly = Math.max(...monthlyRevenue.map((m) => m.total), 1)

  function getStatusPill(status: string) {
    const base = 'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider'
    switch (status) {
      case 'completed':
        return <span className={`${base} bg-[#97f5cc] text-[#00513a]`}>Completed</span>
      case 'pending':
        return <span className={`${base} bg-[#ffdcc3] text-[#6e3900]`}>Pending</span>
      case 'failed':
        return <span className={`${base} bg-[#ffdad6] text-[#93000a]`}>Failed</span>
      default:
        return <span className={`${base} bg-[#e8e8e6] text-[#3e4943]`}>{status}</span>
    }
  }

  return (
    <div className="space-y-10">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed right-4 top-20 z-50 rounded-lg bg-[#005d42] px-4 py-3 text-white shadow-lg">
          {toastMessage}
        </div>
      )}

      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#1a1c1b]">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-[#3e4943]">Platform ecosystem at a glance</p>
      </div>

      {/* Row 1: Ecosystem Stats */}
      <section>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-lg border-l-4 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${card.accent}`}
            >
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#3e4943]">
                {card.label}
              </p>
              <div className="flex items-center gap-1">
                <h3 className={`font-heading text-2xl font-bold ${card.valueColor}`}>
                  {card.value}
                </h3>
                {card.showStar && (
                  <span
                    className="material-symbols-outlined text-sm text-[#904d00]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Row 2: Revenue + Chart */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Revenue Cards */}
        <div className="grid grid-cols-1 gap-4 lg:col-span-4">
          <div className="rounded-lg bg-[#005d42] p-6 text-white">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest opacity-80">
              This Month&apos;s Revenue
            </p>
            <h4 className="font-heading text-3xl font-bold">
              {formatZAR(revenueStats?.monthRevenue ?? 0)}
            </h4>
            <div className="mt-4 flex items-center text-xs text-[#9ffdd3]">
              <span className="material-symbols-outlined mr-1 text-sm">trending_up</span>
              <span>Platform fee earnings</span>
            </div>
          </div>
          <div className="rounded-lg border-b-2 border-[#97f5cc] bg-[#f4f4f2] p-6">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#3e4943]">
              Total Platform Fees
            </p>
            <h4 className="font-heading text-xl font-bold text-[#1a1c1b]">
              {formatZAR(revenueStats?.totalRevenue ?? 0)}
            </h4>
          </div>
          <div className="rounded-lg border-b-2 border-[#bdc9c1] bg-[#f4f4f2] p-6">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#3e4943]">
              Completed Transactions
            </p>
            <h4 className="font-heading text-xl font-bold text-[#1a1c1b]">
              {revenueStats?.totalTransactions ?? 0}
            </h4>
          </div>
          <div className="rounded-lg border-b-2 border-[#904d00] bg-[#f4f4f2] p-6">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#3e4943]">
              Pending Payouts
            </p>
            <h4 className="font-heading text-xl font-bold text-[#1a1c1b]">
              {revenueStats?.pendingPayouts ?? 0}
            </h4>
          </div>
        </div>

        {/* 6-month Revenue Chart */}
        <div className="rounded-lg bg-white p-8 shadow-sm lg:col-span-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-[#1a1c1b]">
                Revenue Distribution
              </h3>
              <p className="text-sm text-[#3e4943]">Last 6 months of platform fees</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#005d42]" />
                <span className="text-xs text-[#3e4943]">Platform Fees</span>
              </div>
            </div>
          </div>
          <div className="relative flex h-48 w-full items-end justify-between gap-4">
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between opacity-20">
              <div className="w-full border-t border-[#6e7a73]" />
              <div className="w-full border-t border-[#6e7a73]" />
              <div className="w-full border-t border-[#6e7a73]" />
            </div>
            {monthlyRevenue.map((m, idx) => {
              const heightPercent = maxMonthly > 0 ? (m.total / maxMonthly) * 100 : 0
              const isCurrent = idx === monthlyRevenue.length - 1
              return (
                <div
                  key={m.month}
                  className="group relative z-10 flex flex-1 flex-col items-center gap-2"
                  title={formatZAR(m.total)}
                >
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isCurrent ? 'bg-[#005d42]' : 'bg-[#97f5cc] hover:bg-[#005d42]'
                    }`}
                    style={{ height: `${Math.max(heightPercent, 2)}%` }}
                  />
                  <span
                    className={`text-[10px] font-bold uppercase tracking-tighter ${
                      isCurrent ? 'text-[#005d42]' : 'text-[#3e4943]'
                    }`}
                  >
                    {m.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Transactions Table */}
      <section className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e8e8e6] px-8 py-6">
          <h3 className="font-heading text-lg font-bold text-[#1a1c1b]">
            Recent Transactions
          </h3>
          <a
            href="/admin/transactions"
            className="text-xs font-bold uppercase tracking-widest text-[#005d42] hover:underline"
          >
            View All
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#f4f4f2] text-[10px] font-bold uppercase tracking-[0.15em] text-[#3e4943]">
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4">Booking</th>
                <th className="px-8 py-4 text-right">Worker Amount</th>
                <th className="px-8 py-4 text-right">Platform Fee</th>
                <th className="px-8 py-4 text-right">Total</th>
                <th className="px-8 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f4f2]">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-[#3e4943]">
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                recentTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="group transition-colors hover:bg-[#f4f4f2]"
                  >
                    <td className="px-8 py-6 text-sm text-[#3e4943]">
                      {new Date(tx.created_at).toLocaleDateString('en-ZA', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td
                      className="px-8 py-6 font-mono text-xs font-bold text-[#1a1c1b]"
                      title={tx.booking_id}
                    >
                      {tx.booking_id?.slice(0, 8)}…
                    </td>
                    <td className="px-8 py-6 text-right text-sm text-[#3e4943]">
                      {formatZAR(tx.worker_amount ?? 0)}
                    </td>
                    <td className="px-8 py-6 text-right text-sm text-[#3e4943]">
                      {formatZAR(tx.platform_fee ?? 0)}
                    </td>
                    <td className="px-8 py-6 text-right text-sm font-bold text-[#1a1c1b]">
                      {formatZAR(tx.total_amount ?? 0)}
                    </td>
                    <td className="px-8 py-6">{getStatusPill(tx.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Row 4: Quick Actions */}
      <section className="rounded-lg bg-white p-8 shadow-sm">
        <h3 className="mb-6 font-heading text-lg font-bold text-[#1a1c1b]">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setToastMessage('Report will be emailed')}
            className="flex items-center gap-2 rounded-lg bg-[#005d42] px-5 py-3 font-bold text-white transition-transform active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Export Revenue Report
          </button>
          <a
            href="/admin/transactions"
            className="flex items-center gap-2 rounded-lg border border-[#bdc9c1] bg-white px-5 py-3 font-bold text-[#1a1c1b] transition-colors hover:bg-[#f4f4f2]"
          >
            <span className="material-symbols-outlined text-lg">receipt_long</span>
            View All Transactions
          </a>
          <a
            href="/admin/payouts"
            className="flex items-center gap-2 rounded-lg border border-[#bdc9c1] bg-white px-5 py-3 font-bold text-[#1a1c1b] transition-colors hover:bg-[#f4f4f2]"
          >
            <span className="material-symbols-outlined text-lg">payments</span>
            Payout Settings
          </a>
        </div>
      </section>

      {/* Floating Action Button */}
      <button
        type="button"
        className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-[#005d42] text-white shadow-lg transition-all hover:bg-[#047857] active:scale-95"
        title="New Insight"
        aria-label="New insight"
      >
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  )
}
