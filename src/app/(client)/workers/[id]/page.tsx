'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { StarRating } from '@/components/ui/star-rating'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { FavoriteButton } from '@/components/shared/favorite-button'
import { TraitSummary } from '@/components/review/trait-summary'
import { ReferenceCard } from '@/components/reference/reference-card'
import { EstateTag } from '@/components/estate/estate-tag'

function Icon({ name, className = '', style }: { name: string; className?: string; style?: React.CSSProperties }) {
  return <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>
}

interface WorkerData {
  id: string; user_id: string; bio: string | null; hourly_rate: number | null
  overall_rating: number; total_reviews: number; id_verified: boolean
  criminal_check_clear: boolean; profile_completeness: number; created_at: string
  service_radius_km: number
  profiles: { full_name: string; avatar_url: string | null; phone: string | null }
  worker_services: Array<{ services: { id: string; name: string; icon: string }; custom_rate: number | null }>
  worker_availability: Array<{ day_of_week: number; start_time: string; end_time: string; is_available: boolean }>
}

interface PortfolioImg {
  id: string; image_url: string; caption: string | null
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
  const [portfolio, setPortfolio] = useState<PortfolioImg[]>([])
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const [jobsCompleted, setJobsCompleted] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [topTraits, setTopTraits] = useState<Record<string, number>>({})
  const [references, setReferences] = useState<Array<{ id: string; reference_text: string; relationship: 'employer' | 'client' | 'regular_client'; duration_months: number | null; created_at: string; client?: { full_name: string; avatar_url: string | null } }>>([])
  const [estateRegistrations, setEstateRegistrations] = useState<Array<{ id: string; estate: { id: string; name: string; suburb: string; city: string } }>>([])


