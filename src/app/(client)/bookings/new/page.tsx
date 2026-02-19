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
import { Calendar, Clock, MapPin, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

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

  const handleSubmit = async () => {
    setError('')
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: insertError } = await supabase.from('bookings').insert({
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
      })

      if (insertError) throw insertError

      // Create notification for worker
      await supabase.from('notifications').insert({
        user_id: workerId,
        type: 'new_booking',
        title: 'New Booking Request',
        body: `You have a new booking request for ${date}`,
        action_url: '/worker-bookings',
      })

      setSuccess(true)
      setTimeout(() => router.push('/bookings'), 2000)
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
        <h2 className="text-2xl font-bold">Booking Sent!</h2>
        <p className="text-muted-foreground">The worker will respond to your request soon.</p>
      </div>
    )
  }

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
        onClick={handleSubmit}
        disabled={!serviceId || !date || !address || isLoading}
        className="w-full h-12 text-lg"
      >
        {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
        Send Booking Request
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
