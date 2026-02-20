'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Trash2, GraduationCap } from 'lucide-react'
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
        <Label className="text-base font-semibold flex items-center gap-2">
          <GraduationCap className="w-4 h-4" /> Education
        </Label>
        <Button variant="outline" size="sm" onClick={addEntry} className="gap-1">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>
      {entries.map((entry, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setEditIndex(editIndex === i ? null : i)}
                className="text-sm font-medium text-left hover:text-blue-600 transition-colors"
              >
                {entry.institution || entry.qualification ? `${entry.qualification || 'Qualification'} — ${entry.institution || 'Institution'}` : 'New entry'}
              </button>
              <Button variant="ghost" size="sm" onClick={() => removeEntry(i)} className="text-red-500 hover:text-red-700 h-8 w-8 p-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            {editIndex === i && (
              <div className="space-y-3 pt-2 border-t">
                <div>
                  <Label className="text-xs">Institution</Label>
                  <Input value={entry.institution} onChange={e => updateEntry(i, 'institution', e.target.value)} placeholder="School or training centre" className="mt-1" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Label className="text-xs">Qualification</Label>
                    <Input value={entry.qualification} onChange={e => updateEntry(i, 'qualification', e.target.value)} placeholder="e.g. Matric, NQF Level 4" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Year</Label>
                    <Input type="number" value={entry.year} onChange={e => updateEntry(i, 'year', parseInt(e.target.value) || 2024)} min={1960} max={2030} className="mt-1" />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No education added yet.
        </p>
      )}
    </div>
  )
}
