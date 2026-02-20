'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { StarRating } from '@/components/ui/star-rating'
import {
  Edit, ShieldCheck, BadgeCheck, Clock, Briefcase,
  Eye, Calendar, Settings, CheckCircle2, MapPin
} from 'lucide-react'
import { motion } from 'framer-motion'

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }

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
  location_lat: number | null
  location_lng: number | null
  service_radius_km: number | null
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
        .select('id, bio, hourly_rate, overall_rating, total_reviews, profile_completeness, is_active, id_verified, criminal_check_clear, location_lat, location_lng, service_radius_km')
        .eq('user_id', user.id)
        .single()

      if (wp) {
        setWorkerProfile(wp)

        const { data: svc } = await supabase
          .from('worker_services')
          .select('id, services(name, category)')
          .eq('worker_id', wp.id)

        if (svc) setServices(svc as unknown as WorkerServiceData[])

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
          <Skeleton className="h-28 w-28 rounded-full" />
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
    <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="flex flex-col items-center text-center space-y-3">
        <div className="relative inline-block">
          <Avatar className="h-28 w-28 border-4 border-emerald-100 shadow-lg">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'Worker'} />
            <AvatarFallback className="text-3xl bg-emerald-50 text-emerald-700 font-bold">{initials}</AvatarFallback>
          </Avatar>
          {(workerProfile?.id_verified || workerProfile?.criminal_check_clear) && (
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold">{profile?.full_name || 'Worker'}</h1>

        <div className="flex items-center gap-2">
          <StarRating rating={workerProfile?.overall_rating || 0} size="sm" />
          <span className="text-sm text-muted-foreground">
            ({workerProfile?.total_reviews || 0} reviews)
          </span>
        </div>

        {workerProfile?.hourly_rate && (
          <p className="text-xl font-bold text-emerald-700">
            R{workerProfile.hourly_rate}/hr
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap justify-center">
          {workerProfile?.id_verified && (
            <Badge className="gap-1 bg-emerald-100 text-emerald-800 border-0">
              <BadgeCheck className="w-3 h-3" />
              ID Verified
            </Badge>
          )}
          {workerProfile?.criminal_check_clear && (
            <Badge className="gap-1 bg-emerald-100 text-emerald-800 border-0">
              <CheckCircle2 className="w-3 h-3" />
              Background Clear
            </Badge>
          )}
          {!workerProfile?.id_verified && !workerProfile?.criminal_check_clear && (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              Not yet verified
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Profile Completeness */}
      {completeness < 100 && (
        <motion.div variants={fadeUp}>
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-amber-800">Profile completeness</span>
                <span className="text-sm font-bold text-amber-700">{completeness}%</span>
              </div>
              <div className="w-full bg-amber-100 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <p className="text-xs text-amber-700 mt-2">
                Complete your profile to rank higher in search results
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Bio Section */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-2">About</h2>
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
      <motion.div variants={fadeUp}>
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              Services
            </h2>
            {services.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {services.map(svc => (
                  <Badge key={svc.id} className="bg-emerald-50 text-emerald-700 border-0">
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
      <motion.div variants={fadeUp}>
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              Availability
            </h2>
            {availability.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {availability.filter(a => a.is_available).map(slot => (
                  <div key={slot.id} className="flex items-center justify-between py-2 px-3 bg-emerald-50/50 rounded-lg">
                    <span className="text-sm font-medium">{DAYS[slot.day_of_week]}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                    </span>
                  </div>
                ))}
                {availability.filter(a => a.is_available).length === 0 && (
                  <p className="text-sm text-muted-foreground italic col-span-2">
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

      {/* Service Area */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Service Area
            </h2>
            {workerProfile?.location_lat && workerProfile?.location_lng ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 py-2 px-3 bg-emerald-50/50 rounded-lg">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-sm font-medium">
                    {workerProfile.location_lat.toFixed(4)}, {workerProfile.location_lng.toFixed(4)}
                  </span>
                </div>
                {workerProfile.service_radius_km && (
                  <p className="text-sm text-muted-foreground">
                    Willing to travel up to <span className="font-semibold text-emerald-700">{workerProfile.service_radius_km} km</span>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No service area set. Add your location so clients can find you.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={fadeUp} className="space-y-3">
        <Button asChild className="w-full h-12 text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
          <Link href="/worker-profile/edit">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Link>
        </Button>

        <Button asChild variant="outline" className="w-full h-12 text-base">
          <Link href="/worker-settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings & Bank Details
          </Link>
        </Button>

        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
          <Eye className="w-3 h-3" />
          Clients can see your profile when searching for workers in your area.
        </p>
      </motion.div>
    </motion.div>
  )
}
