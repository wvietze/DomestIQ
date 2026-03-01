'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Award, Plus, X, Eye, MousePointerClick, Edit2, Power,
} from 'lucide-react'
import { WaveBars } from '@/components/loading'
import type { Sponsorship } from '@/lib/types'

const placementOptions = [
  { value: 'verification', label: 'Verification Page' },
  { value: 'onboarding_worker', label: 'Worker Onboarding' },
  { value: 'onboarding_client', label: 'Client Onboarding' },
  { value: 'dashboard_worker', label: 'Worker Dashboard' },
  { value: 'dashboard_client', label: 'Client Dashboard' },
  { value: 'search', label: 'Search Results' },
  { value: 'landing', label: 'Landing Page' },
]

export default function AdminSponsorsPage() {
  const supabase = createClient()
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const emptyForm = {
    partner_name: '',
    partner_logo_url: '',
    placement: '',
    headline: '',
    description: '',
    cta_text: '',
    cta_url: '',
    bg_color: '#ecfdf5',
    text_color: '#059669',
  }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data } = await supabase.from('sponsorships').select('*').order('created_at', { ascending: false })
    if (data) setSponsorships(data as Sponsorship[])
    setIsLoading(false)
  }

  function startEdit(s: Sponsorship) {
    setForm({
      partner_name: s.partner_name,
      partner_logo_url: s.partner_logo_url || '',
      placement: s.placement,
      headline: s.headline,
      description: s.description || '',
      cta_text: s.cta_text || '',
      cta_url: s.cta_url || '',
      bg_color: s.bg_color,
      text_color: s.text_color,
    })
    setEditingId(s.id)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      partner_name: form.partner_name,
      partner_logo_url: form.partner_logo_url || null,
      placement: form.placement,
      headline: form.headline,
      description: form.description || null,
      cta_text: form.cta_text || null,
      cta_url: form.cta_url || null,
      bg_color: form.bg_color,
      text_color: form.text_color,
    }

    if (editingId) {
      await supabase.from('sponsorships').update(payload).eq('id', editingId)
    } else {
      await supabase.from('sponsorships').insert(payload)
    }

    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setSaving(false)
    await loadData()
  }

  async function toggleActive(id: string, currentActive: boolean) {
    await supabase.from('sponsorships').update({ is_active: !currentActive }).eq('id', id)
    setSponsorships(prev => prev.map(s => s.id === id ? { ...s, is_active: !currentActive } : s))
  }

  const filtered = filter === 'all'
    ? sponsorships
    : filter === 'active'
      ? sponsorships.filter(s => s.is_active)
      : sponsorships.filter(s => !s.is_active)

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-600" />
            Sponsor Management
          </h1>
          <p className="text-muted-foreground mt-1">Create and manage sponsorship placements</p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(!showForm) }}>
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? 'Cancel' : 'New Sponsorship'}
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="border-amber-200">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Partner Name *</Label>
                  <Input required value={form.partner_name} onChange={e => setForm(p => ({ ...p, partner_name: e.target.value }))} placeholder="e.g. Capitec" />
                </div>
                <div>
                  <Label>Logo URL</Label>
                  <Input value={form.partner_logo_url} onChange={e => setForm(p => ({ ...p, partner_logo_url: e.target.value }))} placeholder="https://..." />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Placement *</Label>
                  <select required value={form.placement} onChange={e => setForm(p => ({ ...p, placement: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Select placement...</option>
                    {placementOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Headline *</Label>
                  <Input required value={form.headline} onChange={e => setForm(p => ({ ...p, headline: e.target.value }))} placeholder="Powered by Capitec" />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Optional description..." />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>CTA Text</Label>
                  <Input value={form.cta_text} onChange={e => setForm(p => ({ ...p, cta_text: e.target.value }))} placeholder="Learn More" />
                </div>
                <div>
                  <Label>CTA URL</Label>
                  <Input value={form.cta_url} onChange={e => setForm(p => ({ ...p, cta_url: e.target.value }))} placeholder="https://..." />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <Input value={form.bg_color} onChange={e => setForm(p => ({ ...p, bg_color: e.target.value }))} />
                    <input type="color" value={form.bg_color} onChange={e => setForm(p => ({ ...p, bg_color: e.target.value }))} className="w-10 h-10 rounded cursor-pointer" />
                  </div>
                </div>
                <div>
                  <Label>Text Color</Label>
                  <div className="flex gap-2">
                    <Input value={form.text_color} onChange={e => setForm(p => ({ ...p, text_color: e.target.value }))} />
                    <input type="color" value={form.text_color} onChange={e => setForm(p => ({ ...p, text_color: e.target.value }))} className="w-10 h-10 rounded cursor-pointer" />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? <WaveBars size="sm" /> : null}
                {editingId ? 'Update Sponsorship' : 'Create Sponsorship'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'active', 'inactive'] as const).map(f => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Sponsorships List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No sponsorships {filter !== 'all' ? `(${filter})` : ''} yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => {
            const ctr = s.impressions > 0 ? ((s.clicks / s.impressions) * 100).toFixed(1) : '0.0'
            return (
              <Card key={s.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Preview swatch */}
                    <div className="w-12 h-12 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold" style={{ backgroundColor: s.bg_color, color: s.text_color }}>
                      {s.partner_name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{s.partner_name}</p>
                        <Badge variant={s.is_active ? 'success' : 'secondary'}>
                          {s.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          {placementOptions.find(p => p.value === s.placement)?.label || s.placement}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{s.headline}</p>

                      {/* Performance */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {s.impressions.toLocaleString()} impressions</span>
                        <span className="flex items-center gap-1"><MousePointerClick className="w-3 h-3" /> {s.clicks.toLocaleString()} clicks</span>
                        <span>{ctr}% CTR</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(s)} title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => toggleActive(s.id, s.is_active)} title={s.is_active ? 'Deactivate' : 'Activate'}>
                        <Power className={`w-4 h-4 ${s.is_active ? 'text-emerald-500' : 'text-gray-400'}`} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
