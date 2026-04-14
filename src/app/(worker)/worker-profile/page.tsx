'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { useTranslation } from '@/lib/hooks/use-translation'
import { Skeleton } from '@/components/ui/skeleton'
import { TRAIT_LABELS } from '@/lib/types/review'
import type { WorkerProfileViewData, WorkerServiceView } from '@/lib/types/worker-profile-view'

/* ─── Material Symbol Icon Maps ─── */

const TRAIT_ICONS: Record<string, string> = {
  'on-time': 'schedule',
  'efficient': 'bolt',
  'thorough': 'search_check',
  'fast': 'speed',
  'detail-oriented': 'visibility',
  'professional': 'workspace_premium',
  'reliable': 'verified_user',
  'trustworthy': 'handshake',
  'respectful': 'sentiment_satisfied',
  'friendly': 'mood',
  'kind': 'favorite',
  'great-communicator': 'forum',
  'patient': 'spa',
  'good-value': 'savings',
  'goes-extra-mile': 'star',
}

const SERVICE_MATERIAL_ICONS: Record<string, string> = {
  'house-cleaning': 'mop',
  'deep-cleaning': 'cleaning_services',
  'laundry': 'local_laundry_service',
  'ironing': 'iron',
  'cooking': 'soup_kitchen',
  'gardening': 'yard',
  'pool-maintenance': 'pool',
  'painting': 'format_paint',
  'plumbing': 'plumbing',
  'electrical': 'electrical_services',
  'welding': 'hardware',
  'childcare': 'child_care',
  'elderly-care': 'elderly',
  'pet-care': 'pets',
  'moving': 'local_shipping',
  'handyman': 'construction',
}

