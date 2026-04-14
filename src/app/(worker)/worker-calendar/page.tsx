'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  isSameMonth,
} from 'date-fns'

interface CalendarBooking {
  id: string
  status: string
  scheduled_date: string
  scheduled_start_time: string
  scheduled_end_time: string
  profiles: { full_name: string }
  services: { name: string }
}

const WEEKDAY_HEADERS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-[#ffdcc3]', text: 'text-[#904d00]', label: 'Pending' },
  confirmed: { bg: 'bg-[#97f5cc]', text: 'text-[#005d42]', label: 'Confirmed' },
  in_progress: {
    bg: 'bg-[#97f5cc]',
    text: 'text-[#005d42]',
    label: 'In Progress',
  },
  completed: {
    bg: 'bg-[#e8e8e6]',
    text: 'text-[#3e4943]',
    label: 'Completed',
  },
  cancelled: {
    bg: 'bg-[#ffdad6]',
    text: 'text-[#ba1a1a]',
    label: 'Cancelled',
  },
}

export default function WorkerCalendarPage() {
  const { user, isLoading: userLoading } = useUser()
  const supabase = createClient()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookings, setBookings] = useState<CalendarBooking[]>([])
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [blockingDate, setBlockingDate] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (!user) return

      const rangeStart = startOfWeek(startOfMonth(currentDate))
      const rangeEnd = endOfWeek(endOfMonth(currentDate))
      const fromStr = format(rangeStart, 'yyyy-MM-dd')
      const toStr = format(rangeEnd, 'yyyy-MM-dd')

      const [bookingsRes, blockedRes] = await Promise.all([
        supabase
          .from('bookings')
          .select(
            'id, status, scheduled_date, scheduled_start_time, scheduled_end_time, profiles!client_id(full_name), services(name)'
          )
          .eq('worker_id', user.id)
          .gte('scheduled_date', fromStr)
          .lte('scheduled_date', toStr)
          .order('scheduled_start_time', { ascending: true }),
        fetch(`/api/blocked-dates?worker_id=${user.id}&from=${fromStr}&to=${toStr}`)
          .then((r) => r.json())
          .catch(() => ({ blocked_dates: [] })),
      ])

      if (bookingsRes.data)
        setBookings(bookingsRes.data as unknown as CalendarBooking[])

      const blocked = new Set<string>(
        (blockedRes.blocked_dates || []).map(
          (d: { blocked_date: string }) => d.blocked_date
        )
      )
      setBlockedDates(blocked)
      setIsLoading(false)
    }

    if (!userLoading) loadData()
  }, [user, userLoading, currentDate, supabase])

  const navigateForward = () => setCurrentDate((prev) => addMonths(prev, 1))
  const navigateBack = () => setCurrentDate((prev) => subMonths(prev, 1))

  const getBookingsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return bookings.filter((b) => b.scheduled_date === dateStr)
  }

  const isDateBlocked = (date: Date) =>
    blockedDates.has(format(date, 'yyyy-MM-dd'))

  const toggleBlockDate = async (date: Date) => {
    if (!user) return
    setBlockingDate(true)
    const dateStr = format(date, 'yyyy-MM-dd')
    const isBlocked = blockedDates.has(dateStr)

    try {
      if (isBlocked) {
        await fetch('/api/blocked-dates', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blocked_date: dateStr }),
        })
        setBlockedDates((prev) => {
          const next = new Set(prev)
          next.delete(dateStr)
          return next
        })
      } else {
        await fetch('/api/blocked-dates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blocked_date: dateStr,
            reason: 'Manually blocked',
          }),
        })
        setBlockedDates((prev) => {
          const next = new Set(prev)
          next.add(dateStr)
          return next
        })
      }
    } catch (err) {
      console.error('Failed to toggle blocked date:', err)
    } finally {
      setBlockingDate(false)
    }
  }

  const getDaysToDisplay = (): Date[] => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calStart = startOfWeek(monthStart)
    const calEnd = endOfWeek(monthEnd)
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }

  const days = getDaysToDisplay()
  const selectedDateBookings = selectedDate
    ? getBookingsForDate(selectedDate)
    : []
  const selectedDateIsBlocked = selectedDate
    ? isDateBlocked(selectedDate)
    : false

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f9f7] flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-[#6e7a73] animate-spin">
          progress_activity
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f9f7] pb-16">
      {/* Top App Bar */}
      <header className="bg-[#f9f9f7] sticky top-0 z-40 flex items-center px-4 h-16 border-b border-[#e8e8e6]/40">
        <Link
          href="/worker-dashboard"
          className="p-2 -ml-2 rounded-full hover:bg-[#e8e8e6] active:scale-95 transition-all text-[#005d42]"
          aria-label="Back"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="ml-2 font-heading font-bold tracking-tight text-lg text-[#1a1c1b]">
          Calendar
        </h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4">
        {/* Month Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <p className="text-[10px] uppercase tracking-widest text-[#3e4943] font-bold">
              Availability
            </p>
            <h2 className="font-heading text-2xl font-extrabold text-[#1a1c1b] tracking-tight">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={navigateBack}
              className="p-2 hover:bg-[#e8e8e6] rounded-full transition-colors text-[#1a1c1b]"
              aria-label="Previous month"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentDate(new Date())
                setSelectedDate(new Date())
              }}
              className="px-3 text-xs font-bold text-[#005d42] hover:bg-[#e8e8e6] rounded-full transition-colors"
            >
              TODAY
            </button>
            <button
              type="button"
              onClick={navigateForward}
              className="p-2 hover:bg-[#e8e8e6] rounded-full transition-colors text-[#1a1c1b]"
              aria-label="Next month"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <section className="bg-white rounded-xl shadow-sm border border-[#e8e8e6] p-3 mb-5">
          <div className="grid grid-cols-7 mb-3">
            {WEEKDAY_HEADERS.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-bold text-[#3e4943]"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-2">
            {days.map((day, index) => {
              const dayBookings = getBookingsForDate(day)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const today = isToday(day)
              const blocked = isDateBlocked(day)

              return (
                <button
                  type="button"
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className="relative flex flex-col items-center justify-center py-2 active:scale-95 transition-transform"
                >
                  {today ? (
                    <div className="w-8 h-8 bg-[#005d42] rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {format(day, 'd')}
                      </span>
                    </div>
                  ) : isSelected ? (
                    <div className="w-8 h-8 bg-[#97f5cc] rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-[#005d42]">
                        {format(day, 'd')}
                      </span>
                    </div>
                  ) : blocked ? (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#ffdad6]">
                      <span className="text-sm font-semibold text-[#ba1a1a]">
                        {format(day, 'd')}
                      </span>
                    </div>
                  ) : (
                    <span
                      className={`text-sm ${
                        isCurrentMonth
                          ? 'font-semibold text-[#1a1c1b]'
                          : 'font-medium text-[#dadad8]'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                  )}
                  {dayBookings.length > 0 && !today && !isSelected && (
                    <div className="w-1 h-1 bg-[#005d42] rounded-full absolute bottom-0.5" />
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* Selected Date Panel */}
        {selectedDate && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-bold text-base text-[#1a1c1b]">
                {format(selectedDate, 'EEEE, MMM d')}
                {selectedDateBookings.length > 0 && (
                  <span className="text-[#3e4943] font-medium">
                    {' '}
                    ({selectedDateBookings.length})
                  </span>
                )}
              </h3>
              <button
                type="button"
                onClick={() => toggleBlockDate(selectedDate)}
                disabled={blockingDate}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-60 ${
                  selectedDateIsBlocked
                    ? 'bg-[#ffdad6] text-[#ba1a1a]'
                    : 'bg-[#e8e8e6] text-[#3e4943]'
                }`}
              >
                {blockingDate ? (
                  <span className="material-symbols-outlined text-sm animate-spin">
                    progress_activity
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-sm">
                    block
                  </span>
                )}
                {selectedDateIsBlocked ? 'Unblock' : 'Block Date'}
              </button>
            </div>

            {selectedDateIsBlocked && (
              <div className="bg-[#ffdad6] rounded-lg p-3 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ba1a1a] text-base shrink-0">
                  block
                </span>
                <p className="text-sm text-[#ba1a1a]">
                  This date is blocked. Clients cannot book you on this day.
                </p>
              </div>
            )}

            {selectedDateBookings.length === 0 && !selectedDateIsBlocked ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <p className="text-[#3e4943] text-sm">
                  No bookings on this day
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDateBookings.map((booking) => {
                  const badge =
                    STATUS_BADGE[booking.status] || STATUS_BADGE.pending
                  return (
                    <Link
                      key={booking.id}
                      href={`/worker-bookings/${booking.id}`}
                      className="block"
                    >
                      <div className="bg-white rounded-lg overflow-hidden flex shadow-sm border border-[#e8e8e6] active:scale-[0.99] transition-transform">
                        <div className="w-1.5 bg-[#005d42]" />
                        <div className="flex-1 p-3">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[10px] font-bold text-[#005d42] bg-[#97f5cc] px-1.5 py-0.5 rounded uppercase">
                              {booking.scheduled_start_time?.slice(0, 5)}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${badge.bg} ${badge.text}`}
                            >
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-[#1a1c1b] leading-tight mt-1.5">
                            {booking.profiles.full_name} — {booking.services.name}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#3e4943] mt-6">
          <span className="font-bold uppercase tracking-wider text-[10px]">
            Legend:
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#005d42]" /> Booked
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#ba1a1a]" /> Blocked
          </span>
        </div>
      </main>
    </div>
  )
}
