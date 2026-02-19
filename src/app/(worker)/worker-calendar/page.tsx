'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChevronLeft, ChevronRight, CalendarDays, Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
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
  addWeeks,
  subWeeks,
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

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500',
  confirmed: 'bg-emerald-600',
  in_progress: 'bg-emerald-500',
  completed: 'bg-gray-400',
  cancelled: 'bg-destructive',
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  pending: 'warning',
  confirmed: 'default',
  in_progress: 'success',
  completed: 'secondary',
  cancelled: 'destructive',
}

const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function WorkerCalendarPage() {
  const { user, isLoading: userLoading } = useUser()
  const supabase = createClient()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [bookings, setBookings] = useState<CalendarBooking[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadBookings() {
      if (!user) return

      let rangeStart: Date
      let rangeEnd: Date

      if (viewMode === 'month') {
        rangeStart = startOfWeek(startOfMonth(currentDate))
        rangeEnd = endOfWeek(endOfMonth(currentDate))
      } else {
        rangeStart = startOfWeek(currentDate)
        rangeEnd = endOfWeek(currentDate)
      }

      const { data } = await supabase
        .from('bookings')
        .select('id, status, scheduled_date, scheduled_start_time, scheduled_end_time, profiles!client_id(full_name), services(name)')
        .eq('worker_id', user.id)
        .gte('scheduled_date', format(rangeStart, 'yyyy-MM-dd'))
        .lte('scheduled_date', format(rangeEnd, 'yyyy-MM-dd'))
        .order('scheduled_start_time', { ascending: true })

      if (data) setBookings(data as unknown as CalendarBooking[])
      setIsLoading(false)
    }

    if (!userLoading) loadBookings()
  }, [user, userLoading, currentDate, viewMode, supabase])

  const navigateForward = () => {
    if (viewMode === 'month') {
      setCurrentDate(prev => addMonths(prev, 1))
    } else {
      setCurrentDate(prev => addWeeks(prev, 1))
    }
  }

  const navigateBack = () => {
    if (viewMode === 'month') {
      setCurrentDate(prev => subMonths(prev, 1))
    } else {
      setCurrentDate(prev => subWeeks(prev, 1))
    }
  }

  const getBookingsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return bookings.filter(b => b.scheduled_date === dateStr)
  }

  const getDaysToDisplay = (): Date[] => {
    if (viewMode === 'month') {
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)
      const calStart = startOfWeek(monthStart)
      const calEnd = endOfWeek(monthEnd)
      return eachDayOfInterval({ start: calStart, end: calEnd })
    } else {
      const weekStart = startOfWeek(currentDate)
      const weekEnd = endOfWeek(currentDate)
      return eachDayOfInterval({ start: weekStart, end: weekEnd })
    }
  }

  const days = getDaysToDisplay()

  const selectedDateBookings = selectedDate
    ? getBookingsForDate(selectedDate)
    : []

  if (userLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-sky-600" />
        </div>
        <h1 className="text-2xl font-bold">Calendar</h1>
      </motion.div>

      {/* View Toggle + Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setViewMode('month')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
              viewMode === 'month'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            )}
          >
            Month
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
              viewMode === 'week'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            )}
          >
            Week
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={navigateBack}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-semibold min-w-[140px] text-center">
            {viewMode === 'month'
              ? format(currentDate, 'MMMM yyyy')
              : `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`
            }
          </span>
          <Button variant="outline" size="sm" onClick={navigateForward}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Today Button */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setCurrentDate(new Date())
            setSelectedDate(new Date())
          }}
          className="text-emerald-600 text-xs"
        >
          Today
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-3">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAY_HEADERS.map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const dayBookings = getBookingsForDate(day)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const today = isToday(day)

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'relative flex flex-col items-center justify-start p-1.5 rounded-lg transition-all min-h-[48px]',
                    isSelected && 'bg-emerald-50 ring-2 ring-emerald-500',
                    !isSelected && today && 'bg-muted',
                    !isSelected && !today && 'hover:bg-muted/50',
                    viewMode === 'month' && !isCurrentMonth && 'opacity-30'
                  )}
                >
                  <span
                    className={cn(
                      'text-sm',
                      today && 'font-bold text-emerald-600',
                      isSelected && 'font-bold'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {/* Booking Dots */}
                  {dayBookings.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayBookings.slice(0, 3).map((b, i) => (
                        <div
                          key={i}
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            statusColors[b.status] || 'bg-emerald-600'
                          )}
                        />
                      ))}
                      {dayBookings.length > 3 && (
                        <span className="text-[8px] text-muted-foreground">+{dayBookings.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Bookings */}
      {selectedDate && (
        <motion.div
          key={selectedDate.toISOString()}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h2>
          </div>

          {selectedDateBookings.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground text-sm">No bookings on this day</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {selectedDateBookings.map(booking => (
                <Link key={booking.id} href={`/worker-bookings/${booking.id}`}>
                  <Card className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className={cn(
                        'w-1 h-10 rounded-full flex-shrink-0',
                        statusColors[booking.status] || 'bg-primary'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {booking.profiles.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.services.name}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {booking.scheduled_start_time?.slice(0, 5)}
                        </p>
                        <Badge variant={statusVariant[booking.status] || 'outline'} className="text-[10px] mt-0.5">
                          {booking.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="font-medium">Legend:</span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-500" /> Pending
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary" /> Confirmed
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500" /> In Progress
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-gray-400" /> Completed
        </span>
      </div>
    </div>
  )
}
