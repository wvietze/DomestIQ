'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Loader2, CheckCircle2, Send, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

// Payment imports — commented out for future restoration
// import { calculatePlatformFee } from '@/lib/types/payment'
// import { CreditCard, ShieldCheck } from 'lucide-react'

function NewBookingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const workerId = searchParams.get('worker')
  const supabase = createClient()
  const { user } = useUser()

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
  const [workerAvailability, setWorkerAvailability] = useState<Array<{ day_of_week: number; start_time: string; end_time: string; is_available: boolean }>>([])
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set())
  const [dateWarning, setDateWarning] = useState('')

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
        const services = ((wp as Record<string, unknown>).worker_services as Array<{
          service_id: string
          custom_rate: number | null
          services: { id: string; name: string }
        }>).map(ws => ({
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
        if (avail) setWorkerAvailability(avail as Array<{ day_of_week: number; start_time: string; end_time: string; is_available: boolean }>)

        // Load blocked dates (next 90 days)
        const today = new Date()
        const future = new Date(today)
        future.setDate(future.getDate() + 90)
        try {
          const res = await fetch(`/api/blocked-dates?worker_id=${workerId}&from=${today.toISOString().split('T')[0]}&to=${future.toISOString().split('T')[0]}`)
          if (res.ok) {
            const data = await res.json()
            setBlockedDates(new Set((data.blocked_dates || []).map((d: { blocked_date: string }) => d.blocked_date)))
          }
        } catch { /* ignore */ }
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
    return Math.round((diff / 60) * 100) / 100 // round to 2 decimal places
  }

  // Get the selected service
  const selectedService = worker?.services.find(s => s.id === serviceId) || null

  // Calculate estimated cost (informational only)
  const estimatedHours = calculateHours()
  const workerRate = selectedService?.rate || 0
  const workerAmount = Math.round(workerRate * estimatedHours * 100) / 100

  // Payment: price breakdown commented out for future restoration
  // const priceBreakdown = calculatePlatformFee(workerAmount)

  // Validate date when it changes
  useEffect(() => {
    if (!date) { setDateWarning(''); return }
    const selected = new Date(date + 'T00:00:00')
    const dayOfWeek = selected.getDay()

    // Check blocked dates
    if (blockedDates.has(date)) {
      setDateWarning('This worker has blocked this date and is unavailable.')
      return
    }

    // Check availability schedule
    const dayAvail = workerAvailability.find(a => a.day_of_week === dayOfWeek)
    if (dayAvail && !dayAvail.is_available) {
      setDateWarning(`This worker is not available on ${['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'][dayOfWeek]}.`)
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

      // Create the booking in Supabase with status 'pending'
      const { data: booking, error: insertError } = await supabase.from('bookings').insert({
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
      }).select('id').single()

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

  if (success) {
    return (
      <div className="max-w-md mx-auto p-4 text-center py-12 space-y-4">
        <CheckCircle2 className="w-16 h-16 text-secondary mx-auto" />
        <h2 className="text-2xl font-bold">Request Sent!</h2>
        <p className="text-muted-foreground">
          {worker?.full_name || 'Your worker'} will review your request and get back to you shortly. You can also message them to discuss details.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push(`/messages?with=${workerId}`)}
          >
            <MessageSquare className="w-4 h-4" />
            Send Message
          </Button>
          <Button
            className="gap-2"
            onClick={() => router.push('/bookings')}
          >
            View Bookings
          </Button>
        </div>
      </div>
    )
  }

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Payment: Step 1 (Review & Pay) removed — single-step booking flow
  // The original step-based flow with price breakdown, platform fee display,
  // "Workers keep 100%" banner, and Paystack redirect has been removed.
  // See git history for the original implementation.

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Request a Booking</h1>

      {/* Worker Info */}
      {worker && (
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Avatar>
              <AvatarImage src={worker.avatar_url || undefined} />
              <AvatarFallback>{worker.full_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{worker.full_name}</p>
              <p className="text-sm text-muted-foreground">
                {worker.services.length} service{worker.services.length !== 1 ? 's' : ''}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Selection */}
      <div className="space-y-2">
        <Label>Service</Label>
        <Select value={serviceId} onValueChange={setServiceId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            {worker?.services.map(svc => (
              <SelectItem key={svc.id} value={svc.id}>
                {svc.name} {svc.rate ? `(R${svc.rate}/hr)` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date & Time */}
      <div className="space-y-2">
        <Label>Date</Label>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
        {dateWarning && (
          <p className="text-amber-600 text-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
            {dateWarning}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Time</Label>
          <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>End Time</Label>
          <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label>Address</Label>
        <Input placeholder="Street address" value={address} onChange={e => setAddress(e.target.value)} />
      </div>

      {/* Instructions */}
      <div className="space-y-2">
        <Label>Special Instructions (optional)</Label>
        <Textarea placeholder="Any special requirements..." value={instructions} onChange={e => setInstructions(e.target.value)} rows={3} />
      </div>

      {/* Recurring */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="w-5 h-5 rounded" />
          <span className="font-medium">Make this a recurring booking</span>
        </label>
        {isRecurring && (
          <div className="flex gap-1.5">
            {DAYS.map((day, idx) => (
              <button
                key={day}
                onClick={() => setRecurringDays(prev =>
                  prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx]
                )}
                className={cn(
                  "w-10 h-10 rounded-lg text-xs font-medium transition-colors",
                  recurringDays.includes(idx)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {day}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button
        onClick={handleSendRequest}
        disabled={!serviceId || !date || !address || !!dateWarning || isLoading}
        className="w-full h-12 text-lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin mr-2" />
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 w-5 h-5" />
            Send Request
          </>
        )}
      </Button>
    </div>
  )
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <NewBookingForm />
    </Suspense>
  )
}
