'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { useOnboarding } from '@/lib/hooks/use-onboarding'
import { useTranslation } from '@/lib/hooks/use-translation'
import { PushPrompt } from '@/components/shared/push-prompt'
import { SponsorBadge } from '@/components/shared/sponsor-badge'
import { DashboardAd } from '@/components/shared/dashboard-ad'

interface DashboardBooking {
  id: string
  status: string
  scheduled_date: string
  scheduled_start_time: string
  scheduled_end_time: string
  estimated_cost: number | null
  profiles: { full_name: string; avatar_url: string | null }
  services: { name: string }
}

interface WorkerProfileData {
  id: string
  bio: string | null
  hourly_rate: number | null
  overall_rating: number
  total_reviews: number
  profile_completeness: number
  is_active: boolean
  referral_code: string | null
}

interface ReferralStatsData {
  total_referrals: number
  qualified_referrals: number
  total_earned: number
  referral_code: string
}

export default function WorkerDashboard() {
  const { user, profile, isLoading: userLoading } = useUser()
  const { needsOnboarding, checked: onboardingChecked } = useOnboarding()
  const dashboardRouter = useRouter()
  const { t } = useTranslation()
  const supabase = createClient()

  // Redirect to onboarding if needed
  useEffect(() => {
    if (onboardingChecked && needsOnboarding) {
      dashboardRouter.replace('/worker-onboarding')
    }
  }, [onboardingChecked, needsOnboarding, dashboardRouter])

  const [workerProfile, setWorkerProfile] = useState<WorkerProfileData | null>(null)
  const [upcomingBookings, setUpcomingBookings] = useState<DashboardBooking[]>([])
  const [pendingBookings, setPendingBookings] = useState<DashboardBooking[]>([])
  const [totalBookings, setTotalBookings] = useState(0)
  const [referralStats, setReferralStats] = useState<ReferralStatsData | null>(null)
  const [serviceAreas, setServiceAreas] = useState<string[]>([])
  const [completedBookings, setCompletedBookings] = useState(0)
  const [codeCopied, setCodeCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return

      // Get worker profile
      const { data: wp } = await supabase
        .from('worker_profiles')
        .select('id, bio, hourly_rate, overall_rating, total_reviews, profile_completeness, is_active, referral_code')
        .eq('user_id', user.id)
        .single()

      if (!wp) {
        setIsLoading(false)
        return
      }
      setWorkerProfile(wp)

      // Get total bookings count
      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('worker_id', user.id)
        .in('status', ['confirmed', 'in_progress', 'completed'])

      setTotalBookings(count || 0)

      // Get completed bookings count
      const { count: doneCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('worker_id', user.id)
        .eq('status', 'completed')
      setCompletedBookings(doneCount || 0)

      // Get service areas (city names)
      const { data: areas } = await supabase
        .from('worker_service_areas')
        .select('city')
        .eq('worker_profile_id', wp.id)
      if (areas) {
        const cities = [...new Set(areas.map((a: { city: string }) => a.city).filter(Boolean))]
        setServiceAreas(cities)
      }

      // Get upcoming bookings (confirmed/in_progress)
      const today = new Date().toISOString().split('T')[0]
      const { data: upcoming } = await supabase
        .from('bookings')
        .select('id, status, scheduled_date, scheduled_start_time, scheduled_end_time, estimated_cost, profiles!client_id(full_name, avatar_url), services(name)')
        .eq('worker_id', user.id)
        .in('status', ['confirmed', 'in_progress'])
        .gte('scheduled_date', today)
        .order('scheduled_date', { ascending: true })
        .limit(5)

      if (upcoming) setUpcomingBookings(upcoming as unknown as DashboardBooking[])

      // Get pending bookings (requests)
      const { data: pending } = await supabase
        .from('bookings')
        .select('id, status, scheduled_date, scheduled_start_time, scheduled_end_time, estimated_cost, profiles!client_id(full_name, avatar_url), services(name)')
        .eq('worker_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5)

      if (pending) setPendingBookings(pending as unknown as DashboardBooking[])

      // Fetch referral stats
      try {
        const res = await fetch('/api/referrals')
        if (res.ok) {
          const data = await res.json()
          setReferralStats(data.stats)
        }
      } catch {
        // Non-critical, ignore
      }

      setIsLoading(false)
    }

    if (!userLoading) loadDashboard()
  }, [user, userLoading, supabase])

  const handleBookingAction = async (bookingId: string, action: 'accepted' | 'declined') => {
    setActionLoading(bookingId)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      })

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Failed to update booking' }))
        throw new Error(error || 'Failed to update booking')
      }

      if (action === 'accepted') {
        const moved = pendingBookings.find(b => b.id === bookingId)
        if (moved) {
          setUpcomingBookings(prev => [{ ...moved, status: 'accepted' }, ...prev])
        }
      }
      setPendingBookings(prev => prev.filter(b => b.id !== bookingId))
    } catch (err) {
      console.error('Failed to update booking:', err)
    } finally {
      setActionLoading(null)
    }
  }

  if (userLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="h-8 w-56 bg-[#e8e8e6] rounded-lg animate-pulse" />
        <div className="h-4 w-40 bg-[#e8e8e6] rounded-lg animate-pulse" />
        <div className="h-3 w-full bg-[#e8e8e6] rounded-full animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-[#e8e8e6] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-6 w-40 bg-[#e8e8e6] rounded-lg animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-[#e8e8e6] rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const completeness = workerProfile?.profile_completeness || 0
  const referralCode = referralStats?.referral_code || workerProfile?.referral_code || ''
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://domestiq-kappa.vercel.app'

  const shareMessage = `Join DomestIQ and find work! Use my code ${referralCode} when you sign up. Download at ${appUrl}`

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = referralCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Greeting Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1a1c1b] font-heading">
          Hey {firstName} <span className="inline-block animate-[wave_1.5s_ease-in-out_infinite]">👋</span>
        </h1>
        <p className="text-[#3e4943] text-sm mt-1">
          Here&apos;s your work overview
        </p>
      </div>

      {/* Push Notification Prompt */}
      <PushPrompt />

      {/* Sponsor Badge */}
      <SponsorBadge placement="dashboard_worker" />

      {/* Profile Completion Bar */}
      {completeness < 100 && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#1a1c1b]">
              Profile {completeness}% complete
            </span>
            <Link
              href="/worker-profile/edit"
              className="text-xs font-bold text-[#005d42] hover:underline"
            >
              Complete Profile
            </Link>
          </div>
          <div className="w-full bg-[#e8e8e6] rounded-full h-2.5">
            <div
              className="bg-[#005d42] h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
          {completeness < 50 && (
            <p className="text-xs text-[#3e4943] mt-2">
              Complete your profile to appear in search results and get more bookings.
            </p>
          )}
        </div>
      )}

      {/* Stats Grid - 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-[#005d42]">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#005d42] text-xl">work</span>
          </div>
          <p className="text-2xl font-bold text-[#1a1c1b]">{totalBookings}</p>
          <p className="text-xs text-[#3e4943]">{t('nav.bookings', 'Bookings')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-[#047857]">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#047857] text-xl">check_circle</span>
          </div>
          <p className="text-2xl font-bold text-[#1a1c1b]">{completedBookings}</p>
          <p className="text-xs text-[#3e4943]">Completed</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-[#904d00]">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#904d00] text-xl">star</span>
          </div>
          <p className="text-2xl font-bold text-[#1a1c1b]">
            {workerProfile?.overall_rating?.toFixed(1) || '0.0'}
          </p>
          <p className="text-xs text-[#3e4943]">{t('worker.rating', 'Rating')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-[#0284c7]">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#0284c7] text-xl">rate_review</span>
          </div>
          <p className="text-2xl font-bold text-[#1a1c1b]">{workerProfile?.total_reviews || 0}</p>
          <p className="text-xs text-[#3e4943]">{t('worker.reviews', 'Reviews')}</p>
        </div>
      </div>

      {/* Service Areas Card */}
      {serviceAreas.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[#005d42] text-xl">location_on</span>
            <h3 className="font-semibold text-[#1a1c1b] font-heading">Your Service Areas</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {serviceAreas.map(city => (
              <span
                key={city}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#f4f4f2] text-[#1a1c1b] text-sm font-medium"
              >
                <span className="material-symbols-outlined text-[#005d42] text-base">pin_drop</span>
                {city}
              </span>
            ))}
          </div>
          <Link
            href="/worker-profile/edit"
            className="text-xs font-bold text-[#005d42] mt-3 inline-block hover:underline"
          >
            Edit service areas
          </Link>
        </div>
      )}

      {/* Refer & Earn Card */}
      {referralCode && (
        <div className="bg-[#005d42] rounded-xl shadow-sm p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-[#9ffdd3] text-2xl">redeem</span>
            <div>
              <h3 className="font-bold font-heading text-lg">Refer a Friend</h3>
              <p className="text-sm text-[#9ffdd3]/80">
                Help fellow workers join DomestIQ
              </p>
            </div>
          </div>

          {/* Referral Code Display */}
          <div className="bg-white/10 rounded-lg p-3 flex items-center justify-between mb-4">
            <span className="text-xl font-bold tracking-widest font-mono">{referralCode}</span>
            <button
              onClick={copyReferralCode}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-base">
                {codeCopied ? 'check' : 'content_copy'}
              </span>
              {codeCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold rounded-lg px-4 py-2.5 text-sm hover:opacity-90 transition-opacity active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-lg">chat</span>
              WhatsApp
            </a>
            <a
              href={`sms:?body=${encodeURIComponent(shareMessage)}`}
              className="flex items-center justify-center gap-2 bg-white/20 text-white font-bold rounded-lg px-4 py-2.5 text-sm hover:bg-white/30 transition-colors active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-lg">sms</span>
              SMS
            </a>
          </div>

          {/* Stats Line */}
          {referralStats && (
            <p className="text-xs text-[#9ffdd3]/70 text-center">
              {referralStats.total_referrals} referred
              {' '}&middot;{' '}
              {referralStats.qualified_referrals} qualified
            </p>
          )}
        </div>
      )}

      {/* Quick Actions - 3x2 Grid */}
      <div>
        <h2 className="font-semibold text-lg text-[#1a1c1b] font-heading mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <Link href="/worker-calendar" className="block">
            <div className="bg-[#f4f4f2] rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center hover:bg-[#e8e8e6] transition-colors active:scale-[0.98]">
              <span className="material-symbols-outlined text-[#005d42] text-3xl">calendar_month</span>
              <span className="font-medium text-xs text-[#1a1c1b]">{t('nav.calendar', 'Calendar')}</span>
            </div>
          </Link>
          <Link href="/worker-profile/edit" className="block">
            <div className="bg-[#f4f4f2] rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center hover:bg-[#e8e8e6] transition-colors active:scale-[0.98]">
              <span className="material-symbols-outlined text-[#005d42] text-3xl">person_edit</span>
              <span className="font-medium text-xs text-[#1a1c1b]">{t('worker.edit_profile', 'Edit Profile')}</span>
            </div>
          </Link>
          <Link href="/worker-cv" className="block">
            <div className="bg-[#f4f4f2] rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center hover:bg-[#e8e8e6] transition-colors active:scale-[0.98]">
              <span className="material-symbols-outlined text-[#005d42] text-3xl">description</span>
              <span className="font-medium text-xs text-[#1a1c1b]">Build CV</span>
            </div>
          </Link>
          <Link href="/worker-references" className="block">
            <div className="bg-[#f4f4f2] rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center hover:bg-[#e8e8e6] transition-colors active:scale-[0.98]">
              <span className="material-symbols-outlined text-[#005d42] text-3xl">group</span>
              <span className="font-medium text-xs text-[#1a1c1b]">References</span>
            </div>
          </Link>
          <Link href="/worker-bookings" className="block">
            <div className="bg-[#f4f4f2] rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center hover:bg-[#e8e8e6] transition-colors active:scale-[0.98]">
              <span className="material-symbols-outlined text-[#005d42] text-3xl">list_alt</span>
              <span className="font-medium text-xs text-[#1a1c1b]">All Bookings</span>
            </div>
          </Link>
          <Link href="/messages" className="block">
            <div className="bg-[#f4f4f2] rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center hover:bg-[#e8e8e6] transition-colors active:scale-[0.98]">
              <span className="material-symbols-outlined text-[#005d42] text-3xl">chat_bubble</span>
              <span className="font-medium text-xs text-[#1a1c1b]">Messages</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Dashboard Ad */}
      <DashboardAd placement="worker_dashboard" role="worker" />

      {/* Pending Requests */}
      {pendingBookings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-lg text-[#1a1c1b] font-heading">New Requests</h2>
              <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#904d00] text-white text-xs font-bold">
                {pendingBookings.length}
              </span>
            </div>
            <Link
              href="/worker-bookings"
              className="text-sm text-[#005d42] font-bold flex items-center gap-0.5 hover:underline"
            >
              View All
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </Link>
          </div>
          <div className="space-y-3">
            {pendingBookings.map(booking => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-[#904d00]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#904d00]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#904d00] text-xl">pending_actions</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1a1c1b] truncate">{booking.profiles.full_name}</p>
                    <p className="text-sm text-[#3e4943]">
                      {booking.services.name} &middot; {new Date(booking.scheduled_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-xs text-[#6e7a73]">
                      {booking.scheduled_start_time?.slice(0, 5)} - {booking.scheduled_end_time?.slice(0, 5)}
                      {booking.estimated_cost && ` \u00B7 R${booking.estimated_cost}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    className="flex-1 flex items-center justify-center gap-1 px-4 py-2.5 border border-[#bdc9c1] text-[#1a1c1b] font-bold rounded-lg text-sm hover:bg-[#f4f4f2] transition-colors active:scale-[0.98] disabled:opacity-50"
                    disabled={actionLoading === booking.id}
                    onClick={() => handleBookingAction(booking.id, 'declined')}
                  >
                    {actionLoading === booking.id ? (
                      <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">close</span>
                        Decline
                      </>
                    )}
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1 px-4 py-2.5 bg-[#005d42] text-white font-bold rounded-lg text-sm hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50"
                    disabled={actionLoading === booking.id}
                    onClick={() => handleBookingAction(booking.id, 'accepted')}
                  >
                    {actionLoading === booking.id ? (
                      <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">check</span>
                        Accept
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coming Up / Upcoming Bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg text-[#1a1c1b] font-heading">Coming Up</h2>
          <Link
            href="/worker-bookings"
            className="text-sm text-[#005d42] font-bold flex items-center gap-0.5 hover:underline"
          >
            View All
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </Link>
        </div>
        {upcomingBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <span className="material-symbols-outlined text-[#bdc9c1] text-4xl mb-2 block">event_available</span>
            <p className="text-[#3e4943] font-medium">No upcoming bookings</p>
            <p className="text-xs text-[#6e7a73] mt-1">
              New booking requests will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingBookings.map(booking => (
              <Link key={booking.id} href={`/worker-bookings/${booking.id}`}>
                <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow active:scale-[0.99]">
                  <div className="w-10 h-10 bg-[#005d42]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#005d42] text-xl">schedule</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1a1c1b] truncate">{booking.profiles.full_name}</p>
                    <p className="text-sm text-[#3e4943]">
                      {booking.services.name} &middot; {new Date(booking.scheduled_date).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-xs text-[#6e7a73]">
                      {booking.scheduled_start_time?.slice(0, 5)} - {booking.scheduled_end_time?.slice(0, 5)}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#047857] text-white">
                    {booking.status === 'in_progress' ? 'in progress' : booking.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
