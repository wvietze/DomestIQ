'use client'

import { cn } from '@/lib/utils'
import React from 'react'

interface TimeSlot { day: number; start: string; end: string; available: boolean }

interface AvailabilityGridProps {
  slots: TimeSlot[]
  onChange: (slots: TimeSlot[]) => void
  className?: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

export function AvailabilityGrid({ slots, onChange, className }: AvailabilityGridProps) {
  const isAvailable = (day: number, hour: string) => slots.some(s => s.day === day && s.start <= hour && s.end > hour && s.available)

  const toggleHour = (day: number, hour: string) => {
    const existing = slots.find(s => s.day === day && s.start === hour)
    if (existing) {
      onChange(slots.map(s => s.day === day && s.start === hour ? { ...s, available: !s.available } : s))
    } else {
      const endHour = HOURS[HOURS.indexOf(hour) + 1] || '19:00'
      onChange([...slots, { day, start: hour, end: endHour, available: true }])
    }
  }

  const toggleFullDay = (day: number) => {
    const daySlots = slots.filter(s => s.day === day && s.available)
    if (daySlots.length > HOURS.length / 2) {
      onChange(slots.map(s => s.day === day ? { ...s, available: false } : s))
    } else {
      const newSlots = slots.filter(s => s.day !== day)
      HOURS.forEach(hour => { const endHour = HOURS[HOURS.indexOf(hour) + 1] || '19:00'; newSlots.push({ day, start: hour, end: endHour, available: true }) })
      onChange(newSlots)
    }
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <div className="min-w-[500px]">
        <div className="grid grid-cols-8 gap-1">
          <div />
          {DAYS.map((day, i) => (<button key={day} type="button" onClick={() => toggleFullDay(i)} className="text-center text-xs font-medium text-muted-foreground py-1 hover:text-foreground">{day}</button>))}
          {HOURS.map(hour => (
            <React.Fragment key={hour}>
              <span className="text-[10px] text-muted-foreground text-right pr-1 py-0.5">{hour}</span>
              {DAYS.map((_, dayIdx) => (
                <button key={`${dayIdx}-${hour}`} type="button" onClick={() => toggleHour(dayIdx, hour)}
                  className={cn('h-6 rounded transition-colors', isAvailable(dayIdx, hour) ? 'bg-emerald-400 hover:bg-emerald-500' : 'bg-gray-100 hover:bg-gray-200')} />
              ))}
            </React.Fragment>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-400" /> Available</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100" /> Not Available</span>
        </div>
      </div>
    </div>
  )
}
