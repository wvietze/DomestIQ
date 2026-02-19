'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Users,
  Briefcase,
  CalendarDays,
  Star,
  FileCheck,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Download,
  CreditCard,
} from 'lucide-react'

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

      // Six months ago for chart
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
        // Existing platform stats
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'worker'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('documents').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        supabase.from('report_flags').select('*', { count: 'exact', head: true }).eq('status', 'pending'),

        // Avg rating
        supabase
          .from('worker_profiles')
          .select('overall_rating')
          .gt('overall_rating', 0),

        // Revenue: total platform fees
        supabase
          .from('revenue_ledger')
          .select('platform_fee'),

        // Revenue: this month's platform fees
        supabase
          .from('revenue_ledger')
          .select('platform_fee')
          .gte('created_at', monthStart),

        // Total completed transactions
        supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed'),

        // Pending payouts
        supabase
          .from('worker_payouts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),

        // Recent 20 transactions
        supabase
          .from('transactions')
          .select('id, created_at, booking_id, worker_amount, platform_fee, total_amount, status')
          .order('created_at', { ascending: false })
          .limit(20),

        // Monthly revenue for last 6 months
        supabase
          .from('revenue_ledger')
          .select('platform_fee, created_at')
          .gte('created_at', sixMonthsAgo)
          .order('created_at', { ascending: true }),
      ])

      // Compute avg rating
      const ratingData = ratingResult.data
      const avgRating = ratingData?.length
        ? ratingData.reduce((sum, w) => sum + Number(w.overall_rating), 0) / ratingData.length
        : 0

      // Compute total revenue
      const totalRevenue = totalRevenueResult.data?.reduce(
        (sum, row) => sum + Number(row.platform_fee || 0),
        0
      ) ?? 0

      // Compute this month's revenue
      const monthRevenue = monthRevenueResult.data?.reduce(
        (sum, row) => sum + Number(row.platform_fee || 0),
        0
      ) ?? 0

      // Group monthly revenue by month
      const monthlyMap = new Map<string, number>()
      const monthLabels: string[] = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const label = d.toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })
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
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-6 w-40 mt-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'text-primary' },
    { label: 'Workers', value: stats?.totalWorkers, icon: Briefcase, color: 'text-secondary' },
    { label: 'Clients', value: stats?.totalClients, icon: Users, color: 'text-blue-500' },
    { label: 'Total Bookings', value: stats?.totalBookings, icon: CalendarDays, color: 'text-emerald-500' },
    { label: 'Pending Verifications', value: stats?.pendingVerifications, icon: FileCheck, color: 'text-amber-500' },
    { label: 'Pending Reports', value: stats?.pendingReports, icon: AlertTriangle, color: 'text-red-500' },
  ]

  const revenueCards = [
    {
      label: 'Total Revenue',
      value: formatZAR(revenueStats?.totalRevenue ?? 0),
      icon: DollarSign,
      color: 'text-emerald-500',
    },
    {
      label: "This Month's Revenue",
      value: formatZAR(revenueStats?.monthRevenue ?? 0),
      icon: TrendingUp,
      color: 'text-blue-500',
    },
    {
      label: 'Total Transactions',
      value: revenueStats?.totalTransactions ?? 0,
      icon: CreditCard,
      color: 'text-violet-500',
    },
    {
      label: 'Pending Payouts',
      value: revenueStats?.pendingPayouts ?? 0,
      icon: ArrowUpRight,
      color: 'text-amber-500',
    },
  ]

  const maxMonthly = Math.max(...monthlyRevenue.map((m) => m.total), 1)

  function getStatusBadge(status: string) {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          {toastMessage}
        </div>
      )}

      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* ── Existing Platform Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map(card => {
          const Icon = card.icon
          return (
            <Card key={card.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Icon className={`w-8 h-8 ${card.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Platform Average Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{stats?.avgRating || 'N/A'} <span className="text-lg text-muted-foreground">/ 5</span></p>
        </CardContent>
      </Card>

      <Separator />

      {/* ── Revenue Overview Cards ── */}
      <h2 className="text-xl font-semibold">Revenue Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {revenueCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-full bg-muted p-2`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ── Monthly Revenue Summary (CSS Bar Chart) ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Monthly Revenue (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-3 h-48">
            {monthlyRevenue.map((m) => {
              const heightPercent = maxMonthly > 0 ? (m.total / maxMonthly) * 100 : 0
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end h-36">
                    <div
                      className="w-full max-w-[48px] bg-emerald-500 rounded-t-md transition-all duration-500"
                      style={{ height: `${Math.max(heightPercent, 2)}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
                    <p className="text-xs font-semibold">{formatZAR(m.total)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Recent Transactions Table ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-violet-500" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Header row */}
          <div className="grid grid-cols-6 gap-4 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b">
            <div>Date</div>
            <div>Booking ID</div>
            <div className="text-right">Worker Amount</div>
            <div className="text-right">Platform Fee</div>
            <div className="text-right">Total</div>
            <div className="text-center">Status</div>
          </div>
          {/* Data rows */}
          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No transactions found.</div>
          ) : (
            recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="grid grid-cols-6 gap-4 px-3 py-3 text-sm border-b last:border-b-0 hover:bg-muted/50 transition-colors"
              >
                <div className="text-muted-foreground">
                  {new Date(tx.created_at).toLocaleDateString('en-ZA', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
                <div className="font-mono text-xs truncate" title={tx.booking_id}>
                  {tx.booking_id?.slice(0, 8)}...
                </div>
                <div className="text-right">{formatZAR(tx.worker_amount ?? 0)}</div>
                <div className="text-right">{formatZAR(tx.platform_fee ?? 0)}</div>
                <div className="text-right font-medium">{formatZAR(tx.total_amount ?? 0)}</div>
                <div className="text-center">{getStatusBadge(tx.status)}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* ── Quick Actions ── */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setToastMessage('Report will be emailed')}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export Revenue Report
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <a href="/admin/transactions">
                <CreditCard className="w-4 h-4" />
                View All Transactions
              </a>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <a href="/admin/payouts">
                <DollarSign className="w-4 h-4" />
                Payout Settings
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
