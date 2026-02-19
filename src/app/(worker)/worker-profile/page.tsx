'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { StarRating } from '@/components/ui/star-rating'
import {
  Edit, ShieldCheck, BadgeCheck, Clock, Briefcase,
  MapPin, Eye, ChevronRight, Calendar
} from 'lucide-react'
import { motion } from 'framer-motion'

interface WorkerProfileData {
  id: string
  bio: string | null
  hourly_rate: number | null
  overall_rating: number
  total_reviews: number
  profile_completeness: number
  is_active: boolean
  id_verified: boolean
  criminal_check_clear: boolean
}

interface WorkerServiceData {
  id: string
  services: { name: string; category: string }
}

interface WorkerAvailabilityData {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function WorkerProfilePage() {
  const { user, profile, isLoading: userLoading } = useUser()
  const supabase = createClient()

  const [workerProfile, setWorkerProfile] = useState<WorkerProfileData | null>(null)
  const [services, setServices] = useState<WorkerServiceData[]>([])
  const [availability, setAvailability] = useState<WorkerAvailabilityData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      const { data: wp } = await supabase
        .from('worker_profiles')
        .select('id, bio, hourly_rate, overall_rating, total_reviews, profile_completeness, is_active, id_verified, criminal_check_clear')
        .eq('user_id', user.id)
        .single()

      if (wp) {
        setWorkerProfile(wp)

        // Fetch services
        const { data: svc } = await supabase
          .from('worker_services')
          .select('id, services(name, category)')
          .eq('worker_id', wp.id)

        if (svc) setServices(svc as unknown as WorkerServiceData[])

        // Fetch availability
        const { data: avail } = await supabase
          .from('worker_availability')
          .select('id, day_of_week, start_time, end_time, is_available')
          .eq('worker_id', wp.id)
          .order('day_of_week', { ascending: true })

        if (avail) setAvailability(avail)
      }

      setIsLoading(false)
    }

    if (!userLoading) loadProfile()
  }, [user, userLoading, supabase])

  if (userLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    )
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

  const completeness = workerProfile?.profile_completeness || 0

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center text-center"
      >
        <Avatar className="h-24 w-24 mb-3">
          <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'Worker'} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>

        <h1 className="text-2xl font-bold">{profile?.full_name || 'Worker'}</h1>

        <div className="flex items-center gap-2 mt-1">
          <StarRating rating={workerProfile?.overall_rating || 0} size="sm" />
          <span className="text-sm text-muted-foreground">
            ({workerProfile?.total_reviews || 0} reviews)
          </span>
        </div>

        {/* Verification Badges */}
        <div className="flex items-center gap-2 mt-3">
          {workerProfile?.id_verified && (
            <Badge variant="success" className="gap-1">
              <BadgeCheck className="w-3 h-3" />
              ID Verified
            </Badge>
          )}
          {workerProfile?.criminal_check_clear && (
            <Badge variant="success" className="gap-1">
              <ShieldCheck className="w-3 h-3" />
              Background Clear
            </Badge>
          )}
          {!workerProfile?.id_verified && !workerProfile?.criminal_check_clear && (
            <Badge variant="outline" className="gap-1">
              Unverified
            </Badge>
          )}
        </div>

        {workerProfile?.hourly_rate && (
          <p className="text-lg font-semibold text-primary mt-2">
            R{workerProfile.hourly_rate}/hr
          </p>
        )}
      </motion.div>

      {/* Profile Completeness */}
      {completeness < 100 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Profile completeness</span>
              <span className="text-sm font-bold text-primary">{completeness}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bio Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent>
            {workerProfile?.bio ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {workerProfile.bio}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No bio added yet. Tell clients about yourself and your experience.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Services */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            {services.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {services.map(svc => (
                  <Badge key={svc.id} variant="secondary">
                    {svc.services.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No services added yet.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Availability */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availability.length > 0 ? (
              <div className="space-y-2">
                {availability.filter(a => a.is_available).map(slot => (
                  <div key={slot.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{DAYS[slot.day_of_week]}</span>
                    <span className="text-muted-foreground">
                      {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                    </span>
                  </div>
                ))}
                {availability.filter(a => a.is_available).length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No available days set.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No availability schedule set.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="space-y-3"
      >
        <Button asChild className="w-full h-12 text-base">
          <Link href="/worker-profile/edit">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Link>
        </Button>

        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
          <Eye className="w-3 h-3" />
          Clients can see your profile when searching for workers in your area.
        </p>
      </motion.div>
    </div>
  )
}