  useEffect(() => {
    async function loadWorker() {
      const { data } = await supabase
        .from('worker_profiles')
        .select('*, profiles!inner(full_name, avatar_url, phone), worker_services(services(id, name, icon), custom_rate), worker_availability(day_of_week, start_time, end_time, is_available)')
        .eq('user_id', id)
        .single()

      if (data) {
        setWorker(data as unknown as WorkerData)

        // Fetch portfolio images
        const { data: portfolioData } = await supabase
          .from('portfolio_images')
          .select('id, image_url, caption')
          .eq('worker_profile_id', data.id)
          .order('sort_order')
        if (portfolioData) setPortfolio(portfolioData)
      }

      // Completed jobs count
      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('worker_id', id)
        .eq('status', 'completed')
      setJobsCompleted(count || 0)

      const { data: reviewData } = await supabase
        .from('reviews')
        .select('*, profiles!reviewer_id(full_name, avatar_url)')
        .eq('reviewee_id', id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10)

      if (reviewData) setReviews(reviewData as unknown as ReviewData[])

      // Fetch top traits from worker_profiles
      const { data: wpTraits } = await supabase
        .from('worker_profiles')
        .select('top_traits')
        .eq('user_id', id)
        .single()
      if (wpTraits?.top_traits) setTopTraits(wpTraits.top_traits as Record<string, number>)

      // Fetch references
      try {
        const refRes = await fetch(`/api/references?workerId=${id}`)
        const refData = await refRes.json()
        if (refData.references) setReferences(refData.references)
      } catch { /* silent */ }

      // Fetch estate registrations
      try {
        const estateRes = await fetch(`/api/worker-estates?workerId=${id}`)
        const estateData = await estateRes.json()
        if (estateData.registrations) setEstateRegistrations(estateData.registrations)
      } catch { /* silent */ }

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
        <p className="text-lg font-medium text-[#1a1c1b]">Worker not found</p>
        <Button variant="outline" className="mt-4 border border-[#bdc9c1] text-[#1a1c1b] bg-white" onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const profile = worker.profiles
  const memberSince = new Date(worker.created_at).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })

  return (
    <>
      <div className="max-w-2xl mx-auto p-4 space-y-6 pb-28">
        {/* Back Button */}
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1 text-[#3e4943] -ml-2">
            <Icon name="arrow_back" style={{ fontSize: '16px' }} /> Back
          </Button>
        </div>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <Avatar className="w-28 h-28 border-4 border-[#97f5cc] shadow-lg">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-3xl bg-[#f4f4f2] text-[#005d42] font-bold">
                {profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {(worker.id_verified || worker.criminal_check_clear) && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#005d42] rounded-full flex items-center justify-center border-4 border-[#f9f9f7] shadow-sm">
                <Icon name="shield" className="text-white" style={{ fontSize: '16px' }} />
              </div>
            )}
          </div>
          <h1 className="font-heading text-2xl font-bold text-[#1a1c1b]">{profile.full_name}</h1>
          <div className="flex items-center justify-center gap-2">
            <StarRating rating={worker.overall_rating} />
            <span className="text-[#6e7a73]">({worker.total_reviews} reviews)</span>
          </div>
          {worker.hourly_rate && (
            <p className="text-xl font-bold text-[#005d42]">R{worker.hourly_rate}/hr</p>
          )}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {worker.id_verified && (
              <Badge className="gap-1 bg-[#97f5cc]/40 text-[#005d42] border-0">
                <Icon name="shield" style={{ fontSize: '12px' }} /> ID Verified
              </Badge>
            )}
            {worker.criminal_check_clear && (
              <Badge className="gap-1 bg-[#97f5cc]/40 text-[#005d42] border-0">
                <Icon name="check_circle" style={{ fontSize: '12px' }} /> Background Clear
              </Badge>
            )}
          </div>
        </div>

        {/* Top Traits */}
        {Object.keys(topTraits).length > 0 && (
          <div>
            <TraitSummary topTraits={topTraits} />
          </div>
        )}

        {/* Estate Tags */}
        {estateRegistrations.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {estateRegistrations.map(reg => (
              <EstateTag key={reg.id} name={reg.estate.name} suburb={reg.estate.suburb} />
            ))}
          </div>
        )}

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-[#f4f4f2] rounded-xl">
            <Icon name="work" className="mx-auto mb-1 text-[#005d42] block" style={{ fontSize: '20px' }} />
            <p className="text-lg font-bold text-[#1a1c1b]">{jobsCompleted}</p>
            <p className="text-xs text-[#6e7a73]">Jobs Done</p>
          </div>
          <div className="text-center p-3 bg-[#f4f4f2] rounded-xl">
            <Icon name="emoji_events" className="mx-auto mb-1 text-[#904d00] block" style={{ fontSize: '20px' }} />
            <p className="text-lg font-bold text-[#1a1c1b]">{worker.overall_rating.toFixed(1)}</p>
            <p className="text-xs text-[#6e7a73]">Rating</p>
          </div>
          <div className="text-center p-3 bg-[#f4f4f2] rounded-xl">
            <Icon name="schedule" className="mx-auto mb-1 text-[#3e4943] block" style={{ fontSize: '20px' }} />
            <p className="text-lg font-bold text-[#1a1c1b]">{memberSince.split(' ')[0]}</p>
            <p className="text-xs text-[#6e7a73]">{memberSince.split(' ')[1]}</p>
          </div>
        </div>

        {/* Bio */}
        {worker.bio && (
          <div>
            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-4">
                <h2 className="font-heading font-semibold mb-2 text-[#1a1c1b]">About</h2>
                <p className="text-[#3e4943] leading-relaxed">{worker.bio}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Portfolio Gallery */}
        {portfolio.length > 0 && (
          <div>
            <h2 className="font-heading font-semibold mb-3 text-[#1a1c1b]">Work Portfolio</h2>
            <div className="grid grid-cols-3 gap-2">
              {portfolio.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setLightboxIdx(idx)}
                  className="relative aspect-square rounded-xl overflow-hidden hover:opacity-90 transition-opacity active:scale-[0.98]"
                >
                  <Image src={img.image_url} alt={img.caption || 'Work photo'} fill className="object-cover" sizes="(max-width: 768px) 33vw, 200px" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        <div>
          <Card className="bg-white rounded-xl shadow-sm">
            <CardContent className="p-4">
              <h2 className="font-heading font-semibold mb-3 text-[#1a1c1b]">Services</h2>
              <div className="space-y-2">
                {worker.worker_services.map(ws => (
                  <div key={ws.services.id} className="flex items-center justify-between py-2.5 border-b border-[#bdc9c1] last:border-0">
                    <span className="font-medium text-[#1a1c1b]">{ws.services.name}</span>
                    {(ws.custom_rate || worker.hourly_rate) && (
                      <Badge variant="secondary" className="font-semibold text-[#005d42] bg-[#97f5cc]/30">
                        R{ws.custom_rate || worker.hourly_rate}/hr
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Availability */}
        <div>
          <Card className="bg-white rounded-xl shadow-sm">
            <CardContent className="p-4">
              <h2 className="font-heading font-semibold mb-3 text-[#1a1c1b]">Availability</h2>
              <div className="grid grid-cols-2 gap-2">
                {worker.worker_availability
                  .filter(a => a.is_available)
                  .sort((a, b) => a.day_of_week - b.day_of_week)
                  .map(a => (
                    <div key={a.day_of_week} className="flex items-center justify-between py-2 px-3 bg-[#f4f4f2] rounded-lg">
                      <span className="text-sm font-medium text-[#1a1c1b]">{DAYS[a.day_of_week]}</span>
                      <span className="text-xs text-[#6e7a73] flex items-center gap-1">
                        <Icon name="schedule" style={{ fontSize: '12px' }} />
                        {a.start_time.slice(0, 5)} - {a.end_time.slice(0, 5)}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* References */}
        {references.length > 0 && (
          <div>
            <h2 className="font-heading font-semibold mb-3 text-[#1a1c1b]">References ({references.length})</h2>
            <div className="space-y-3">
              {references.slice(0, 3).map(ref => (
                <ReferenceCard key={ref.id} reference={ref} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div>
          <h2 className="font-heading font-semibold mb-3 text-[#1a1c1b]">Reviews ({worker.total_reviews})</h2>
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <Card className="bg-white rounded-xl shadow-sm">
                <CardContent className="p-6 text-center text-[#6e7a73]">No reviews yet</CardContent>
              </Card>
            ) : (
              reviews.map(review => (
                <Card key={review.id} className="bg-white rounded-xl shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={review.profiles.avatar_url || undefined} />
                        <AvatarFallback className="bg-[#f4f4f2] text-xs">{review.profiles.full_name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-[#1a1c1b]">{review.profiles.full_name}</p>
                        <StarRating rating={review.overall_rating} size="sm" />
                      </div>
                      <span className="ml-auto text-xs text-[#6e7a73]">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    {review.comment && <p className="text-sm text-[#3e4943] leading-relaxed">{review.comment}</p>}
                    {(review.punctuality || review.quality || review.communication) && (
                      <div className="flex gap-4 mt-2 text-xs text-[#6e7a73]">
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
        </div>
      </div>

      {/* Sticky Book Now CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-[#bdc9c1] p-4 z-30">
        <div className="max-w-2xl mx-auto flex gap-3">
          <FavoriteButton workerId={id} size="md" className="h-12 w-12 border border-[#bdc9c1] rounded-xl" />
          <Button variant="outline" className="h-12 px-5 border border-[#bdc9c1] text-[#1a1c1b] bg-white active:scale-[0.98]" onClick={() => router.push(`/bookings/new?worker=${id}`)}>
            <Icon name="calendar_today" style={{ fontSize: '20px' }} />
          </Button>
          <Button className="flex-1 h-12 bg-[#005d42] hover:bg-[#047857] text-white text-base font-bold rounded-lg active:scale-[0.98]"
            onClick={() => router.push(`/messages?with=${id}`)}>
            <Icon name="chat" className="mr-2" style={{ fontSize: '20px' }} /> Connect with {profile.full_name.split(' ')[0]}
            {worker.hourly_rate && <span className="ml-2 opacity-80">· From R{worker.hourly_rate}/hr</span>}
          </Button>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxIdx(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white z-10" onClick={() => setLightboxIdx(null)}>
            <Icon name="close" style={{ fontSize: '32px' }} />
          </button>
          {lightboxIdx > 0 && (
            <button className="absolute left-4 text-white/80 hover:text-white z-10"
              onClick={e => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1) }}>
              <Icon name="chevron_left" style={{ fontSize: '40px' }} />
            </button>
          )}
          {lightboxIdx < portfolio.length - 1 && (
            <button className="absolute right-4 text-white/80 hover:text-white z-10"
              onClick={e => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1) }}>
              <Icon name="chevron_right" style={{ fontSize: '40px' }} />
            </button>
          )}
          <div className="relative max-w-[90vw] max-h-[85vh] w-[90vw] h-[85vh]" onClick={e => e.stopPropagation()}>
            <Image
              src={portfolio[lightboxIdx].image_url}
              alt={portfolio[lightboxIdx].caption || 'Portfolio'}
              fill
              className="object-contain rounded-lg"
              sizes="90vw"
            />
          </div>
          {portfolio[lightboxIdx].caption && (
            <p className="absolute bottom-8 text-white text-center text-sm max-w-md">{portfolio[lightboxIdx].caption}</p>
          )}
        </div>
      )}
    </>
  )
}
