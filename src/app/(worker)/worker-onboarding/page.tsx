'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/hooks/use-user'
import { useOnboarding } from '@/lib/hooks/use-onboarding'
import { useTranslation } from '@/lib/hooks/use-translation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const TOTAL_STEPS = 4

export default function WorkerOnboardingPage() {
  const router = useRouter()
  const { user, profile } = useUser()
  const { completeOnboarding } = useOnboarding()
  const { t } = useTranslation()
  const supabase = createClient()

  const [step, setStep] = useState(0)
  const [referralCode, setReferralCode] = useState('')
  const [codeCopied, setCodeCopied] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left')
  const [profileChecks, setProfileChecks] = useState({
    hasPhoto: false,
    hasBio: false,
    hasRate: false,
    hasId: false,
  })

  useEffect(() => {
    async function loadStatus() {
      if (!user) return
      const { data: wp } = await supabase
        .from('worker_profiles')
        .select('bio, hourly_rate, referral_code')
        .eq('user_id', user.id)
        .single()

      if (wp) {
        setProfileChecks(prev => ({
          ...prev,
          hasBio: !!wp.bio,
          hasRate: !!wp.hourly_rate,
        }))
        setReferralCode(wp.referral_code || '')
      }

      setProfileChecks(prev => ({
        ...prev,
        hasPhoto: !!profile?.avatar_url,
      }))

      const { count } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      setProfileChecks(prev => ({
        ...prev,
        hasId: (count || 0) > 0,
      }))
    }
    loadStatus()
  }, [user, profile, supabase])

  const completedCount = useMemo(() => {
    return [profileChecks.hasPhoto, profileChecks.hasBio, profileChecks.hasRate, profileChecks.hasId]
      .filter(Boolean).length
  }, [profileChecks])

  const handleComplete = () => {
    completeOnboarding()
    router.push('/worker-dashboard')
  }

  const goToStep = (nextStep: number) => {
    if (transitioning) return
    setSlideDirection(nextStep > step ? 'left' : 'right')
    setTransitioning(true)
    setTimeout(() => {
      setStep(nextStep)
      setTimeout(() => setTransitioning(false), 20)
    }, 200)
  }

  const appUrl = 'https://domestiq-kappa.vercel.app'
  const shareMessage = `Join DomestIQ and find work! Use my code ${referralCode} when you sign up. ${appUrl}`

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    } catch { /* ignore */ }
  }

  const firstName = profile?.full_name?.split(' ')[0] || t('onboarding.default_name', 'there')

  const checklistItems = useMemo(() => [
    {
      key: 'hasPhoto',
      icon: 'add_a_photo',
      label: t('onboarding.add_photo', 'Add a profile photo'),
      subtitle: t('onboarding.photo_subtitle', 'Earn more trust from clients'),
      href: '/worker-profile/edit',
      done: profileChecks.hasPhoto,
    },
    {
      key: 'hasBio',
      icon: 'description',
      label: t('onboarding.write_bio', 'Write a short bio'),
      subtitle: t('onboarding.bio_subtitle', 'Tell clients about yourself'),
      href: '/worker-profile/edit',
      done: profileChecks.hasBio,
    },
    {
      key: 'hasRate',
      icon: 'payments',
      label: t('onboarding.set_rate', 'Set your rate'),
      subtitle: t('onboarding.rate_subtitle', 'Let clients know your pricing'),
      href: '/worker-profile/edit',
      done: profileChecks.hasRate,
    },
    {
      key: 'hasId',
      icon: 'verified_user',
      label: t('onboarding.upload_id', 'Verify your ID'),
      subtitle: t('onboarding.id_subtitle', 'Required for activation'),
      href: '/worker-verification',
      done: profileChecks.hasId,
    },
  ], [profileChecks, t])

  const tips = useMemo(() => [
    {
      icon: 'bolt',
      tip: t('onboarding.tip_respond', 'Respond to booking requests quickly — clients prefer workers who reply within an hour.'),
    },
    {
      icon: 'star',
      tip: t('onboarding.tip_reviews', 'Ask happy clients to leave a review. Good ratings attract more bookings.'),
    },
    {
      icon: 'photo_camera',
      tip: t('onboarding.tip_photos', 'Upload photos of your best work to your portfolio. Clients love seeing proof.'),
    },
    {
      icon: 'calendar_month',
      tip: t('onboarding.tip_calendar', 'Keep your calendar updated. Block days you cannot work so clients see your real availability.'),
    },
  ], [t])

  const renderStep = () => {
    switch (step) {
      /* ── Step 0: Welcome ── */
      case 0:
        return (
          <div className="flex flex-col gap-8">
            {/* Welcome Icon */}
            <section className="flex flex-col items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-[#97f5cc] flex items-center justify-center relative shadow-sm">
                <span
                  className="material-symbols-outlined text-[#005d42] text-5xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  home_work
                </span>
                <div className="absolute -top-1 -right-1 bg-[#904d00] w-8 h-8 rounded-full border-4 border-[#f9f9f7] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm font-bold">check</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[#3e4943] text-sm tracking-widest uppercase font-medium">
                  {t('onboarding.label', 'Worker: Onboarding')}
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-[#1a1c1b] leading-tight font-heading">
                  {t('onboarding.welcome_title', `Welcome to DomestIQ, ${firstName}!`)}
                </h2>
                <p className="text-[#3e4943] text-lg">
                  {t('onboarding.welcome_subtitle', "Let's get your profile ready so clients can find you.")}
                </p>
              </div>
            </section>

            {/* Progress Section */}
            <section className="bg-[#f4f4f2] rounded-xl p-6 flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <span className="font-bold text-lg text-[#005d42] font-heading">
                  {completedCount} {t('onboarding.of', 'of')} 4 {t('onboarding.complete', 'complete')}
                </span>
                <span className="text-sm text-[#3e4943]">
                  {Math.round((completedCount / 4) * 100)}%
                </span>
              </div>
              <div className="w-full h-3 bg-[#e8e8e6] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#005d42] rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / 4) * 100}%` }}
                />
              </div>
            </section>

            {/* Stats Row */}
            <section className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-[#97f5cc]/20 rounded-xl">
                <span className="material-symbols-outlined text-[#005d42] text-xl mb-1 block">bolt</span>
                <p className="text-xl font-bold text-[#005d42]">3x</p>
                <p className="text-[10px] text-[#3e4943]">{t('onboarding.stat_bookings', 'More Bookings')}</p>
              </div>
              <div className="text-center p-3 bg-[#ffdcc3]/20 rounded-xl">
                <span className="material-symbols-outlined text-[#904d00] text-xl mb-1 block">star</span>
                <p className="text-xl font-bold text-[#904d00]">4.8</p>
                <p className="text-[10px] text-[#3e4943]">{t('onboarding.stat_rating', 'Avg Rating')}</p>
              </div>
              <div className="text-center p-3 bg-[#e3e1ec]/30 rounded-xl">
                <span className="material-symbols-outlined text-[#505058] text-xl mb-1 block">group</span>
                <p className="text-xl font-bold text-[#505058]">500+</p>
                <p className="text-[10px] text-[#3e4943]">{t('onboarding.stat_workers', 'Workers')}</p>
              </div>
            </section>
          </div>
        )

      /* ── Step 1: Profile Checklist ── */
      case 1:
        return (
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-2">
              <p className="text-[#3e4943] text-sm tracking-widest uppercase font-medium">
                {t('onboarding.step_label', 'Step')} 2/4
              </p>
              <h2 className="text-2xl font-bold text-[#1a1c1b] font-heading">
                {t('onboarding.complete_profile', 'Complete Your Profile')}
              </h2>
              <p className="text-[#3e4943]">
                {t('onboarding.profile_subtitle', 'Workers with complete profiles get 3x more bookings')}
              </p>
            </section>

            {/* Progress bar inline */}
            <div className="bg-[#f4f4f2] rounded-xl p-4 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-[#005d42]">
                  {completedCount}/4 {t('onboarding.complete', 'complete')}
                </span>
                <span className="text-xs text-[#3e4943]">{Math.round((completedCount / 4) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-[#e8e8e6] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#005d42] rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Checklist */}
            <section className="flex flex-col gap-3">
              {checklistItems.map((item, idx) => {
                const isNextGoal = !item.done && !checklistItems.slice(0, idx).some(prev => !prev.done)
                return (
                  <Link key={item.key} href={item.href}>
                    <div
                      className={cn(
                        'bg-white rounded-xl flex items-center gap-4 transition-all duration-200',
                        item.done
                          ? 'p-4 border-l-4 border-[#005d42]'
                          : isNextGoal
                            ? 'p-5 shadow-[0_4px_12px_rgba(26,28,27,0.04)] ring-1 ring-[#005d42]/10'
                            : 'p-4 bg-[#f4f4f2] opacity-70'
                      )}
                    >
                      {/* Status indicator */}
                      {item.done ? (
                        <div className="w-6 h-6 rounded-full bg-[#005d42] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-white text-xs">check</span>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-[#bdc9c1] shrink-0" />
                      )}

                      {/* Label */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span
                          className={cn(
                            'font-bold text-[#1a1c1b]',
                            item.done && 'line-through decoration-[#005d42]/30',
                            isNextGoal && 'text-lg'
                          )}
                        >
                          {item.label}
                        </span>
                        <span
                          className={cn(
                            'text-xs text-[#3e4943]',
                            isNextGoal && 'text-sm text-[#904d00] font-medium'
                          )}
                        >
                          {item.subtitle}
                        </span>
                      </div>

                      {/* Arrow for pending items */}
                      {!item.done && (
                        <span className="material-symbols-outlined text-[#3e4943] ml-auto shrink-0">
                          chevron_right
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </section>
          </div>
        )

      /* ── Step 2: Referral ── */
      case 2:
        return (
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-2">
              <p className="text-[#3e4943] text-sm tracking-widest uppercase font-medium">
                {t('onboarding.step_label', 'Step')} 3/4
              </p>
              <h2 className="text-2xl font-bold text-[#1a1c1b] font-heading">
                {t('onboarding.invite_title', 'Invite Other Workers')}
              </h2>
              <p className="text-[#3e4943]">
                {t('onboarding.invite_subtitle', 'Help fellow workers join DomestIQ')}
              </p>
            </section>

            {referralCode ? (
              <div className="flex flex-col gap-4">
                {/* Code display */}
                <div className="bg-[#f4f4f2] rounded-xl p-5 flex items-center justify-between">
                  <span className="text-2xl font-bold tracking-widest font-mono text-[#1a1c1b]">
                    {referralCode}
                  </span>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1 text-[#005d42] font-medium text-sm px-3 py-2 rounded-lg hover:bg-[#005d42]/5 transition-colors duration-200 active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {codeCopied ? 'check_circle' : 'content_copy'}
                    </span>
                    {codeCopied ? t('onboarding.copied', 'Copied!') : t('onboarding.copy', 'Copy')}
                  </button>
                </div>

                {/* Share buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 h-12 rounded-lg border border-[#bdc9c1] text-[#005d42] font-bold text-sm hover:bg-[#005d42]/5 transition-colors duration-200 active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-lg">chat</span>
                    WhatsApp
                  </a>
                  <a
                    href={`sms:?body=${encodeURIComponent(shareMessage)}`}
                    className="flex items-center justify-center gap-2 h-12 rounded-lg border border-[#bdc9c1] text-[#1a1c1b] font-bold text-sm hover:bg-[#e8e8e6] transition-colors duration-200 active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-lg">sms</span>
                    SMS
                  </a>
                </div>

                {/* Benefit callout */}
                <div className="bg-[#ffdcc3]/20 rounded-xl p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#904d00] shrink-0">emoji_events</span>
                  <p className="text-sm text-[#3e4943]">
                    {t('onboarding.referral_benefit', 'When friends you refer get their first booking, you both benefit from the DomestIQ community.')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-[#f4f4f2] rounded-xl p-8 text-center">
                <span className="material-symbols-outlined text-[#bdc9c1] text-4xl mb-3 block">hourglass_empty</span>
                <p className="text-[#3e4943] text-sm">
                  {t('onboarding.referral_pending', 'Your referral code will be generated soon.')}
                </p>
              </div>
            )}
          </div>
        )

      /* ── Step 3: Tips ── */
      case 3:
        return (
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-2">
              <p className="text-[#3e4943] text-sm tracking-widest uppercase font-medium">
                {t('onboarding.step_label', 'Step')} 4/4
              </p>
              <h2 className="text-2xl font-bold text-[#1a1c1b] font-heading">
                {t('onboarding.tips_title', 'Quick Tips')}
              </h2>
              <p className="text-[#3e4943]">
                {t('onboarding.tips_subtitle', 'Make the most of DomestIQ')}
              </p>
            </section>

            <section className="flex flex-col gap-3">
              {tips.map((item, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#ffdcc3]/30 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#904d00] text-lg">{item.icon}</span>
                  </div>
                  <p className="text-sm text-[#3e4943] leading-relaxed">{item.tip}</p>
                </div>
              ))}
            </section>

            {/* Ready callout */}
            <div className="bg-[#97f5cc]/20 rounded-xl p-5 flex items-start gap-3">
              <span
                className="material-symbols-outlined text-[#005d42] shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              <div>
                <p className="font-bold text-[#1a1c1b] text-sm">
                  {t('onboarding.ready_title', "You're all set!")}
                </p>
                <p className="text-sm text-[#3e4943]">
                  {t('onboarding.ready_subtitle', 'Head to your dashboard to start receiving bookings.')}
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9f7] text-[#1a1c1b] flex flex-col antialiased">
      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-2 py-4 px-6">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <button
            key={i}
            onClick={() => goToStep(i)}
            aria-label={`Step ${i + 1}`}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i === step
                ? 'w-8 bg-[#005d42]'
                : i < step
                  ? 'w-2 bg-[#005d42]'
                  : 'w-2 bg-[#bdc9c1]'
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-36 max-w-md mx-auto w-full">
        <div
          className={cn(
            'transition-all duration-200',
            transitioning
              ? slideDirection === 'left'
                ? 'opacity-0 translate-x-[-16px]'
                : 'opacity-0 translate-x-[16px]'
              : 'opacity-100 translate-x-0'
          )}
        >
          {renderStep()}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#f9f9f7] border-t border-[#e2e3e1]/20 shadow-[0_-8px_24px_rgba(26,28,27,0.06)] px-6 py-4 z-50">
        <div className="max-w-md mx-auto flex flex-col gap-3">
          {/* Main CTA */}
          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => goToStep(step - 1)}
                className="h-14 px-5 rounded-lg border border-[#bdc9c1] text-[#1a1c1b] font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] hover:bg-[#e8e8e6]"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                {t('onboarding.back', 'Back')}
              </button>
            )}
            <button
              onClick={() => {
                if (step === TOTAL_STEPS - 1) {
                  handleComplete()
                } else {
                  goToStep(step + 1)
                }
              }}
              className="flex-1 h-14 bg-[#005d42] text-white font-bold rounded-lg text-lg flex items-center justify-center gap-2 shadow-lg transition-all duration-200 active:scale-[0.98]"
            >
              {step === TOTAL_STEPS - 1 ? (
                <>
                  <span className="material-symbols-outlined">dashboard</span>
                  {t('onboarding.go_dashboard', 'Go to Dashboard')}
                </>
              ) : step === 0 ? (
                <>
                  {t('onboarding.get_started', "Let's Get Started")}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              ) : (
                <>
                  {t('onboarding.next', 'Next')}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </div>

          {/* Skip link */}
          {step < TOTAL_STEPS - 1 && (
            <button
              onClick={handleComplete}
              className="py-2 text-[#3e4943] font-medium text-sm hover:underline decoration-[#904d00] transition-colors duration-200"
            >
              {t('onboarding.skip', "I'll do this later")}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
