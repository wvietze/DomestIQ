'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Calendar, Clock, MapPin, Loader2, CheckCircle2, ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { calculatePlatformFee } from '@/lib/types/payment'

function formatZAR(amount: number): string {
  return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function NewBookingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const workerId = searchParams.get('worker')
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState(0)

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

  // Calculate price breakdown
  const estimatedHours = calculateHours()
  const workerRate = selectedService?.rate || 0
  const workerAmount = Math.round(workerRate * estimatedHours * 100) / 100
  const priceBreakdown = calculatePlatformFee(workerAmount)

  const handleProceedToPayment = () => {
    setError('')
    if (!serviceId || !date || !address) {
      setError('Please fill in all required fields')
      return
    }
    if (estimatedHours <= 0) {
      setError('End time must be after start time')
      return
    }
    if (workerRate <= 0) {
      setError('This service does not have a rate set. Please contact the worker.')
      return
    }
    setStep(1)
  }

  const handleConfirmAndPay = async () => {
    setError('')
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
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

      // Initialize payment with Paystack
      const paymentRes = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: booking.id }),
      })

      const paymentData = await paymentRes.json()

      if (!paymentRes.ok) {
        // Booking was created but payment failed — still show success
        // so the user can retry payment from bookings page
        throw new Error(paymentData.error || 'Payment initialization failed')
      }

      // Redirect to Paystack checkout
      if (paymentData.authorization_url) {
        window.location.href = paymentData.authorization_url
        return
      }

      // Fallback: show success state
      setSuccess(true)
      setTimeout(() => router.push('/bookings'), 3000)
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
        <h2 className="text-2xl font-bold">Payment Processing</h2>
        <p className="text-muted-foreground">Your booking has been created and payment is being processed. Redirecting to your bookings...</p>
      </div>
    )
  }

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // ── Step 1: Review & Pay ──────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-6">
        <button
          onClick={() => { setStep(0); setError('') }}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to details
        </button>

        <h1 className="text-2xl font-bold">Review & Pay</h1>

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
                <p className="text-sm text-muted-foreground">{selectedService?.name}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{new Date(date + 'T00:00:00').toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{startTime} - {endTime} ({estimatedHours} {estimatedHours === 1 ? 'hour' : 'hours'})</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{address}</span>
            </div>
            {instructions && (
              <div className="pt-2 border-t">
                <p className="text-muted-foreground italic">&ldquo;{instructions}&rdquo;</p>
              </div>
            )}
            {isRecurring && recurringDays.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-muted-foreground">
                  Recurring: {recurringDays.sort().map(d => DAYS[d]).join(', ')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Price Breakdown */}
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Price Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Worker rate ({formatZAR(workerRate)}/hr x {estimatedHours} {estimatedHours === 1 ? 'hr' : 'hrs'})
                </span>
                <span className="font-medium">{formatZAR(priceBreakdown.workerAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Platform fee ({priceBreakdown.feePercent}%)
                </span>
                <span className="font-medium">{formatZAR(priceBreakdown.platformFee)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-base">Total</span>
                  <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                    {formatZAR(priceBreakdown.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Workers keep 100% message */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 mt-3">
              <div className="flex gap-2 items-start">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Workers keep 100% of their rate ({formatZAR(priceBreakdown.workerAmount)}). The platform fee is a small service charge to keep DomestIQ running.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button
          onClick={handleConfirmAndPay}
          disabled={isLoading}
          className="w-full h-12 text-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 w-5 h-5" />
              Confirm & Pay {formatZAR(priceBreakdown.totalAmount)}
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          You will be redirected to Paystack to complete your payment securely.
        </p>
      </div>
    )
  }

  // ── Step 0: Booking Details (existing form) ───────────────────────────
  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">New Booking</h1>

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
        onClick={handleProceedToPayment}
        disabled={!serviceId || !date || !address}
        className="w-full h-12 text-lg"
      >
        Review & Pay
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
