'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  AlertTriangle,
  CheckCircle2,
  Flag,
  Shield,
  ShieldOff,
  Eye,
  Clock,
  MessageSquare,
  Star,
  User,
  ExternalLink,
  XCircle,
  Loader2,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReportFlag {
  id: string
  reporter_id: string
  reported_user_id: string | null
  reported_content_type: string
  reported_content_id: string
  reason: string
  description: string | null
  status: string
  resolution_notes: string | null
  resolved_by: string | null
  resolved_at: string | null
  created_at: string
  reporter: { full_name: string } | null
  reported_user: { full_name: string } | null
  resolver: { full_name: string } | null
}

type ActionType = 'remove_content' | 'suspend_user' | 'remove_and_suspend'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function contentTypeIcon(type: string) {
  switch (type) {
    case 'review':
      return <Star className="w-4 h-4" />
    case 'message':
      return <MessageSquare className="w-4 h-4" />
    case 'profile':
      return <User className="w-4 h-4" />
    default:
      return <Flag className="w-4 h-4" />
  }
}

function contentTypeBadgeVariant(type: string): 'default' | 'secondary' | 'outline' | 'warning' {
  switch (type) {
    case 'review':
      return 'warning'
    case 'message':
      return 'secondary'
    case 'profile':
      return 'default'
    default:
      return 'outline'
  }
}

