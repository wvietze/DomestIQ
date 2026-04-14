'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import type { EducationEntry } from '@/lib/types/cv'

interface EducationFormProps {
  entries: EducationEntry[]
  onChange: (entries: EducationEntry[]) => void
}

const emptyEntry: EducationEntry = {
  institution: '',
  qualification: '',
  year: new Date().getFullYear(),
}

export function EducationForm({ entries, onChange }: EducationFormProps) {
  const [editIndex, setEditIndex] = useState<number | null>(null)

  const addEntry = () => {
    onChange([...entries, { ...emptyEntry }])
    setEditIndex(entries.length)
  }

  const updateEntry = (index: number, field: keyof EducationEntry, value: string | number) => {
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
          <span className="material-symbols-outlined text-base">school</span> Education
        </Label>
        <Button variant="outline" size="sm" onClick={addEntry} className="gap-1 border-[#bdc9c1] text-[#1a1c1b] hover:bg-[#f4f4f2]">
          <span className="material-symbols-outlined text-base">add</span> Add
        </Button>
      </div>
      {entries.map((entry, i) => (
        <Card key={i} className="bg-white">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setEditIndex(editIndex === i ? null : i)}
                className="text-sm font-medium text-left text-[#1a1c1b] hover:text-[#005d42] transition-colors"
              >
                {entry.institution || entry.qualification ? `${entry.qualification || 'Qualification'} — ${entry.institution || 'Institution'}` : 'New entry'}
              </button>
              <Button variant="ghost" size="sm" onClick={() => removeEntry(i)} className="text-[#ba1a1a] hover:text-[#ba1a1a] hover:bg-[#ffdad6] h-8 w-8 p-0">
                <span className="material-symbols-outlined text-base">delete</span>
              </Button>
            </div>
            {editIndex === i && (
              <div className="space-y-3 pt-2 border-t border-[#e8e8e6]">
                <div>
                  <Label className="text-xs text-[#3e4943]">Institution</Label>
                  <Input value={entry.institution} onChange={e => updateEntry(i, 'institution', e.target.value)} placeholder="School or training centre" className="mt-1 bg-[#f4f4f2] border-none focus:ring-2 focus:ring-[#005d42]/30" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Label className="text-xs text-[#3e4943]">Qualification</Label>
                    <Input value={entry.qualification} onChange={e => updateEntry(i, 'qualification', e.target.value)} placeholder="e.g. Matric, NQF Level 4" className="mt-1 bg-[#f4f4f2] border-none focus:ring-2 focus:ring-[#005d42]/30" />
                  </div>
                  <div>
                    <Label className="text-xs text-[#3e4943]">Year</Label>
                    <Input type="number" value={entry.year} onChange={e => updateEntry(i, 'year', parseInt(e.target.value) || 2024)} min={1960} max={2030} className="mt-1 bg-[#f4f4f2] border-none focus:ring-2 focus:ring-[#005d42]/30" />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {entries.length === 0 && (
        <p className="text-sm text-[#3e4943] text-center py-4">
          No education added yet.
        </p>
      )}
    </div>
  )
}
