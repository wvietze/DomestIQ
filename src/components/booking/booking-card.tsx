'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
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
  pending: 'bg-[#ffdcc3] text-[#904d00]',
  accepted: 'bg-[#9ffdd3] text-[#005d42]',
  confirmed: 'bg-[#9ffdd3] text-[#005d42]',
  in_progress: 'bg-[#ffdcc3] text-[#904d00]',
  completed: 'bg-[#005d42] text-white',
  cancelled: 'bg-[#eeeeec] text-[#3e4943]',
  no_show: 'bg-[#ffdad6] text-[#ba1a1a]',
  disputed: 'bg-[#ffdad6] text-[#ba1a1a]',
}

export function BookingCard({ booking, role, className }: BookingCardProps) {
  const href = role === 'worker' ? `/worker-bookings/${booking.id}` : `/bookings/${booking.id}`
  const date = new Date(booking.start_time)
  const dateStr = date.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })
  const timeStr = date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })

  return (
    <Link href={href}>
      <Card className={cn('hover:shadow-md transition-shadow cursor-pointer bg-white', className)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-12 h-12 shrink-0">
              <AvatarImage src={booking.other_party.avatar_url || undefined} />
              <AvatarFallback className="bg-[#9ffdd3] text-[#005d42]">{booking.other_party.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold truncate text-[#1a1c1b]">{booking.other_party.full_name}</h3>
                  <p className="text-sm text-[#3e4943]">{booking.service_name}</p>
                </div>
                <Badge className={cn('shrink-0 capitalize text-xs border-0', statusColors[booking.status] || 'bg-[#eeeeec] text-[#3e4943]')}>{booking.status.replace('_', ' ')}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-[#3e4943]">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span>{dateStr}</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span>{timeStr}</span>
                {booking.address && <span className="flex items-center gap-1 truncate"><span className="material-symbols-outlined text-sm shrink-0">location_on</span>{booking.address}</span>}
              </div>
              {booking.total_amount && <p className="mt-1 font-semibold text-[#005d42] text-sm">R{booking.total_amount.toFixed(2)}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
