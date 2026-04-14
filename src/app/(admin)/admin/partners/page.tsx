'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { PartnerApplication } from '@/lib/types'

function Icon({ name, className = '', style }: { name: string; className?: string; style?: React.CSSProperties }) {
  return <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'warning' | 'success' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  contacted: { label: 'Contacted', variant: 'default' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'destructive' },
}

const companyTypeLabels: Record<string, string> = {
  bank: 'Bank', insurer: 'Insurer', micro_lender: 'Micro-Lender',
  sponsor: 'Sponsor', advertiser: 'Advertiser', government: 'Government', other: 'Other',
}

const interestLabels: Record<string, string> = {
  data_api: 'Data API', sponsorship: 'Sponsorship', advertising: 'Advertising', multiple: 'Multiple',
}

interface ApiKeyRecord {
  id: string
  partner_name: string
  partner_type: string
  is_active: boolean
  rate_limit_per_hour: number
  last_used_at: string | null
  created_at: string
}

export default function AdminPartnersPage() {
  const supabase = createClient()
  const [applications, setApplications] = useState<PartnerApplication[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})

  const loadData = useCallback(async () => {
    const [{ data: apps }, { data: keys }] = await Promise.all([
      supabase.from('partner_applications').select('*').order('created_at', { ascending: false }),
      supabase.from('partner_api_keys').select('id, partner_name, partner_type, is_active, rate_limit_per_hour, last_used_at, created_at').order('created_at', { ascending: false }),
    ])
    if (apps) setApplications(apps as PartnerApplication[])
    if (keys) setApiKeys(keys as ApiKeyRecord[])
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  async function updateStatus(id: string, status: string) {
    setActionLoading(id)
    const updateData: Record<string, unknown> = {
      status,
      reviewed_at: new Date().toISOString(),
    }
    if (notes[id]) {
      updateData.admin_notes = notes[id]
    }

    await supabase.from('partner_applications').update(updateData).eq('id', id)
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: status as PartnerApplication['status'], admin_notes: notes[id] || a.admin_notes, reviewed_at: new Date().toISOString() } : a))
    setActionLoading(null)
  }

  const filtered = statusFilter === 'all'
    ? applications
    : applications.filter(a => a.status === statusFilter)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-heading flex items-center gap-2 text-[#1a1c1b]">
          <Icon name="handshake" className="text-[#005d42]" style={{ fontSize: 28 }} />
          Partner Applications
        </h1>
        <p className="text-[#3e4943] mt-1">Manage partner applications and API keys</p>
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Icon name="filter_alt" className="text-[#3e4943]" style={{ fontSize: 18 }} />
        {['all', 'pending', 'contacted', 'approved', 'rejected'].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(s)}
          >
            {s === 'all' ? 'All' : statusConfig[s]?.label || s}
            {s !== 'all' && (
              <span className="ml-1.5 text-xs">
                ({applications.filter(a => a.status === s).length})
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No partner applications {statusFilter !== 'all' ? `with status "${statusFilter}"` : 'yet'}.
            </CardContent>
          </Card>
        ) : (
          filtered.map((app) => {
            const config = statusConfig[app.status] || statusConfig.pending
            const isExpanded = expandedId === app.id
            return (
              <Card key={app.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Summary Row */}
                  <button
                    className="w-full p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors text-left"
                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{app.company_name}</p>
                        <Badge variant={config.variant}>{config.label}</Badge>
                        <Badge variant="outline">{companyTypeLabels[app.company_type] || app.company_type}</Badge>
                        <Badge variant="secondary">{interestLabels[app.interest] || app.interest}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {app.contact_name} &middot; {app.contact_email}
                        {app.contact_phone && ` \u00B7 ${app.contact_phone}`}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(app.created_at).toLocaleDateString('en-ZA')}
                    </div>
                    <Icon name={isExpanded ? 'expand_less' : 'expand_more'} className="text-[#3e4943]" style={{ fontSize: 18 }} />
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t px-4 py-4 space-y-4 bg-muted/10">
                      {app.website && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Website</span>
                          <p className="text-sm">{app.website}</p>
                        </div>
                      )}
                      {app.message && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Message</span>
                          <p className="text-sm whitespace-pre-wrap">{app.message}</p>
                        </div>
                      )}
                      {app.admin_notes && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Admin Notes</span>
                          <p className="text-sm whitespace-pre-wrap text-[#904d00]">{app.admin_notes}</p>
                        </div>
                      )}

                      {/* Notes Input */}
                      <div>
                        <Textarea
                          placeholder="Add notes..."
                          value={notes[app.id] || ''}
                          onChange={(e) => setNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                          rows={2}
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap">
                        {app.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" disabled={actionLoading === app.id} onClick={() => updateStatus(app.id, 'contacted')}>
                              {actionLoading === app.id ? <Icon name="progress_activity" className="animate-spin mr-1" style={{ fontSize: 14 }} /> : <Icon name="chat" className="mr-1" style={{ fontSize: 14 }} />}
                              Mark Contacted
                            </Button>
                            <Button size="sm" disabled={actionLoading === app.id} onClick={() => updateStatus(app.id, 'approved')} className="bg-[#005d42] hover:bg-[#047857] text-white font-bold rounded-lg">
                              {actionLoading === app.id ? <Icon name="progress_activity" className="animate-spin mr-1" style={{ fontSize: 14 }} /> : <Icon name="check_circle" className="mr-1" style={{ fontSize: 14 }} />}
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" disabled={actionLoading === app.id} onClick={() => updateStatus(app.id, 'rejected')}>
                              {actionLoading === app.id ? <Icon name="progress_activity" className="animate-spin mr-1" style={{ fontSize: 14 }} /> : <Icon name="cancel" className="mr-1" style={{ fontSize: 14 }} />}
                              Reject
                            </Button>
                          </>
                        )}
                        {app.status === 'contacted' && (
                          <>
                            <Button size="sm" disabled={actionLoading === app.id} onClick={() => updateStatus(app.id, 'approved')} className="bg-[#005d42] hover:bg-[#047857] text-white font-bold rounded-lg">
                              <Icon name="check_circle" className="mr-1" style={{ fontSize: 14 }} />
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" disabled={actionLoading === app.id} onClick={() => updateStatus(app.id, 'rejected')}>
                              <Icon name="cancel" className="mr-1" style={{ fontSize: 14 }} />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Active API Keys */}
      <div>
        <h2 className="text-xl font-bold font-heading flex items-center gap-2 mb-4 text-[#1a1c1b]">
          <Icon name="key" className="text-[#904d00]" style={{ fontSize: 22 }} />
          Active API Keys
        </h2>
        {apiKeys.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No API keys created yet. Approve a partner application to generate an API key.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {apiKeys.map((key) => (
              <Card key={key.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn('w-2 h-2 rounded-full', key.is_active ? 'bg-[#047857]' : 'bg-[#bdc9c1]')} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{key.partner_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {key.partner_type} &middot; Rate limit: {key.rate_limit_per_hour}/hr
                      {key.last_used_at && ` \u00B7 Last used: ${new Date(key.last_used_at).toLocaleDateString('en-ZA')}`}
                    </p>
                  </div>
                  <Badge variant={key.is_active ? 'success' : 'secondary'}>
                    {key.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
