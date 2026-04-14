'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BookingCalendarProps {
  selectedDate: string | null
  onSelectDate: (date: string) => void
  bookedDates?: string[]
  blockedDates?: string[]
  className?: string
}

export function BookingCalendar({ selectedDate, onSelectDate, bookedDates = [], blockedDates = [], className }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1) })
  const today = new Date(); today.setHours(0, 0, 0, 0)

  const days = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const result: Array<{ date: Date; dateStr: string } | null> = []
    for (let i = 0; i < firstDay; i++) result.push(null)
    for (let d = 1; d <= daysInMonth; d++) { const date = new Date(year, month, d); result.push({ date, dateStr: date.toISOString().split('T')[0] }) }
    return result
  }, [currentMonth])

  const monthLabel = currentMonth.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })

  return (
    <div className={cn('', className)}>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}><span className="material-symbols-outlined text-xl">chevron_left</span></Button>
        <h3 className="font-semibold text-base text-[#1a1c1b]">{monthLabel}</h3>
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}><span className="material-symbols-outlined text-xl">chevron_right</span></Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (<span key={d} className="text-xs font-medium text-[#3e4943] py-1">{d}</span>))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          const isPast = day.date < today
          const isBlocked = blockedDates.includes(day.dateStr)
          const isBooked = bookedDates.includes(day.dateStr)
          const isSelected = selectedDate === day.dateStr
          const isToday = day.date.getTime() === today.getTime()
          const disabled = isPast || isBlocked
          return (
            <button key={day.dateStr} type="button" disabled={disabled} onClick={() => onSelectDate(day.dateStr)}
              className={cn('aspect-square rounded-lg text-sm font-medium transition-all relative',
                isSelected && 'bg-[#005d42] text-white shadow-sm',
                !isSelected && isToday && 'ring-2 ring-[#005d42] ring-offset-1',
                !isSelected && !disabled && 'hover:bg-[#f4f4f2] text-[#1a1c1b]',
                disabled && 'text-[#bdc9c1] cursor-not-allowed',
                isBooked && !isSelected && 'bg-[#9ffdd3]/40 text-[#005d42]')}>
              {day.date.getDate()}
              {isBooked && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#005d42]" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
