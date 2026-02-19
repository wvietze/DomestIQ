'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, CheckCircle2, Flag } from 'lucide-react'

interface ReportFlag {
  id: string
  reporter_id: string
  reported_user_id: string | null
  reported_content_type: string
  reported_content_id: string
  reason: string
  description: string | null
  status: string
  created_at: string
  reporter: { full_name: string }
  reported_user: { full_name: string } | null
}

export default function ModerationPage() {
  const supabase = createClient()
  const [reports, setReports] = useState<ReportFlag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadReports()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadReports() {
    const { data } = await supabase
      .from('report_flags')
      .select('*, reporter:profiles!reporter_id(full_name), reported_user:profiles!reported_user_id(full_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    setReports((data || []) as unknown as ReportFlag[])
    setIsLoading(false)
  }

  async function handleResolve(reportId: string, action: 'resolved' | 'dismissed') {
    setProcessing(reportId)
    const { data: { user } } = await supabase.auth.getUser()

    const updateData = {
      status: action as string,
      resolved_by: user?.id || null,
      resolution_notes: resolutionNotes[reportId] || null,
      resolved_at: new Date().toISOString(),
    }
    await supabase.from('report_flags').update(updateData).eq('id', reportId)

    setProcessing(null)
    loadReports()
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Content Moderation</h1>
        <Badge variant="outline">{reports.length} pending</Badge>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-secondary mx-auto mb-3" />
            <p className="font-medium">No pending reports</p>
            <p className="text-sm text-muted-foreground">All reports have been reviewed.</p>
          </CardContent>
        </Card>
      ) : (
        reports.map(report => (
          <Card key={report.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-red-500" />
                  {report.reported_content_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Report
                </div>
                <Badge variant="warning">Pending</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Reporter:</span>
                  <p className="font-medium">{report.reporter.full_name}</p>
                </div>
                {report.reported_user && (
                  <div>
                    <span className="text-muted-foreground">Reported User:</span>
                    <p className="font-medium">{report.reported_user.full_name}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Reason: {report.reason}</p>
                {report.description && (
                  <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Reported: {new Date(report.created_at).toLocaleString()}
              </p>
              <Textarea
                placeholder="Resolution notes..."
                value={resolutionNotes[report.id] || ''}
                onChange={e => setResolutionNotes(prev => ({ ...prev, [report.id]: e.target.value }))}
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => handleResolve(report.id, 'resolved')}
                  disabled={processing === report.id}
                  className="flex-1"
                >
                  <AlertTriangle className="w-4 h-4 mr-1" /> Take Action
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleResolve(report.id, 'dismissed')}
                  disabled={processing === report.id}
                  className="flex-1"
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
