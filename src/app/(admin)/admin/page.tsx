'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Briefcase, CalendarDays, Star, FileCheck, AlertTriangle } from 'lucide-react'

interface PlatformStats {
  totalUsers: number
  totalWorkers: number
  totalClients: number
  totalBookings: number
  pendingVerifications: number
  pendingReports: number
  avgRating: number
}

export default function AdminDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const [
        { count: totalUsers },
        { count: totalWorkers },
        { count: totalClients },
        { count: totalBookings },
        { count: pendingVerifications },
        { count: pendingReports },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'worker'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('documents').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        supabase.from('report_flags').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ])

      const { data: ratingData } = await supabase
        .from('worker_profiles')
        .select('overall_rating')
        .gt('overall_rating', 0)

      const avgRating = ratingData?.length
        ? ratingData.reduce((sum, w) => sum + Number(w.overall_rating), 0) / ratingData.length
        : 0

      setStats({
        totalUsers: totalUsers || 0,
        totalWorkers: totalWorkers || 0,
        totalClients: totalClients || 0,
        totalBookings: totalBookings || 0,
        pendingVerifications: pendingVerifications || 0,
        pendingReports: pendingReports || 0,
        avgRating: Math.round(avgRating * 10) / 10,
      })
      setIsLoading(false)
    }
    loadStats()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

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
    </div>
  )
}
