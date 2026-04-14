'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import type { WorkHistoryEntry } from '@/lib/types/cv'

interface WorkHistoryFormProps {
  entries: WorkHistoryEntry[]
  onChange: (entries: WorkHistoryEntry[]) => void
}

const emptyEntry: WorkHistoryEntry = {
  employer: '',
  role: '',
  start_date: '',
  end_date: null,
  description: '',
}

export function WorkHistoryForm({ entries, onChange }: WorkHistoryFormProps) {
  const [editIndex, setEditIndex] = useState<number | null>(null)

  const addEntry = () => {
    onChange([...entries, { ...emptyEntry }])
    setEditIndex(entries.length)
  }

  const updateEntry = (index: number, field: keyof WorkHistoryEntry, value: string | null) => {
    const updated = entries.map((e, i) => i === index ? { ...e, [field]: value } : e)
    onChange(updated)
  }

  const removeEntry = (index: number) => {
    onChange(entries.filter((_, i) => i !== index))
    if (editIndex === index) setEditIndex(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold flex items-center gap-2 text-[#1a1c1b]">
          <span className="material-symbols-outlined text-base">work</span> Work History
        </Label>
        <Button variant="outline" size="sm" onClick={addEntry} className="gap-1 border-[#bdc9c1] text-[#1a1c1b] hover:bg-[#f4f4f2]">
          <span className="material-symbols-outlined text-base">add</span> Add
        </Button>
      </div>
      {entries.map((entry, i) => (
        <Card key={i} className="relative bg-white">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setEditIndex(editIndex === i ? null : i)}
                className="text-sm font-medium text-left text-[#1a1c1b] hover:text-[#005d42] transition-colors"
              >
                {entry.employer || entry.role ? `${entry.role || 'Role'} at ${entry.employer || 'Employer'}` : 'New entry'}
              </button>
              <Button variant="ghost" size="sm" onClick={() => removeEntry(i)} className="text-[#ba1a1a] hover:text-[#ba1a1a] hover:bg-[#ffdad6] h-8 w-8 p-0">
                <span className="material-symbols-outlined text-base">delete</span>
              </Button>
            </div>
            {editIndex === i && (
              <div className="space-y-3 pt-2 border-t border-[#e8e8e6]">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-[#3e4943]">Employer</Label>
                    <Input value={entry.employer} onChange={e => updateEntry(i, 'employer', e.target.value)} placeholder="Company/household" className="mt-1 bg-[#f4f4f2] border-none focus:ring-2 focus:ring-[#005d42]/30" />
                  </div>
                  <div>
                    <Label className="text-xs text-[#3e4943]">Role</Label>
                    <Input value={entry.role} onChange={e => updateEntry(i, 'role', e.target.value)} placeholder="e.g. Domestic Worker" className="mt-1 bg-[#f4f4f2] border-none focus:ring-2 focus:ring-[#005d42]/30" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-[#3e4943]">Start Date</Label>
                    <Input type="month" value={entry.start_date} onChange={e => updateEntry(i, 'start_date', e.target.value)} className="mt-1 bg-[#f4f4f2] border-none focus:ring-2 focus:ring-[#005d42]/30" />
                  </div>
                  <div>
                    <Label className="text-xs text-[#3e4943]">End Date (blank = current)</Label>
                    <Input type="month" value={entry.end_date || ''} onChange={e => updateEntry(i, 'end_date', e.target.value || null)} className="mt-1 bg-[#f4f4f2] border-none focus:ring-2 focus:ring-[#005d42]/30" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-[#3e4943]">Description</Label>
                  <Textarea value={entry.description} onChange={e => updateEntry(i, 'description', e.target.value)} placeholder="Key responsibilities..." rows={2} className="mt-1 bg-[#f4f4f2] border-none focus:ring-2 focus:ring-[#005d42]/30" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {entries.length === 0 && (
        <p className="text-sm text-[#3e4943] text-center py-4">
          No work history added yet. Click &ldquo;Add&rdquo; to get started.
        </p>
      )}
    </div>
  )
}
