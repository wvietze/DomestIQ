'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Skeleton } from '@/components/ui/skeleton'
import { LayoutGrid, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { SimpleProfileView } from '@/components/worker-profile/simple-profile-view'
import { ProfessionalProfileView } from '@/components/worker-profile/professional-profile-view'
import type { WorkerProfileViewData, WorkerServiceView } from '@/lib/types/worker-profile-view'

type ViewMode = 'simple' | 'professional'

const VIEW_MODE_KEY = 'domestiq-worker-profile-view'

export default function WorkerProfilePage() {
  const { user, profile, isLoading: userLoading } = useUser()
  const supabase = createClient()

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(VIEW_MODE_KEY) as ViewMode) || 'simple'
    }
    return 'simple'
  })
  const [data, setData] = useState<WorkerProfileViewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode)
  }, [viewMode])

  useEffect(() => {
    async function loadProfile() {
      if (!user || !profile) return

      // Fetch worker profile
      const { data: wp } = await supabase
        .from('worker_profiles')
        .select('id, bio, hourly_rate, overall_rating, total_reviews, profile_completeness, is_active, id_verified, criminal_check_clear, location_lat, location_lng, service_radius_km, referral_code, top_traits, created_at')
        .eq('user_id', user.id)
        .single()

      if (!wp) {
        setIsLoading(false)
        return
      }

      // Fetch everything in parallel
      const [servicesRes, availRes, portfolioRes, reviewsRes, jobsRes, cvRes] = await Promise.all([
        // Services with enriched data
        supabase
          .from('worker_services')
          .select('id, service_id, services(name, category), skill_level, years_experience, custom_rate')
          .eq('worker_id', wp.id),

        // Availability
        supabase
          .from('worker_availability')
          .select('id, worker_id, day_of_week, start_time, end_time, is_available, created_at')
          .eq('worker_id', wp.id)
          .order('day_of_week', { ascending: true }),

        // Portfolio
        supabase
          .from('portfolio_images')
          .select('id, worker_profile_id, image_url, caption, service_id, sort_order, created_at')
          .eq('worker_profile_id', wp.id)
          .order('sort_order', { ascending: true }),

        // Reviews
        supabase
          .from('reviews')
          .select('id, booking_id, reviewer_id, reviewee_id, overall_rating, punctuality, quality, communication, comment, traits, is_public, created_at, updated_at')
          .eq('reviewee_id', user.id)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(10),

        // Jobs completed (count of completed bookings)
        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('worker_id', wp.id)
          .eq('status', 'completed'),

        // CV data
        supabase
          .from('cv_data')
          .select('*')
          .eq('worker_id', wp.id)
          .single(),
      ])

      // Fetch references and estates via API (these use API routes)
      let references: WorkerProfileViewData['references'] = []
      let estates: WorkerProfileViewData['estates'] = []

      try {
        const [refRes, estateRes] = await Promise.all([
          fetch(`/api/references?workerId=${wp.id}`),
          fetch(`/api/worker-estates?workerId=${wp.id}`),
        ])
        if (refRes.ok) references = await refRes.json()
        if (estateRes.ok) estates = await estateRes.json()
      } catch {
        // Non-critical, ignore
      }

      // Map services to WorkerServiceView
      const services: WorkerServiceView[] = (servicesRes.data || []).map((svc: Record<string, unknown>) => ({
        id: svc.id as string,
        service_id: svc.service_id as string,
        service_name: (svc.services as Record<string, string>)?.name || 'Unknown',
        category: (svc.services as Record<string, string>)?.category || '',
        skill_level: (svc.skill_level as string) || null,
        years_experience: (svc.years_experience as number) ?? null,
        custom_rate: (svc.custom_rate as number) ?? null,
      }))

      const viewData: WorkerProfileViewData = {
        profile: {
          id: wp.id,
          user_id: user.id,
          full_name: profile.full_name || 'Worker',
          avatar_url: profile.avatar_url || null,
          phone: profile.phone || null,
          email: profile.email || null,
          bio: wp.bio,
          hourly_rate: wp.hourly_rate,
          overall_rating: wp.overall_rating || 0,
          total_reviews: wp.total_reviews || 0,
          profile_completeness: wp.profile_completeness || 0,
          is_active: wp.is_active ?? true,
          id_verified: wp.id_verified ?? false,
          criminal_check_clear: wp.criminal_check_clear ?? false,
          location_lat: wp.location_lat,
          location_lng: wp.location_lng,
          service_radius_km: wp.service_radius_km,
          referral_code: wp.referral_code,
          created_at: wp.created_at,
        },
        services,
        availability: availRes.data || [],
        portfolio: portfolioRes.data || [],
        reviews: reviewsRes.data || [],
        topTraits: (wp.top_traits as string[]) || [],
        references,
        estates,
        jobsCompleted: jobsRes.count || 0,
        cvData: cvRes.data || null,
      }

      setData(viewData)
      setIsLoading(false)
    }

    if (!userLoading) loadProfile()
  }, [user, profile, userLoading, supabase])

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

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center py-20">
        <p className="text-muted-foreground">No worker profile found. Please complete your registration.</p>
      </div>
    )
  }

  return (
    <div>
      {/* View Mode Toggle */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b">
        <div className="max-w-2xl mx-auto px-4 py-2 flex justify-center">
          <div className="inline-flex rounded-full bg-gray-100 p-1">
            <button
              onClick={() => setViewMode('simple')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                viewMode === 'simple'
                  ? 'bg-white shadow-sm text-emerald-700'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Simple
            </button>
            <button
              onClick={() => setViewMode('professional')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                viewMode === 'professional'
                  ? 'bg-white shadow-sm text-emerald-700'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="w-4 h-4" />
              Professional
            </button>
          </div>
        </div>
      </div>

      {/* Render active view */}
      <motion.div
        key={viewMode}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {viewMode === 'simple' ? (
          <SimpleProfileView data={data} />
        ) : (
          <ProfessionalProfileView data={data} />
        )}
      </motion.div>
    </div>
  )
}
