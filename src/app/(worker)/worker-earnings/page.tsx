'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  TrendingUp, DollarSign, Calendar, FileText, Download,
  ChevronRight, Loader2, ShieldCheck, Banknote, Wallet,
} from 'lucide-react'
import { motion } from 'framer-motion'

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
        // Refresh data
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

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  const formatMonthYear = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-ZA', {
      month: 'long',
      year: 'numeric',
    })

  if (userLoading || (isLoading && !summary)) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold">My Earnings</h1>
        </div>
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          {(['week', 'month', 'year', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                period === p
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          <CardContent className="p-4 text-center">
            <DollarSign className="w-6 h-6 mx-auto text-emerald-500 mb-2" />
            <p className="text-2xl font-bold text-emerald-600">
              {summary ? formatCurrency(summary.total_earnings) : 'R0.00'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total Earned</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-sky-400 to-sky-600" />
          <CardContent className="p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto text-sky-500 mb-2" />
            <p className="text-2xl font-bold">
              {summary?.total_bookings || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Bookings</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto text-amber-500 mb-2" />
            <p className="text-2xl font-bold">
              {summary ? formatCurrency(summary.avg_booking_value) : 'R0.00'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Avg / Booking</p>
          </CardContent>
        </Card>
      </div>

      {/* Income Verification Banner */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">Income Verification</h3>
              <p className="text-sm text-blue-700 mt-1">
                Your earnings on DomestIQ are verified and recorded. You can generate
                an income statement for loan applications, rental agreements, or bank accounts.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 gap-2"
                onClick={handleGenerateStatement}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                {isGenerating ? 'Generating...' : 'Generate This Month\'s Statement'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income Statements */}
      {statements.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Income Statements
              </h2>
            </div>

            <div className="space-y-2">
              {statements.map((stmt) => (
                <div
                  key={stmt.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {formatMonthYear(stmt.period_start)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stmt.total_bookings} bookings
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(Number(stmt.total_earnings))}
                    </span>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Banknote className="w-5 h-5" />
              Recent Payments
            </h2>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No payments yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Completed bookings with payments will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">
                      Booking Payment
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.paid_at ? formatDate(tx.paid_at) : 'Pending'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-600">
                      +{formatCurrency(Number(tx.worker_amount))}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Bank Details CTA */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Banknote className="w-6 h-6 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold">Bank Account for Payouts</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add your bank account details to receive direct payouts from completed bookings.
                We support all major South African banks including Capitec, FNB, Standard Bank,
                Absa, Nedbank, and TymeBank.
              </p>
              <Button size="sm" className="mt-3 gap-2">
                Set Up Bank Account
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
