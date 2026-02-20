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
  Megaphone, Plus, X, Eye, MousePointerClick, Loader2, Edit2, Power,
} from 'lucide-react'
import type { Ad } from '@/lib/types'

const placementOptions = [
  { value: 'worker_dashboard', label: 'Worker Dashboard' },
  { value: 'client_dashboard', label: 'Client Dashboard' },
  { value: 'search_results', label: 'Search Results' },
  { value: 'worker_profile', label: 'Worker Profile' },
]

const roleOptions = [
  { value: 'worker', label: 'Workers' },
  { value: 'client', label: 'Clients' },
  { value: 'all', label: 'All Users' },
]

export default function AdminAdsPage() {
  const supabase = createClient()
  const [ads, setAds] = useState<Ad[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const emptyForm = {
    advertiser_name: '',
    advertiser_logo_url: '',
    placement: '',
    target_services: '',
    target_role: 'all',
    headline: '',
    description: '',
    image_url: '',
    cta_text: '',
    cta_url: '',
  }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data } = await supabase.from('ad_placements').select('*').order('created_at', { ascending: false })
    if (data) setAds(data as Ad[])
    setIsLoading(false)
  }

  function startEdit(ad: Ad) {
    setForm({
      advertiser_name: ad.advertiser_name,
      advertiser_logo_url: ad.advertiser_logo_url || '',
      placement: ad.placement,
      target_services: ad.target_services?.join(', ') || '',
      target_role: ad.target_role,
      headline: ad.headline,
      description: ad.description || '',
      image_url: ad.image_url || '',
      cta_text: ad.cta_text,
      cta_url: ad.cta_url,
    })
    setEditingId(ad.id)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const targetServices = form.target_services
      ? form.target_services.split(',').map(s => s.trim()).filter(Boolean)
      : null

    const payload = {
      advertiser_name: form.advertiser_name,
      advertiser_logo_url: form.advertiser_logo_url || null,
      placement: form.placement,
      target_services: targetServices,
      target_role: form.target_role,
      headline: form.headline,
      description: form.description || null,
      image_url: form.image_url || null,
      cta_text: form.cta_text,
      cta_url: form.cta_url,
    }

    if (editingId) {
      await supabase.from('ad_placements').update(payload).eq('id', editingId)
    } else {
      await supabase.from('ad_placements').insert(payload)
    }

    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setSaving(false)
    await loadData()
  }

  async function toggleActive(id: string, currentActive: boolean) {
    await supabase.from('ad_placements').update({ is_active: !currentActive }).eq('id', id)
    setAds(prev => prev.map(a => a.id === id ? { ...a, is_active: !currentActive } : a))
  }

  const filtered = filter === 'all'
    ? ads
    : filter === 'active'
      ? ads.filter(a => a.is_active)
      : ads.filter(a => !a.is_active)

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
            <Megaphone className="w-6 h-6 text-violet-600" />
            Ad Management
          </h1>
          <p className="text-muted-foreground mt-1">Create and manage ad placements</p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(!showForm) }}>
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? 'Cancel' : 'New Ad'}
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="border-violet-200">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Advertiser Name *</Label>
                  <Input required value={form.advertiser_name} onChange={e => setForm(p => ({ ...p, advertiser_name: e.target.value }))} placeholder="e.g. Makro" />
                </div>
                <div>
                  <Label>Logo URL</Label>
                  <Input value={form.advertiser_logo_url} onChange={e => setForm(p => ({ ...p, advertiser_logo_url: e.target.value }))} placeholder="https://..." />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label>Placement *</Label>
                  <select required value={form.placement} onChange={e => setForm(p => ({ ...p, placement: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Select...</option>
                    {placementOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Target Role *</Label>
                  <select required value={form.target_role} onChange={e => setForm(p => ({ ...p, target_role: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {roleOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Target Services</Label>
                  <Input value={form.target_services} onChange={e => setForm(p => ({ ...p, target_services: e.target.value }))} placeholder="cleaning, gardening" />
                  <p className="text-xs text-muted-foreground mt-1">Comma-separated. Empty = all.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Headline *</Label>
                  <Input required value={form.headline} onChange={e => setForm(p => ({ ...p, headline: e.target.value }))} placeholder="Get 20% off cleaning supplies" />
                </div>
                <div>
                  <Label>Image URL</Label>
                  <Input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Optional ad description..." />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>CTA Text *</Label>
                  <Input required value={form.cta_text} onChange={e => setForm(p => ({ ...p, cta_text: e.target.value }))} placeholder="Shop Now" />
                </div>
                <div>
                  <Label>CTA URL *</Label>
                  <Input required value={form.cta_url} onChange={e => setForm(p => ({ ...p, cta_url: e.target.value }))} placeholder="https://..." />
                </div>
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {editingId ? 'Update Ad' : 'Create Ad'}
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

      {/* Ads List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No ads {filter !== 'all' ? `(${filter})` : ''} yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(ad => {
            const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0.0'
            return (
              <Card key={ad.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                      <Megaphone className="w-5 h-5 text-violet-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{ad.advertiser_name}</p>
                        <Badge variant={ad.is_active ? 'success' : 'secondary'}>
                          {ad.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          {placementOptions.find(p => p.value === ad.placement)?.label || ad.placement}
                        </Badge>
                        <Badge variant="secondary">
                          {roleOptions.find(r => r.value === ad.target_role)?.label || ad.target_role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{ad.headline}</p>
                      {ad.target_services && ad.target_services.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {ad.target_services.map(s => (
                            <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      )}

                      {/* Performance */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {ad.impressions.toLocaleString()} impressions</span>
                        <span className="flex items-center gap-1"><MousePointerClick className="w-3 h-3" /> {ad.clicks.toLocaleString()} clicks</span>
                        <span>{ctr}% CTR</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(ad)} title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => toggleActive(ad.id, ad.is_active)} title={ad.is_active ? 'Deactivate' : 'Activate'}>
                        <Power className={`w-4 h-4 ${ad.is_active ? 'text-emerald-500' : 'text-gray-400'}`} />
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
