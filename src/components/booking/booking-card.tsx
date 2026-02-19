'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BookingCardProps {
  booking: {
    id: string
    service_name: string
    status: string
    start_time: string
    end_time: string | null
    address: string | null
    total_amount: number | null
    other_party: { full_name: string; avatar_url: string | null }
  }
  role: 'client' | 'worker'
  className?: string
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  accepted: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-violet-100 text-violet-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-gray-100 text-gray-600',
  no_show: 'bg-red-100 text-red-800',
  disputed: 'bg-red-100 text-red-800',
}

export function BookingCard({ booking, role, className }: BookingCardProps) {
  const href = role === 'worker' ? `/worker-bookings/${booking.id}` : `/bookings/${booking.id}`
  const date = new Date(booking.start_time)
  const dateStr = date.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })
  const timeStr = date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })

  return (
    <Link href={href}>
      <Card className={cn('hover:shadow-md transition-shadow cursor-pointer', className)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-12 h-12 shrink-0">
              <AvatarImage src={booking.other_party.avatar_url || undefined} />
              <AvatarFallback>{booking.other_party.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold truncate">{booking.other_party.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{booking.service_name}</p>
                </div>
                <Badge className={cn('shrink-0 capitalize text-xs', statusColors[booking.status] || 'bg-gray-100')}>{booking.status.replace('_', ' ')}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{dateStr}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{timeStr}</span>
                {booking.address && <span className="flex items-center gap-1 truncate"><MapPin className="w-3.5 h-3.5 shrink-0" />{booking.address}</span>}
              </div>
              {booking.total_amount && <p className="mt-1 font-semibold text-primary text-sm">R{booking.total_amount.toFixed(2)}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