function getServiceMaterialIcon(name: string): string {
  const kebab = name.toLowerCase().replace(/\s+/g, '-')
  return SERVICE_MATERIAL_ICONS[kebab] || 'home_repair_service'
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 1) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return '1 week ago'
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 60) return '1 month ago'
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)}yr ago`
}

/* ─── Skeleton Loader ─── */

function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-6 pb-32">
      <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
        <Skeleton className="w-full md:w-48 h-64 rounded-xl" />
        <div className="flex-grow space-y-4 w-full">
          <div className="flex gap-2">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-36 rounded-full" />
          </div>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-40" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        </div>
      </div>
      <Skeleton className="h-24 rounded-xl mb-12" />
      <Skeleton className="h-16 rounded-xl mb-12" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        <Skeleton className="aspect-square rounded-xl" />
        <Skeleton className="aspect-square rounded-xl" />
        <Skeleton className="aspect-square rounded-xl hidden md:block" />
      </div>
    </div>
  )
}

/* ─── Main Page Component ─── */

export default function WorkerProfilePage() {
  const { user, profile, isLoading: userLoading } = useUser()
  const { t } = useTranslation()
  const supabase = createClient()

  const [data, setData] = useState<WorkerProfileViewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const [mountTime] = useState(() => Date.now())

  useEffect(() => {
    async function loadProfile() {
      if (!user || !profile) return

      const { data: wp } = await supabase
        .from('worker_profiles')
        .select('id, bio, hourly_rate, overall_rating, total_reviews, profile_completeness, is_active, id_verified, criminal_check_clear, location_lat, location_lng, service_radius_km, referral_code, top_traits, created_at')
        .eq('user_id', user.id)
        .single()

      if (!wp) {
        setIsLoading(false)
        return
      }

      const [servicesRes, availRes, portfolioRes, reviewsRes, jobsRes, cvRes] = await Promise.all([
        supabase
          .from('worker_services')
          .select('id, service_id, services(name, category), skill_level, years_experience, custom_rate')
          .eq('worker_id', wp.id),
        supabase
          .from('worker_availability')
          .select('id, worker_id, day_of_week, start_time, end_time, is_available, created_at')
          .eq('worker_id', wp.id)
          .order('day_of_week', { ascending: true }),
        supabase
          .from('portfolio_images')
          .select('id, worker_profile_id, image_url, caption, service_id, sort_order, created_at')
          .eq('worker_profile_id', wp.id)
          .order('sort_order', { ascending: true }),
        supabase
          .from('reviews')
          .select('id, booking_id, reviewer_id, reviewee_id, overall_rating, punctuality, quality, communication, comment, traits, is_public, created_at, updated_at')
          .eq('reviewee_id', user.id)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('worker_id', wp.id)
          .eq('status', 'completed'),
        supabase
          .from('cv_data')
          .select('*')
          .eq('worker_id', wp.id)
          .single(),
      ])

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
        // Non-critical
      }

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
    return <ProfileSkeleton />
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <span className="material-symbols-outlined text-5xl text-[#6e7a73] mb-4" style={{ fontVariationSettings: "'FILL' 0" }}>person_off</span>
        <p className="text-[#3e4943] text-lg">{t('worker.no_profile', 'No worker profile found. Please complete your registration.')}</p>
      </div>
    )
  }

  const { profile: p, services, availability, portfolio, reviews, topTraits, references, estates, jobsCompleted, cvData } = data

  const headline = services.length > 0
    ? services.map(s => s.service_name).join(' \u00b7 ')
    : t('worker.title', 'Worker')

  const initials = p.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

  const yearsOnPlatform = Math.max(
    1,
    Math.floor((mountTime - new Date(p.created_at).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  )

  const availableSlots = availability.filter(a => a.is_available)

  return (
    <>
      {/* Top Header Bar */}
      <header className="bg-[#f9f9f7] flex justify-between items-center w-full px-6 py-4 sticky top-0 z-40 transition-colors duration-200">
        <div className="flex items-center gap-4">
          <Link href="/worker-dashboard" className="flex items-center">
            <span className="material-symbols-outlined text-[#005d42]">arrow_back</span>
          </Link>
          <h1 className="text-xl font-bold text-[#1a1c1b] font-heading tracking-tight">{t('worker.my_profile', 'My Profile')}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/worker-profile/edit" className="flex items-center">
            <span className="material-symbols-outlined text-[#005d42]">edit</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-6 pb-32">
        {/* Profile Header Section */}
        <section className="flex flex-col md:flex-row gap-8 items-start mb-12">
          {/* Avatar */}
          <div className="w-full md:w-48 h-64 md:h-64 rounded-xl overflow-hidden shadow-sm bg-[#f4f4f2] flex-shrink-0">
            {p.avatar_url ? (
              <Image
                src={p.avatar_url}
                alt={p.full_name}
                width={192}
                height={256}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#97f5cc]">
                <span className="text-5xl font-bold text-[#005d42]">{initials}</span>
              </div>
            )}
          </div>

          <div className="flex-grow">
            {/* Verification Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {p.id_verified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#047857] text-white text-xs font-bold rounded-full">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  {t('worker.id_verified', 'ID Verified')}
                </span>
              )}
              {p.criminal_check_clear && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#047857] text-white text-xs font-bold rounded-full">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
                  {t('worker.background_checked', 'Background Checked')}
                </span>
              )}
              {!p.id_verified && !p.criminal_check_clear && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e2e3e1] text-[#3e4943] text-xs font-bold rounded-full">
                  <span className="material-symbols-outlined text-sm">pending</span>
                  {t('worker.verification_pending', 'Verification Pending')}
                </span>
              )}
            </div>

            {/* Name & Headline */}
            <h2 className="text-4xl font-extrabold tracking-tight mb-1 text-[#1a1c1b] font-heading">{p.full_name}</h2>
            <p className="text-lg font-semibold text-[#005d42] mb-1">{headline}</p>

            {/* Location */}
            {p.location_lat && p.location_lng && (
              <div className="flex items-center gap-2 text-[#3e4943] mb-6">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span className="text-sm font-medium">
                  {p.service_radius_km ? `${p.service_radius_km}km service radius` : t('worker.location_set', 'Location set')}
                </span>
              </div>
            )}

            {/* Stats Bento Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border-l-4 border-[#005d42]">
                <div className="flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-[#904d00] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-xl font-extrabold">{p.overall_rating.toFixed(1)}</span>
                </div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#3e4943]">
                  {p.total_reviews} {t('worker.reviews', 'Reviews')}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-[#005d42]">
                <div className="text-xl font-extrabold mb-1">{jobsCompleted}</div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#3e4943]">{t('worker.bookings', 'Bookings')}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-[#005d42]">
                <div className="text-xl font-extrabold mb-1">{yearsOnPlatform}yr</div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#3e4943]">{t('worker.on_platform', 'On Platform')}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-[#005d42]">
                <div className="text-xl font-extrabold mb-1">
                  {p.hourly_rate ? `R${p.hourly_rate}` : '\u2014'}
                </div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#3e4943]">{t('worker.per_hour', 'Per Hour')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Profile Completeness Banner */}
        {p.profile_completeness < 100 && (
          <section className="mb-12">
            <div className="bg-[#97f5cc]/30 border border-[#97f5cc] rounded-xl p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#97f5cc] flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-extrabold text-[#005d42]">{p.profile_completeness}%</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#1a1c1b] mb-1">{t('worker.complete_profile', 'Complete Your Profile')}</p>
                <p className="text-sm text-[#3e4943]">{t('worker.complete_profile_desc', 'A complete profile gets more bookings. Add missing details to stand out.')}</p>
              </div>
              <Link href="/worker-profile/edit" className="flex items-center">
                <span className="material-symbols-outlined text-[#005d42]">arrow_forward</span>
              </Link>
            </div>
          </section>
        )}

        {/* Bio Section */}
        {(p.bio || cvData?.personal_statement) && (
          <section className="mb-12">
            <h3 className="text-2xl font-bold mb-4 font-heading">{t('worker.about_me', 'About Me')}</h3>
            <div className="bg-[#f4f4f2] p-6 rounded-xl">
              <p className="text-lg text-[#1a1c1b] leading-relaxed italic">
                &ldquo;{p.bio || cvData?.personal_statement}&rdquo;
              </p>
            </div>
          </section>
        )}

        {/* Services Section */}
        {services.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-bold mb-6 font-heading">{t('worker.services', 'Services')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map(svc => (
                <div key={svc.id} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-[#97f5cc] flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#005d42]">{getServiceMaterialIcon(svc.service_name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#1a1c1b]">{svc.service_name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {svc.skill_level && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#3e4943]">{svc.skill_level}</span>
                      )}
                      {svc.years_experience != null && (
                        <span className="text-[10px] text-[#6e7a73]">
                          {svc.years_experience} {svc.years_experience === 1 ? 'year' : 'years'}
                        </span>
                      )}
                    </div>
                  </div>
                  {svc.custom_rate && (
                    <span className="text-sm font-bold text-[#005d42]">R{svc.custom_rate}/hr</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Key Traits */}
        {topTraits.length > 0 && (
          <section className="mb-12">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-widest text-[#3e4943]">{t('worker.key_traits', 'Key Traits')}</h3>
            <div className="flex flex-wrap gap-3">
              {topTraits.map(trait => (
                <div key={trait} className="flex items-center gap-2 bg-[#e2e3e1] px-4 py-2 rounded-lg font-medium">
                  <span className="material-symbols-outlined text-[#005d42]">{TRAIT_ICONS[trait] || 'star'}</span>
                  {(TRAIT_LABELS as Record<string, string>)[trait] || trait}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Portfolio Grid */}
        {portfolio.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-bold mb-6 font-heading">{t('worker.portfolio', 'Recent Work')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {portfolio.map((img, i) => (
                <div
                  key={img.id}
                  className={`aspect-square rounded-xl overflow-hidden bg-[#e8e8e6] group cursor-pointer ${i >= 2 ? 'hidden md:block' : ''}`}
                  onClick={() => setLightboxIdx(i)}
                >
                  <Image
                    src={img.image_url}
                    alt={img.caption || 'Portfolio'}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Availability & References Layout */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Availability */}
          <section>
            <h3 className="text-2xl font-bold mb-6 font-heading">{t('worker.availability', 'Availability')}</h3>
            <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
              {availableSlots.length > 0 ? (
                availableSlots.map((slot, i) => (
                  <div
                    key={slot.id}
                    className={`flex justify-between items-center ${i < availableSlots.length - 1 ? 'pb-3 border-b border-[#bdc9c1]/20' : ''}`}
                  >
                    <span className="font-bold text-[#1a1c1b]">{DAYS[slot.day_of_week]}</span>
                    <span className="text-[#005d42] font-bold">
                      {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#3e4943] italic">{t('worker.no_availability', 'No availability schedule set.')}</p>
              )}
            </div>
          </section>

          {/* References */}
          <section>
            <h3 className="text-2xl font-bold mb-6 font-heading">{t('worker.references', 'References')}</h3>
            {references.length > 0 ? (
              <div className="space-y-4">
                {references.map(ref => {
                  const refInitials = (ref.client_name || 'C')
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                  return (
                    <div key={ref.id} className="flex items-center gap-4 bg-[#f4f4f2] p-4 rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-[#97f5cc] flex items-center justify-center font-bold text-[#005d42] flex-shrink-0">
                        {refInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-[#1a1c1b]">{ref.client_name || 'Client'}</p>
                        <p className="text-xs text-[#3e4943] capitalize">{ref.relationship.replace('_', ' ')}</p>
                        {ref.duration_months && (
                          <p className="text-xs text-[#6e7a73]">{ref.duration_months} months</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-[#f4f4f2] p-6 rounded-xl text-center">
                <span className="material-symbols-outlined text-3xl text-[#6e7a73] mb-2">person_add</span>
                <p className="text-sm text-[#3e4943]">{t('worker.no_references', 'No references yet. Ask past clients to vouch for you.')}</p>
              </div>
            )}
          </section>
        </div>

        {/* Work History & Education (from CV data) */}
        {cvData && (cvData.work_history.length > 0 || cvData.education.length > 0) && (
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {cvData.work_history.length > 0 && (
              <section>
                <h3 className="text-2xl font-bold mb-6 font-heading">{t('worker.work_history', 'Work History')}</h3>
                <div className="space-y-4">
                  {cvData.work_history.map((job, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-[#005d42]">
                      <p className="font-bold text-sm text-[#1a1c1b]">{job.role}</p>
                      <p className="text-xs text-[#3e4943] mt-0.5">{job.employer}</p>
                      <p className="text-xs text-[#6e7a73] mt-0.5">{job.start_date} &mdash; {job.end_date || 'Present'}</p>
                      {job.description && (
                        <p className="text-sm text-[#3e4943] mt-2 leading-relaxed">{job.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {cvData.education.length > 0 && (
              <section>
                <h3 className="text-2xl font-bold mb-6 font-heading">{t('worker.education', 'Education')}</h3>
                <div className="space-y-4">
                  {cvData.education.map((edu, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-[#904d00]">
                      <p className="font-bold text-sm text-[#1a1c1b]">{edu.qualification}</p>
                      <p className="text-xs text-[#3e4943] mt-0.5">{edu.institution}</p>
                      <p className="text-xs text-[#6e7a73] mt-0.5">{edu.year}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Estate Registrations */}
        {estates.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-bold mb-6 font-heading">{t('worker.estates', 'Estate Registrations')}</h3>
            <div className="flex flex-wrap gap-3">
              {estates.map(reg => (
                <div key={reg.id} className="flex items-center gap-2 bg-[#97f5cc] text-[#005d42] px-4 py-2 rounded-lg font-bold text-sm">
                  <span className="material-symbols-outlined text-sm">apartment</span>
                  {reg.estate?.name || 'Estate'}{reg.estate?.suburb ? ` \u00b7 ${reg.estate.suburb}` : ''}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Verification Status */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-6 font-heading">{t('worker.verification', 'Verification')}</h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#bdc9c1]/20">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#005d42]" style={{ fontVariationSettings: "'FILL' 1" }}>badge</span>
                <span className="font-bold text-sm text-[#1a1c1b]">{t('worker.id_document', 'ID Document')}</span>
              </div>
              {p.id_verified ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#97f5cc] text-[#005d42] text-xs font-bold rounded-full">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  {t('worker.verified', 'Verified')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#e2e3e1] text-[#3e4943] text-xs font-bold rounded-full">
                  {t('worker.not_verified', 'Not Verified')}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#005d42]" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
                <span className="font-bold text-sm text-[#1a1c1b]">{t('worker.background_check', 'Background Check')}</span>
              </div>
              {p.criminal_check_clear ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#97f5cc] text-[#005d42] text-xs font-bold rounded-full">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  {t('worker.clear', 'Clear')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#e2e3e1] text-[#3e4943] text-xs font-bold rounded-full">
                  {t('worker.pending', 'Pending')}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-bold mb-6 font-heading">{t('worker.recent_reviews', 'Recent Reviews')}</h3>
            <div className="space-y-6">
              {reviews.slice(0, 5).map(review => (
                <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm relative">
                  <div className="flex justify-between mb-4">
                    <div className="flex gap-1 text-[#904d00]">
                      {[1, 2, 3, 4, 5].map(s => (
                        <span
                          key={s}
                          className="material-symbols-outlined text-lg"
                          style={{ fontVariationSettings: `'FILL' ${s <= review.overall_rating ? 1 : 0}` }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#3e4943]">{formatTimeAgo(review.created_at)}</span>
                  </div>
                  {review.comment && (
                    <p className="text-[#1a1c1b] mb-4">&ldquo;{review.comment}&rdquo;</p>
                  )}
                  {review.traits && review.traits.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {review.traits.map(trait => (
                        <span key={trait} className="text-xs px-2 py-1 bg-[#f4f4f2] rounded-full text-[#3e4943] font-medium">
                          {(TRAIT_LABELS as Record<string, string>)[trait] || trait}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {reviews.length > 5 && (
                <p className="text-center text-sm font-bold text-[#3e4943]">
                  +{reviews.length - 5} {t('worker.more_reviews', 'more reviews')}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Service Area */}
        {p.location_lat && p.location_lng && p.service_radius_km && (
          <section className="mb-12">
            <h3 className="text-2xl font-bold mb-6 font-heading">{t('worker.service_area', 'Service Area')}</h3>
            <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#97f5cc] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#005d42]">explore</span>
              </div>
              <div>
                <p className="font-bold text-[#1a1c1b]">
                  {p.service_radius_km}km {t('worker.radius', 'radius')}
                </p>
                <p className="text-sm text-[#3e4943]">{t('worker.willing_to_travel', 'Willing to travel from set location')}</p>
              </div>
            </div>
          </section>
        )}

        {/* Action Buttons */}
        <section className="space-y-3 mb-8">
          <Link
            href="/worker-profile/edit"
            className="flex items-center justify-center gap-2 w-full h-14 text-base font-bold rounded-xl border-2 border-[#005d42] text-[#005d42] hover:bg-[#005d42] hover:text-white transition-colors duration-200"
          >
            <span className="material-symbols-outlined text-xl">edit</span>
            {t('worker.edit_profile', 'Edit Profile')}
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/worker-cv"
              className="flex items-center justify-center gap-2 h-12 font-bold text-sm rounded-xl border border-[#bdc9c1] text-[#3e4943] hover:bg-[#f4f4f2] transition-colors duration-200"
            >
              <span className="material-symbols-outlined text-lg">description</span>
              {t('worker.my_cv', 'My CV')}
            </Link>
            <Link
              href="/worker-settings"
              className="flex items-center justify-center gap-2 h-12 font-bold text-sm rounded-xl border border-[#bdc9c1] text-[#3e4943] hover:bg-[#f4f4f2] transition-colors duration-200"
            >
              <span className="material-symbols-outlined text-lg">settings</span>
              {t('worker.settings', 'Settings')}
            </Link>
          </div>
        </section>
      </main>

      {/* Portfolio Lightbox */}
      {lightboxIdx !== null && portfolio[lightboxIdx] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:opacity-80 transition-opacity"
            onClick={() => setLightboxIdx(null)}
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
          {lightboxIdx > 0 && (
            <button
              className="absolute left-4 text-white hover:opacity-80 transition-opacity"
              onClick={e => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1) }}
            >
              <span className="material-symbols-outlined text-4xl">chevron_left</span>
            </button>
          )}
          {lightboxIdx < portfolio.length - 1 && (
            <button
              className="absolute right-4 text-white hover:opacity-80 transition-opacity"
              onClick={e => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1) }}
            >
              <span className="material-symbols-outlined text-4xl">chevron_right</span>
            </button>
          )}
          <Image
            src={portfolio[lightboxIdx].image_url}
            alt={portfolio[lightboxIdx].caption || 'Portfolio'}
            width={800}
            height={800}
            className="max-h-[80vh] max-w-full object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />
          {portfolio[lightboxIdx].caption && (
            <p className="absolute bottom-6 text-white text-center text-sm font-medium">{portfolio[lightboxIdx].caption}</p>
          )}
        </div>
      )}
    </>
  )
}