function statusBadge(status: string) {
  switch (status) {
    case 'pending':
      return <Badge variant="warning">Pending</Badge>
    case 'dismissed':
      return <Badge variant="outline">Dismissed</Badge>
    case 'action_taken':
      return <Badge variant="destructive">Action Taken</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function formatContentType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function contentViewUrl(type: string, contentId: string, userId: string | null): string | null {
  switch (type) {
    case 'profile':
      return userId ? `/worker/${userId}` : null
    case 'review':
      return contentId ? `/admin/moderation/review/${contentId}` : null
    case 'message':
      return contentId ? `/admin/moderation/message/${contentId}` : null
    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ModerationPage() {
  const supabase = createClient()

  // Data state
  const [pendingReports, setPendingReports] = useState<ReportFlag[]>([])
  const [resolvedReports, setResolvedReports] = useState<ReportFlag[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Per-report admin notes (pending queue)
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({})

  // Processing states
  const [processing, setProcessing] = useState<string | null>(null)

  // Confirmation dialog state
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    reportId: string
    reporterName: string
    reportedUserName: string
    contentType: string
  } | null>(null)
  const [selectedAction, setSelectedAction] = useState<ActionType>('remove_content')

  // Content type filter
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // ---------------------------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------------------------

  const loadPendingReports = useCallback(async () => {
    const { data } = await supabase
      .from('report_flags')
      .select(
        '*, reporter:profiles!reporter_id(full_name), reported_user:profiles!reported_user_id(full_name), resolver:profiles!resolved_by(full_name)'
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    setPendingReports((data || []) as unknown as ReportFlag[])
  }, [supabase])

  const loadResolvedReports = useCallback(async () => {
    const { data } = await supabase
      .from('report_flags')
      .select(
        '*, reporter:profiles!reporter_id(full_name), reported_user:profiles!reported_user_id(full_name), resolver:profiles!resolved_by(full_name)'
      )
      .in('status', ['dismissed', 'action_taken'])
      .order('resolved_at', { ascending: false })
      .limit(50)

    setResolvedReports((data || []) as unknown as ReportFlag[])
  }, [supabase])

  useEffect(() => {
    async function init() {
      setIsLoading(true)
      await Promise.all([loadPendingReports(), loadResolvedReports()])
      setIsLoading(false)
    }
    init()
  }, [loadPendingReports, loadResolvedReports])

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  /** Dismiss a report (reviewed, no action needed) */
  async function handleDismiss(reportId: string) {
    setProcessing(reportId)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    await supabase
      .from('report_flags')
      .update({
        status: 'dismissed',
        resolved_by: user?.id || null,
        resolution_notes: adminNotes[reportId] || 'Dismissed - no action required',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', reportId)

    setAdminNotes(prev => {
      const next = { ...prev }
      delete next[reportId]
      return next
    })
    setProcessing(null)
    await Promise.all([loadPendingReports(), loadResolvedReports()])
  }

  /** Open the action confirmation dialog */
  function openActionDialog(report: ReportFlag) {
    setActionDialog({
      open: true,
      reportId: report.id,
      reporterName: report.reporter?.full_name || 'Unknown',
      reportedUserName: report.reported_user?.full_name || 'Unknown',
      contentType: report.reported_content_type,
    })
    setSelectedAction('remove_content')
  }

  /** Execute the confirmed action */
  async function handleConfirmAction() {
    if (!actionDialog) return
    const { reportId } = actionDialog

    setProcessing(reportId)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const report = pendingReports.find(r => r.id === reportId)
    if (!report) {
      setProcessing(null)
      setActionDialog(null)
      return
    }

    // Build the resolution notes
    const actionLabels: Record<ActionType, string> = {
      remove_content: 'Content removed',
      suspend_user: 'User suspended',
      remove_and_suspend: 'Content removed and user suspended',
    }
    const notes = [
      actionLabels[selectedAction],
      adminNotes[reportId] ? `Notes: ${adminNotes[reportId]}` : '',
    ]
      .filter(Boolean)
      .join('. ')

    // 1) Update the report
    await supabase
      .from('report_flags')
      .update({
        status: 'action_taken',
        resolved_by: user?.id || null,
        resolution_notes: notes,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', reportId)

    // 2) Remove content if applicable
    if (selectedAction === 'remove_content' || selectedAction === 'remove_and_suspend') {
      if (report.reported_content_type === 'review') {
        await supabase.from('reviews').delete().eq('id', report.reported_content_id)
      } else if (report.reported_content_type === 'message') {
        await supabase
          .from('messages')
          .update({ content: '[Removed by moderator]', deleted_at: new Date().toISOString() })
          .eq('id', report.reported_content_id)
      }
    }

    // 3) Suspend user if applicable
    if (
      (selectedAction === 'suspend_user' || selectedAction === 'remove_and_suspend') &&
      report.reported_user_id
    ) {
      await supabase
        .from('profiles')
        .update({ suspended: true, suspended_at: new Date().toISOString() })
        .eq('id', report.reported_user_id)

      // Notify the suspended user
      await supabase.from('notifications').insert({
        user_id: report.reported_user_id,
        type: 'account_suspended',
        title: 'Account Suspended',
        body: 'Your account has been suspended due to a content policy violation. Please contact support for more information.',
      })
    }

    setAdminNotes(prev => {
      const next = { ...prev }
      delete next[reportId]
      return next
    })
    setProcessing(null)
    setActionDialog(null)
    await Promise.all([loadPendingReports(), loadResolvedReports()])
  }

  // ---------------------------------------------------------------------------
  // Filtered reports
  // ---------------------------------------------------------------------------

  const filteredPending =
    typeFilter === 'all'
      ? pendingReports
      : pendingReports.filter(r => r.reported_content_type === typeFilter)

  // Collect unique content types for filter
  const contentTypes = Array.from(
    new Set(pendingReports.map(r => r.reported_content_type))
  )

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-80" />
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Content Moderation</h1>
            <p className="text-sm text-muted-foreground">
              Review reported content and take appropriate action
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pendingReports.length > 0 ? (
            <Badge variant="destructive" className="text-sm px-3 py-1">
              {pendingReports.length} pending
            </Badge>
          ) : (
            <Badge variant="success" className="text-sm px-3 py-1">
              All clear
            </Badge>
          )}
        </div>
      </div>

      {/* ── Tabs: Pending / Recent Actions ── */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Flag className="w-4 h-4" />
            Pending Reports
            {pendingReports.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingReports.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="resolved" className="gap-2">
            <Clock className="w-4 h-4" />
            Recent Actions
          </TabsTrigger>
        </TabsList>

        {/* ────────────────────────────────────────────────────────────── */}
        {/* Pending Reports Tab                                          */}
        {/* ────────────────────────────────────────────────────────────── */}
        <TabsContent value="pending" className="space-y-4">
          {/* Content type filter */}
          {contentTypes.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Filter:</span>
              <Button
                size="sm"
                variant={typeFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setTypeFilter('all')}
              >
                All ({pendingReports.length})
              </Button>
              {contentTypes.map(type => {
                const count = pendingReports.filter(
                  r => r.reported_content_type === type
                ).length
                return (
                  <Button
                    key={type}
                    size="sm"
                    variant={typeFilter === type ? 'default' : 'outline'}
                    onClick={() => setTypeFilter(type)}
                    className="gap-1.5"
                  >
                    {contentTypeIcon(type)}
                    {formatContentType(type)} ({count})
                  </Button>
                )
              })}
            </div>
          )}

          {/* Empty state */}
          {filteredPending.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
                <p className="text-lg font-medium">No pending reports</p>
                <p className="text-sm text-muted-foreground mt-1">
                  All reported content has been reviewed. Check back later.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPending.map(report => {
              const viewUrl = contentViewUrl(
                report.reported_content_type,
                report.reported_content_id,
                report.reported_user_id
              )
              const isProcessing = processing === report.id

              return (
                <Card key={report.id} className="border-l-4 border-l-amber-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flag className="w-5 h-5 text-red-500" />
                        <span>{formatContentType(report.reported_content_type)} Report</span>
                        <Badge variant={contentTypeBadgeVariant(report.reported_content_type)}>
                          {contentTypeIcon(report.reported_content_type)}
                          <span className="ml-1">
                            {formatContentType(report.reported_content_type)}
                          </span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-normal">
                          {timeAgo(report.created_at)}
                        </span>
                        {statusBadge(report.status)}
                      </div>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Reporter + Reported User info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">
                          Reporter
                        </span>
                        <p className="font-medium mt-0.5">
                          {report.reporter?.full_name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          {report.reporter_id.slice(0, 8)}...
                        </p>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">
                          Reported User
                        </span>
                        <p className="font-medium mt-0.5">
                          {report.reported_user?.full_name || 'N/A'}
                        </p>
                        {report.reported_user_id && (
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            {report.reported_user_id.slice(0, 8)}...
                          </p>
                        )}
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">
                          Content ID
                        </span>
                        <p className="font-mono text-xs mt-0.5 break-all">
                          {report.reported_content_id}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(report.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Reason + Description */}
                    <div className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">
                            Reason: {report.reason}
                          </p>
                          {report.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {report.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* View content link */}
                    {viewUrl && (
                      <a
                        href={viewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                      >
                        <Eye className="w-4 h-4" />
                        View Reported {formatContentType(report.reported_content_type)}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Admin notes */}
                    <Textarea
                      placeholder="Add admin notes before taking action..."
                      value={adminNotes[report.id] || ''}
                      onChange={e =>
                        setAdminNotes(prev => ({
                          ...prev,
                          [report.id]: e.target.value,
                        }))
                      }
                      rows={2}
                    />

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={() => openActionDialog(report)}
                        disabled={isProcessing}
                        className="flex-1 gap-1.5"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ShieldOff className="w-4 h-4" />
                        )}
                        Take Action
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDismiss(report.id)}
                        disabled={isProcessing}
                        className="flex-1 gap-1.5"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        {/* ────────────────────────────────────────────────────────────── */}
        {/* Recent Actions Tab                                            */}
        {/* ────────────────────────────────────────────────────────────── */}
        <TabsContent value="resolved" className="space-y-4">
          {resolvedReports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No resolved reports yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Resolved and dismissed reports will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            resolvedReports.map(report => (
              <Card
                key={report.id}
                className={
                  report.status === 'action_taken'
                    ? 'border-l-4 border-l-red-500 opacity-90'
                    : 'border-l-4 border-l-gray-300 opacity-90'
                }
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      {report.status === 'action_taken' ? (
                        <ShieldOff className="w-4 h-4 text-red-500" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span>
                        {formatContentType(report.reported_content_type)} Report
                      </span>
                      <Badge variant={contentTypeBadgeVariant(report.reported_content_type)}>
                        {formatContentType(report.reported_content_type)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusBadge(report.status)}
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground">Reporter</span>
                      <p className="font-medium">
                        {report.reporter?.full_name || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Reported User</span>
                      <p className="font-medium">
                        {report.reported_user?.full_name || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="text-xs text-muted-foreground">Reason</span>
                    <p className="font-medium">{report.reason}</p>
                    {report.description && (
                      <p className="text-muted-foreground text-xs mt-0.5">
                        {report.description}
                      </p>
                    )}
                  </div>

                  {report.resolution_notes && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        Resolution Notes
                      </span>
                      <p className="text-sm mt-0.5">{report.resolution_notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                    <span>
                      Resolved by: {report.resolver?.full_name || 'System'}
                    </span>
                    <span>
                      {report.resolved_at
                        ? new Date(report.resolved_at).toLocaleString()
                        : 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* ── Action Confirmation Dialog ── */}
      <Dialog
        open={actionDialog?.open ?? false}
        onOpenChange={open => {
          if (!open) setActionDialog(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Confirm Moderation Action
            </DialogTitle>
            <DialogDescription>
              You are taking action on a{' '}
              <strong>
                {actionDialog
                  ? formatContentType(actionDialog.contentType).toLowerCase()
                  : ''}
              </strong>{' '}
              report against{' '}
              <strong>{actionDialog?.reportedUserName || 'Unknown'}</strong>,
              reported by{' '}
              <strong>{actionDialog?.reporterName || 'Unknown'}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Action</label>
              <Select
                value={selectedAction}
                onValueChange={val => setSelectedAction(val as ActionType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an action..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remove_content">
                    Remove reported content
                  </SelectItem>
                  <SelectItem value="suspend_user">
                    Suspend reported user
                  </SelectItem>
                  <SelectItem value="remove_and_suspend">
                    Remove content and suspend user
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 p-3">
              <p className="text-sm text-red-700 dark:text-red-400">
                {selectedAction === 'remove_content' && (
                  <>This will permanently remove the reported content.</>
                )}
                {selectedAction === 'suspend_user' && (
                  <>
                    This will suspend the user account. They will not be able to
                    access the platform until reinstated.
                  </>
                )}
                {selectedAction === 'remove_and_suspend' && (
                  <>
                    This will remove the content <strong>and</strong> suspend the
                    user account. This is the most severe action.
                  </>
                )}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmAction}
              disabled={processing !== null}
              className="gap-1.5"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldOff className="w-4 h-4" />
              )}
              Confirm Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
