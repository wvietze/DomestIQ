'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { StarRating } from '@/components/ui/star-rating'
import { MapPin, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkerCardProps {
  worker: {
    worker_id: string
    user_id: string
    full_name: string
    avatar_url: string | null
    bio: string | null
    hourly_rate: number | null
    overall_rating: number
    total_reviews: number
    id_verified: boolean
    criminal_check_clear: boolean
    distance_km: number | null
    services: Array<{ id: string; name: string; icon: string }>
  }
  className?: string
}

export function WorkerCard({ worker, className }: WorkerCardProps) {
  return (
    <Link href={`/workers/${worker.user_id}`}>
      <Card className={cn('hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group', className)}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-emerald-100">
                <AvatarImage src={worker.avatar_url || undefined} alt={worker.full_name} />
                <AvatarFallback className="text-lg bg-emerald-50 text-emerald-700 font-semibold">
                  {worker.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {(worker.id_verified || worker.criminal_check_clear) && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                  <ShieldCheck className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-base truncate group-hover:text-emerald-700 transition-colors">{worker.full_name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <StarRating rating={worker.overall_rating} size="sm" />
                    <span className="text-sm text-muted-foreground">({worker.total_reviews})</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {worker.hourly_rate && (
                    <span className="font-bold text-emerald-700 whitespace-nowrap">R{worker.hourly_rate}/hr</span>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {worker.services.slice(0, 3).map(svc => (
                  <Badge key={svc.id} variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 border-0">
                    {svc.name}
                  </Badge>
                ))}
                {worker.services.length > 3 && (
                  <Badge variant="outline" className="text-xs">+{worker.services.length - 3}</Badge>
                )}
              </div>

              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                {worker.distance_km !== null && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    {worker.distance_km.toFixed(1)} km
                  </span>
                )}
                {worker.id_verified && (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    ID Verified
                  </span>
                )}
                {worker.criminal_check_clear && (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Cleared
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
