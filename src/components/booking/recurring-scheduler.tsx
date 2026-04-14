'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface RecurringSchedule {
  frequency: 'weekly' | 'biweekly' | 'monthly'
  days: number[]
  endDate: string | null
}

interface RecurringSchedulerProps {
  onScheduleChange: (schedule: RecurringSchedule | null) => void
  className?: string
}

const FREQUENCIES = [
  { id: 'weekly' as const, label: 'Weekly' },
  { id: 'biweekly' as const, label: 'Every 2 Weeks' },
  { id: 'monthly' as const, label: 'Monthly' },
]

const DAYS = [{ short: 'S', idx: 0 }, { short: 'M', idx: 1 }, { short: 'T', idx: 2 }, { short: 'W', idx: 3 }, { short: 'T', idx: 4 }, { short: 'F', idx: 5 }, { short: 'S', idx: 6 }]

export function RecurringScheduler({ onScheduleChange, className }: RecurringSchedulerProps) {
  const [enabled, setEnabled] = useState(false)
  const [schedule, setSchedule] = useState<RecurringSchedule>({ frequency: 'weekly', days: [], endDate: null })

  const toggle = () => { const n = !enabled; setEnabled(n); onScheduleChange(n ? schedule : null) }
  const updateSchedule = (u: Partial<RecurringSchedule>) => { const s = { ...schedule, ...u }; setSchedule(s); if (enabled) onScheduleChange(s) }
  const toggleDay = (idx: number) => updateSchedule({ days: schedule.days.includes(idx) ? schedule.days.filter(d => d !== idx) : [...schedule.days, idx].sort() })

  return (
    <div className={cn('space-y-4', className)}>
      <Button
        type="button"
        variant={enabled ? 'default' : 'outline'}
        className={cn(
          'w-full h-12',
          enabled ? 'bg-[#005d42] hover:bg-[#047857] text-white' : 'border-[#bdc9c1] text-[#1a1c1b] hover:bg-[#f4f4f2]'
        )}
        onClick={toggle}
      >
        <span className="material-symbols-outlined text-base mr-2">{enabled ? 'close' : 'repeat'}</span>
        {enabled ? 'Remove Recurring Schedule' : 'Make Recurring'}
      </Button>
      {enabled && (
        <div className="space-y-4 p-4 bg-white border border-[#bdc9c1] rounded-xl">
          <div>
            <Label className="text-[#1a1c1b]">Frequency</Label>
            <div className="flex gap-2 mt-1">
              {FREQUENCIES.map(f => (
                <Badge
                  key={f.id}
                  variant={schedule.frequency === f.id ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer px-3 py-1.5',
                    schedule.frequency === f.id
                      ? 'bg-[#005d42] text-white border-0'
                      : 'border-[#bdc9c1] text-[#1a1c1b]'
                  )}
                  onClick={() => updateSchedule({ frequency: f.id })}
                >
                  {f.label}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-[#1a1c1b]">On These Days</Label>
            <div className="flex gap-1.5 mt-1">
              {DAYS.map((day, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(day.idx)}
                  className={cn(
                    'w-10 h-10 rounded-lg text-sm font-medium transition-colors',
                    schedule.days.includes(day.idx)
                      ? 'bg-[#005d42] text-white'
                      : 'bg-[#f4f4f2] text-[#1a1c1b] hover:bg-[#eeeeec]'
                  )}
                >
                  {day.short}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="endDate" className="text-[#1a1c1b]">Until (optional)</Label>
            <Input id="endDate" type="date" value={schedule.endDate || ''} onChange={e => updateSchedule({ endDate: e.target.value || null })} className="mt-1 bg-[#f4f4f2] border-none focus:ring-2 focus:ring-[#005d42]/30" />
          </div>
        </div>
      )}
    </div>
  )
}
