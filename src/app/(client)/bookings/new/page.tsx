'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { useTranslation } from '@/lib/hooks/use-translation'
import { BouncingDots } from '@/components/loading'
import { cn } from '@/lib/utils'

// Payment imports — commented out for future restoration
// import { calculatePlatformFee } from '@/lib/types/payment'

function NewBookingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const workerId = searchParams.get('worker')
  const supabase = createClient()
  const { user } = useUser()
  const { t } = useTranslation()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [worker, setWorker] = useState<{
    full_name: string
    avatar_url: string | null
    services: Array<{ id: string; name: string; rate: number | null }>
  } | null>(null)

  const [serviceId, setServiceId] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('17:00')
  const [address, setAddress] = useState('')
  const [instructions, setInstructions] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringDays, setRecurringDays] = useState<number[]>([])
  const [workerAvailability, setWorkerAvailability] = useState<
    Array<{ day_of_week: number; start_time: string; end_time: string; is_available: boolean }>
  >([])
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set())
  const [dateWarning, setDateWarning] = useState('')

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  useEffect(() => {
    if (!workerId) return
    async function loadWorker() {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', workerId)
        .single()

      const { data: wp } = await supabase
        .from('worker_profiles')
        .select('id, hourly_rate, worker_services(service_id, custom_rate, services(id, name))')
        .eq('user_id', workerId)
        .single()

      if (profile && wp) {
        const services = (
          (wp as Record<string, unknown>).worker_services as Array<{
            service_id: string
            custom_rate: number | null
            services: { id: string; name: string }
          }>
        ).map((ws) => ({
          id: ws.services.id,
          name: ws.services.name,
          rate: ws.custom_rate || (wp.hourly_rate as number | null),
        }))
        setWorker({ ...profile, services })

        // Load availability
        const { data: avail } = await supabase
          .from('worker_availability')
          .select('day_of_week, start_time, end_time, is_available')
          .eq('worker_id', (wp as Record<string, unknown>).id as string)
        if (avail)
          setWorkerAvailability(
            avail as Array<{
              day_of_week: number
              start_time: string
              end_time: string
              is_available: boolean
            }>
          )

        // Load blocked dates (next 90 days)
        const today = new Date()
        const future = new Date(today)
        future.setDate(future.getDate() + 90)
        try {
          const res = await fetch(
            `/api/blocked-dates?worker_id=${workerId}&from=${today.toISOString().split('T')[0]}&to=${future.toISOString().split('T')[0]}`
          )
          if (res.ok) {
            const data = await res.json()
            setBlockedDates(
              new Set(
                (data.blocked_dates || []).map((d: { blocked_date: string }) => d.blocked_date)
              )
            )
          }
        } catch {
          /* ignore */
        }
      }
    }
    loadWorker()
  }, [workerId, supabase])

  // Calculate estimated hours from start/end time
  const calculateHours = (): number => {
    if (!startTime || !endTime) return 0
    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM
    const diff = endMinutes - startMinutes
    if (diff <= 0) return 0
    return Math.round((diff / 60) * 100) / 100
  }

  // Get the selected service
  const selectedService = worker?.services.find((s) => s.id === serviceId) || null

  // Calculate estimated cost (informational only)
  const estimatedHours = calculateHours()
  const workerRate = selectedService?.rate || 0
  const workerAmount = Math.round(workerRate * estimatedHours * 100) / 100

  // Validate date when it changes
  useEffect(() => {
    if (!date) {
      setDateWarning('')
      return
    }
    const selected = new Date(date + 'T00:00:00')
    const dayOfWeek = selected.getDay()

    // Check blocked dates
    if (blockedDates.has(date)) {
      setDateWarning('This worker has blocked this date and is unavailable.')
      return
    }

    // Check availability schedule
    const dayAvail = workerAvailability.find((a) => a.day_of_week === dayOfWeek)
    if (dayAvail && !dayAvail.is_available) {
      setDateWarning(
        `This worker is not available on ${['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'][dayOfWeek]}.`
      )
      return
    }

    // Auto-populate times from worker's schedule
    if (dayAvail && dayAvail.is_available) {
      setStartTime(dayAvail.start_time.slice(0, 5))
      setEndTime(dayAvail.end_time.slice(0, 5))
    }

    setDateWarning('')
  }, [date, workerAvailability, blockedDates])

  const handleSendRequest = async () => {
    setError('')

    if (!serviceId || !date || !address) {
      setError('Please fill in all required fields')
      return
    }
    if (estimatedHours <= 0) {
      setError('End time must be after start time')
      return
    }

    setIsLoading(true)
    try {
      if (!user) throw new Error('Not authenticated')

      const { data: booking, error: insertError } = await supabase
        .from('bookings')
        .insert({
          client_id: user.id,
          worker_id: workerId,
          service_id: serviceId,
          scheduled_date: date,
          start_time: startTime,
          end_time: endTime,
          address,
          instructions: instructions || null,
          is_recurring: isRecurring,
          recurrence_rule: isRecurring ? { days: recurringDays } : null,
          status: 'pending',
          total_amount: workerAmount,
        })
        .select('id')
        .single()

      if (insertError) throw insertError
      if (!booking) throw new Error('Failed to create booking')

      // Create notification for worker
      await supabase.from('notifications').insert({
        user_id: workerId,
        type: 'new_booking',
        title: 'New Booking Request',
        body: `You have a new booking request for ${date}`,
        action_url: '/worker-bookings',
      })

      // Payment: Paystack initialization commented out for future restoration
      // const paymentRes = await fetch('/api/payments/initialize', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ booking_id: booking.id }),
      // })
      //
      // const paymentData = await paymentRes.json()
      //
      // if (!paymentRes.ok) {
      //   throw new Error(paymentData.error || 'Payment initialization failed')
      // }
      //
      // // Redirect to Paystack checkout
      // if (paymentData.authorization_url) {
      //   window.location.href = paymentData.authorization_url
      //   return
      // }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Calendar helpers ──
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    // Monday = 0, adjust from getDay() where Sunday = 0
    let startOffset = firstDay.getDay() - 1
    if (startOffset < 0) startOffset = 6
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const cells: Array<{ day: number; inMonth: boolean; dateStr: string }> = []

    // Previous month padding
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i
      const prevMonth = month === 0 ? 11 : month - 1
      const prevYear = month === 0 ? year - 1 : year
      const m = String(prevMonth + 1).padStart(2, '0')
      const dd = String(d).padStart(2, '0')
      cells.push({ day: d, inMonth: false, dateStr: `${prevYear}-${m}-${dd}` })
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const m = String(month + 1).padStart(2, '0')
      const dd = String(d).padStart(2, '0')
      cells.push({ day: d, inMonth: true, dateStr: `${year}-${m}-${dd}` })
    }

    // Next month padding to fill 6 rows
    const remaining = 42 - cells.length
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month === 11 ? 0 : month + 1
      const nextYear = month === 11 ? year + 1 : year
      const m = String(nextMonth + 1).padStart(2, '0')
      const dd = String(d).padStart(2, '0')
      cells.push({ day: d, inMonth: false, dateStr: `${nextYear}-${m}-${dd}` })
    }

    return cells
  }, [calendarMonth])

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  const monthLabel = useMemo(() => {
    return calendarMonth.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })
  }, [calendarMonth])

  const navigateMonth = (direction: -1 | 1) => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1))
  }

  // Time slot options
  const timeSlots = useMemo(() => {
    const slots: string[] = []
    for (let h = 6; h <= 20; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`)
      if (h < 20) slots.push(`${String(h).padStart(2, '0')}:30`)
    }
    return slots
  }, [])

  const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // ── Success screen ──
  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#97f5cc] flex items-center justify-center mx-auto">
            <span
              className="material-symbols-outlined text-[#005d42] text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <div>
            <h2 className="font-heading font-bold text-2xl text-[#1a1c1b] mb-2">
              {t('booking.request_sent', 'Request Sent!')}
            </h2>
            <p className="text-[#3e4943] leading-relaxed">
              {worker?.full_name || 'Your worker'}{' '}
              {t(
                'booking.request_sent_desc',
                'will review your request and get back to you shortly. You can also message them to discuss details.'
              )}
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => router.push(`/messages?with=${workerId}`)}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-[#bdc9c1] text-[#005d42] font-medium transition-all duration-200 active:scale-[0.98] hover:bg-[#f4f4f2]"
            >
              <span className="material-symbols-outlined text-xl">chat</span>
              {t('booking.send_message', 'Send Message')}
            </button>
            <button
              onClick={() => router.push('/bookings')}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#005d42] text-white font-bold transition-all duration-200 active:scale-[0.98] hover:bg-[#047857]"
            >
              <span className="material-symbols-outlined text-xl">calendar_month</span>
              {t('booking.view_bookings', 'View Bookings')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main form ──
  return (
    <>
      {/* Top App Bar */}
      <header className="bg-[#f9f9f7] flex items-center px-6 py-4 w-full sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="transition-all duration-200 active:scale-95 text-[#005d42] flex items-center justify-center"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-heading font-bold text-lg tracking-tight text-[#005d42]">
            {t('booking.new_booking', 'New Booking')}
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pb-32">
        {/* Worker Preview Card */}
        {worker && (
          <section className="mt-8 mb-10">
            <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-6 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#005d42]" />
              <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-[#e8e8e6]">
                {worker.avatar_url ? (
                  <Image
                    alt={worker.full_name}
                    className="w-full h-full object-cover"
                    src={worker.avatar_url}
                    width={80}
                    height={80}
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#97f5cc] text-[#005d42] font-heading font-bold text-2xl">
                    {worker.full_name[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-heading font-bold text-xl text-[#1a1c1b] truncate">
                  {worker.full_name}
                </h2>
                <p className="text-[#3e4943] font-medium mb-1">
                  {worker.services.length} {t('booking.services_available', 'services available')}
                </p>
                {selectedService && (
                  <div className="flex items-center gap-3">
                    <span className="font-heading font-bold text-[#005d42]">
                      R{selectedService.rate}/hr
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <div className="space-y-12">
          {/* Service Selector */}
          <section>
            <label className="block font-heading font-bold text-[#1a1c1b] mb-4">
              {t('booking.what_help', 'What do you need help with?')}
            </label>
            {worker?.services && worker.services.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {worker.services.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => setServiceId(svc.id)}
                    className={cn(
                      'px-6 py-2 rounded-full font-medium text-sm transition-all duration-200 active:scale-95',
                      serviceId === svc.id
                        ? 'bg-[#005d42] text-white shadow-md'
                        : 'bg-[#e8e8e6] text-[#3e4943] hover:bg-[#e2e3e1]'
                    )}
                  >
                    {svc.name}
                    {svc.rate ? ` · R${svc.rate}/hr` : ''}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-9 w-24 rounded-full bg-[#e8e8e6] animate-pulse"
                  />
                ))}
              </div>
            )}
          </section>

          {/* Date Picker — inline calendar */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <label className="block font-heading font-bold text-[#1a1c1b]">
                {t('booking.select_date', 'Select Date')}
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#e8e8e6] transition-colors duration-200 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[#3e4943] text-xl">
                    chevron_left
                  </span>
                </button>
                <span className="text-[#005d42] font-bold text-sm min-w-[130px] text-center">
                  {monthLabel}
                </span>
                <button
                  onClick={() => navigateMonth(1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#e8e8e6] transition-colors duration-200 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[#3e4943] text-xl">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
            <div className="bg-[#f4f4f2] rounded-lg p-4">
              {/* Day of week headers */}
              <div className="grid grid-cols-7 gap-2 text-center mb-2">
                {DAYS.map((d, i) => (
                  <span key={i} className="text-xs font-bold text-[#3e4943]">
                    {d}
                  </span>
                ))}
              </div>
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((cell, i) => {
                  const isPast = cell.dateStr < todayStr
                  const isBlocked = blockedDates.has(cell.dateStr)
                  const isSelected = cell.dateStr === date
                  const isToday = cell.dateStr === todayStr
                  const isDisabled = !cell.inMonth || isPast || isBlocked

                  return (
                    <button
                      key={i}
                      disabled={isDisabled}
                      onClick={() => setDate(cell.dateStr)}
                      className={cn(
                        'h-10 w-10 flex items-center justify-center rounded-full text-sm transition-all duration-200 mx-auto',
                        isSelected
                          ? 'bg-[#005d42] text-white font-bold shadow-lg'
                          : isToday
                            ? 'ring-2 ring-[#005d42] text-[#005d42] font-bold'
                            : !cell.inMonth
                              ? 'text-[#3e4943]/30'
                              : isPast || isBlocked
                                ? 'text-[#3e4943]/30 cursor-not-allowed'
                                : 'text-[#3e4943] hover:bg-[#e2e3e1] cursor-pointer'
                      )}
                    >
                      {cell.day}
                    </button>
                  )
                })}
              </div>
            </div>
            {dateWarning && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#ffdad6] text-[#93000a]">
                <span className="material-symbols-outlined text-base">warning</span>
                <p className="text-sm font-medium">{dateWarning}</p>
              </div>
            )}
          </section>

          {/* Time Selector */}
          <section className="grid grid-cols-2 gap-6">
            <div>
              <label className="block font-heading font-bold text-[#1a1c1b] mb-3">
                {t('booking.start_time', 'Start Time')}
              </label>
              <div className="relative">
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full appearance-none bg-[#f4f4f2] border-none rounded-lg px-4 py-3 text-[#1a1c1b] focus:ring-0 focus:outline-none focus:border-b-2 focus:border-[#005d42] transition-all pr-10"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-[#3e4943]">
                  schedule
                </span>
              </div>
            </div>
            <div>
              <label className="block font-heading font-bold text-[#1a1c1b] mb-3">
                {t('booking.end_time', 'End Time')}
              </label>
              <div className="relative">
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full appearance-none bg-[#f4f4f2] border-none rounded-lg px-4 py-3 text-[#1a1c1b] focus:ring-0 focus:outline-none focus:border-b-2 focus:border-[#005d42] transition-all pr-10"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-[#3e4943]">
                  history
                </span>
              </div>
            </div>
          </section>

          {/* Address Input */}
          <section>
            <label className="block font-heading font-bold text-[#1a1c1b] mb-4">
              {t('booking.service_address', 'Service Address')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t(
                  'booking.address_placeholder',
                  'House number, Street, Suburb'
                )}
                className="w-full bg-[#f4f4f2] border-none rounded-lg px-4 py-4 text-[#1a1c1b] placeholder:text-[#6e7a73] focus:ring-0 focus:outline-none focus:border-b-2 focus:border-[#005d42] transition-all pr-10"
              />
              <span className="material-symbols-outlined absolute right-3 top-4 pointer-events-none text-[#3e4943]">
                location_on
              </span>
            </div>
          </section>

          {/* Special Instructions */}
          <section>
            <label className="block font-heading font-bold text-[#1a1c1b] mb-3">
              {t('booking.special_instructions', 'Special Instructions')}
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={t(
                'booking.instructions_placeholder',
                'Any specific requirements or key locations?'
              )}
              rows={3}
              className="w-full bg-[#f4f4f2] border-none rounded-lg px-4 py-4 text-[#1a1c1b] placeholder:text-[#6e7a73] focus:ring-0 focus:outline-none focus:border-b-2 focus:border-[#005d42] transition-all resize-none"
            />
          </section>

          {/* Recurring Option */}
          <section className="bg-[#f4f4f2] p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#005d42]">event_repeat</span>
                <div>
                  <span className="block font-heading font-bold text-[#1a1c1b]">
                    {t('booking.make_recurring', 'Make this recurring?')}
                  </span>
                  <span className="text-xs text-[#3e4943]">
                    {t('booking.recurring_discount', 'Save 5% on weekly bookings')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isRecurring}
                onClick={() => setIsRecurring(!isRecurring)}
                className={cn(
                  'relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-300',
                  isRecurring ? 'bg-[#005d42]' : 'bg-[#e2e3e1]'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300',
                    isRecurring ? 'translate-x-6' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
            <div
              className={cn(
                'flex justify-between gap-2 transition-all duration-300',
                !isRecurring && 'opacity-40 grayscale pointer-events-none'
              )}
            >
              {DAY_LABELS.map((label, idx) => {
                // Map Mon-Sun (0-6) to JS day index (1-6,0)
                const jsDayIdx = idx === 6 ? 0 : idx + 1
                const isActive = recurringDays.includes(jsDayIdx)
                return (
                  <button
                    key={label}
                    onClick={() =>
                      setRecurringDays((prev) =>
                        prev.includes(jsDayIdx)
                          ? prev.filter((d) => d !== jsDayIdx)
                          : [...prev, jsDayIdx]
                      )
                    }
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 active:scale-95',
                      isActive
                        ? 'bg-[#005d42] text-white'
                        : 'bg-[#e2e3e1] text-[#3e4943]'
                    )}
                  >
                    {label[0]}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Cost Summary */}
          {selectedService && estimatedHours > 0 && (
            <section className="p-6 bg-[#97f5cc] rounded-lg border-l-4 border-[#005d42] relative overflow-hidden">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium uppercase tracking-wider text-[#00513a]/80">
                    {t('booking.estimated_cost', 'Estimated Cost')}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-heading font-extrabold text-2xl text-[#002115]">
                      R{workerAmount}
                    </span>
                    <span className="text-sm font-medium text-[#00513a]/80">
                      ({estimatedHours} {estimatedHours === 1 ? 'hour' : 'hours'} × R
                      {workerRate})
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-3xl text-[#005d42]/30">
                  receipt_long
                </span>
              </div>
              <p className="mt-4 text-xs font-medium italic text-[#00513a]/70 leading-relaxed">
                {t(
                  'booking.request_note',
                  `This is a request. ${worker?.full_name || 'The worker'} will review and confirm your booking before any payment is processed.`
                )}
              </p>
            </section>
          )}

          {/* Error display */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#ffdad6] text-[#93000a]">
              <span className="material-symbols-outlined text-base">error</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
      </main>

      {/* Fixed bottom submit button */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-center items-center bg-white border-t border-[#e8e8e6]/20 shadow-[0_-8px_24px_rgba(26,28,27,0.06)] rounded-t-lg pb-safe">
        <button
          onClick={handleSendRequest}
          disabled={!serviceId || !date || !address || !!dateWarning || isLoading}
          className={cn(
            'flex items-center justify-center bg-[#005d42] text-white rounded-lg px-8 py-4 w-full mx-6 mb-6 mt-6 font-bold transition-all duration-200 active:scale-[0.98] hover:bg-[#047857]',
            (!serviceId || !date || !address || !!dateWarning || isLoading) &&
              'opacity-50 cursor-not-allowed active:scale-100'
          )}
        >
          {isLoading ? (
            <>
              <BouncingDots size="sm" />
              <span className="ml-2 text-sm font-medium">
                {t('booking.sending', 'Sending...')}
              </span>
            </>
          ) : (
            <>
              <span
                className="material-symbols-outlined mr-2"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                send
              </span>
              <span className="text-sm font-medium">
                {t('booking.send_request', 'Send Booking Request')}
              </span>
            </>
          )}
        </button>
      </nav>
    </>
  )
}

export default function NewBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <BouncingDots size="md" />
        </div>
      }
    >
      <NewBookingForm />
    </Suspense>
  )
}
