'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { StarRating } from '@/components/ui/star-rating'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ShieldCheck, CheckCircle2, Calendar,
  MessageSquare, Clock, ArrowLeft
} from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }

interface WorkerData {
  id: string; user_id: string; bio: string | null; hourly_rate: number | null
  overall_rating: number; total_reviews: number; id_verified: boolean
  criminal_check_clear: boolean; profile_completeness: number
  profiles: { full_name: string; avatar_url: string | null; phone: string | null }
  worker_services: Array<{ services: { id: string; name: string; icon: string }; custom_rate: number | null }>
  worker_availability: Array<{ day_of_week: number; start_time: string; end_time: string; is_available: boolean }>
}

interface ReviewData {
  id: string; overall_rating: number; punctuality: number | null
  quality: number | null; communication: number | null; comment: string | null
  created_at: string; profiles: { full_name: string; avatar_url: string | null }
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function WorkerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const [worker, setWorker] = useState<WorkerData | null>(null)
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadWorker() {
      const { data } = await supabase
        .from('worker_profiles')
        .select('*, profiles!inner(full_name, avatar_url, phone), worker_services(services(id, name, icon), custom_rate), worker_availability(day_of_week, start_time, end_time, is_available)')
        .eq('user_id', id)
        .single()

      if (data) setWorker(data as unknown as WorkerData)

      const { data: reviewData } = await supabase
        .from('reviews')
        .select('*, profiles!reviewer_id(full_name, avatar_url)')
        .eq('reviewee_id', id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10)

      if (reviewData) setReviews(reviewData as unknown as ReviewData[])
      setIsLoading(false)
    }
    loadWorker()
  }, [id, supabase])

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <Skeleton className="w-24 h-24 rounded-full mx-auto" />
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (!worker) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center py-12">
        <p className="text-lg font-medium">Worker not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const profile = worker.profiles

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Back Button */}
      <motion.div variants={fadeUp}>
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1 text-muted-foreground -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </motion.div>

      {/* Header */}
      <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="text-center space-y-3">
        <div className="relative inline-block">
          <Avatar className="w-28 h-28 border-4 border-emerald-100 shadow-lg">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-3xl bg-emerald-50 text-emerald-700 font-bold">
              {profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          {(worker.id_verified || worker.criminal_check_clear) && (
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        <h1 className="text-2xl font-bold">{profile.full_name}</h1>
        <div className="flex items-center justify-center gap-2">
          <StarRating rating={worker.overall_rating} />
          <span className="text-muted-foreground">({worker.total_reviews} reviews)</span>
        </div>
        {worker.hourly_rate && (
          <p className="text-xl font-bold text-emerald-700">R{worker.hourly_rate}/hr</p>
        )}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {worker.id_verified && (
            <Badge className="gap-1 bg-emerald-100 text-emerald-800 border-0">
              <ShieldCheck className="w-3 h-3" /> ID Verified
            </Badge>
          )}
          {worker.criminal_check_clear && (
            <Badge className="gap-1 bg-emerald-100 text-emerald-800 border-0">
              <CheckCircle2 className="w-3 h-3" /> Background Clear
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={fadeUp} className="flex gap-3">
        <Button className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-base"
          onClick={() => router.push(`/bookings/new?worker=${id}`)}>
          <Calendar className="w-5 h-5 mr-2" /> Book Now
        </Button>
        <Button variant="outline" className="h-12 px-5" onClick={() => router.push(`/messages?with=${id}`)}>
          <MessageSquare className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* Bio */}
      {worker.bio && (
        <motion.div variants={fadeUp}>
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-2">About</h2>
              <p className="text-muted-foreground leading-relaxed">{worker.bio}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Services */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3">Services</h2>
            <div className="space-y-2">
              {worker.worker_services.map(ws => (
                <div key={ws.services.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="font-medium">{ws.services.name}</span>
                  {(ws.custom_rate || worker.hourly_rate) && (
                    <span className="font-semibold text-emerald-700">R{ws.custom_rate || worker.hourly_rate}/hr</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Availability */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3">Availability</h2>
            <div className="grid grid-cols-2 gap-2">
              {worker.worker_availability
                .filter(a => a.is_available)
                .sort((a, b) => a.day_of_week - b.day_of_week)
                .map(a => (
                  <div key={a.day_of_week} className="flex items-center justify-between py-2 px-3 bg-emerald-50/50 rounded-lg">
                    <span className="text-sm font-medium">{DAYS[a.day_of_week]}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {a.start_time.slice(0, 5)} - {a.end_time.slice(0, 5)}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reviews */}
      <motion.div variants={fadeUp}>
        <h2 className="font-semibold mb-3">Reviews ({worker.total_reviews})</h2>
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">No reviews yet</CardContent>
            </Card>
          ) : (
            reviews.map(review => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={review.profiles.avatar_url || undefined} />
                      <AvatarFallback className="bg-gray-100 text-xs">{review.profiles.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{review.profiles.full_name}</p>
                      <StarRating rating={review.overall_rating} size="sm" />
                    </div>
                    <span className="ml-auto text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>}
                  {(review.punctuality || review.quality || review.communication) && (
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      {review.punctuality && <span>Punctuality: {review.punctuality}/5</span>}
                      {review.quality && <span>Quality: {review.quality}/5</span>}
                      {review.communication && <span>Communication: {review.communication}/5</span>}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
