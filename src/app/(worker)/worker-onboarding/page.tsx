'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@/lib/hooks/use-user'
import { useOnboarding } from '@/lib/hooks/use-onboarding'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sparkles, Camera, FileText, DollarSign, ShieldCheck,
  MessageCircle, Share2, Copy, CheckCircle2,
  ArrowRight, Lightbulb, Star, CalendarDays, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const TOTAL_STEPS = 4

export default function WorkerOnboardingPage() {
  const router = useRouter()
  const { user, profile } = useUser()
  const { completeOnboarding } = useOnboarding()
  const supabase = createClient()

  const [step, setStep] = useState(0)
  const [referralCode, setReferralCode] = useState('')
  const [codeCopied, setCodeCopied] = useState(false)
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

  const handleComplete = () => {
    completeOnboarding()
    router.push('/worker-dashboard')
  }

  const appUrl = 'https://domestiq-sa.vercel.app'
  const shareMessage = `Join DomestIQ and find work! Use my code ${referralCode} when you sign up. ${appUrl}`

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    } catch { /* ignore */ }
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="text-center space-y-6 py-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/25"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome to DomestIQ!
            </h1>
            <p className="text-lg text-muted-foreground max-w-sm mx-auto">
              You just joined the fastest-growing platform for domestic workers in South Africa.
            </p>
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              <div className="text-center p-3 bg-emerald-50 rounded-xl">
                <Zap className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-emerald-700">3x</p>
                <p className="text-[10px] text-muted-foreground">More Bookings</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-xl">
                <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-amber-700">4.8</p>
                <p className="text-[10px] text-muted-foreground">Avg Rating</p>
              </div>
              <div className="text-center p-3 bg-sky-50 rounded-xl">
                <CalendarDays className="w-5 h-5 text-sky-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-sky-700">500+</p>
                <p className="text-[10px] text-muted-foreground">Workers</p>
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Complete Your Profile</h2>
              <p className="text-muted-foreground">Workers with complete profiles get 3x more bookings</p>
            </div>
            <div className="space-y-3">
              {[
                { key: 'hasPhoto', icon: Camera, label: 'Add a profile photo', href: '/worker-profile/edit', done: profileChecks.hasPhoto },
                { key: 'hasBio', icon: FileText, label: 'Write a short bio', href: '/worker-profile/edit', done: profileChecks.hasBio },
                { key: 'hasRate', icon: DollarSign, label: 'Set your hourly rate', href: '/worker-profile/edit', done: profileChecks.hasRate },
                { key: 'hasId', icon: ShieldCheck, label: 'Upload your ID document', href: '/worker-verification', done: profileChecks.hasId },
              ].map(item => {
                const Icon = item.icon
                return (
                  <Link key={item.key} href={item.href}>
                    <Card className={cn(
                      'transition-all hover:shadow-sm',
                      item.done && 'border-emerald-200 bg-emerald-50/50'
                    )}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          item.done ? 'bg-emerald-100' : 'bg-muted'
                        )}>
                          {item.done ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Icon className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <span className={cn(
                          'font-medium flex-1',
                          item.done && 'text-emerald-700'
                        )}>
                          {item.label}
                        </span>
                        {!item.done && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Invite Other Workers</h2>
              <p className="text-muted-foreground">Earn R2 when your referral gets a 5-star review</p>
            </div>
            {referralCode ? (
              <>
                <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
                  <span className="text-2xl font-bold tracking-widest font-mono">{referralCode}</span>
                  <Button variant="ghost" size="sm" onClick={copyCode}>
                    <Copy className="w-4 h-4 mr-1" />
                    {codeCopied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-12 text-green-700 border-green-200 hover:bg-green-50" asChild>
                    <a href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                  <Button variant="outline" className="h-12" asChild>
                    <a href={`sms:?body=${encodeURIComponent(shareMessage)}`}>
                      <Share2 className="w-4 h-4 mr-2" />
                      SMS
                    </a>
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground text-sm p-6">
                Your referral code will be generated soon.
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Quick Tips</h2>
              <p className="text-muted-foreground">Make the most of DomestIQ</p>
            </div>
            <div className="space-y-3">
              {[
                { icon: Lightbulb, tip: 'Respond to booking requests quickly — clients prefer workers who reply within an hour.' },
                { icon: Star, tip: 'Ask happy clients to leave a review. Good ratings attract more bookings.' },
                { icon: Camera, tip: 'Upload photos of your best work to your portfolio. Clients love seeing proof.' },
                { icon: CalendarDays, tip: 'Keep your calendar updated. Block days you cannot work so clients see your real availability.' },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-amber-600" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.tip}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-2 py-4 px-4">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={cn(
              'h-2 rounded-full transition-all',
              i === step ? 'w-8 bg-emerald-600' : i < step ? 'w-2 bg-emerald-600' : 'w-2 bg-border'
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-24 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="max-w-md mx-auto flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="h-14 px-6">
              Back
            </Button>
          )}
          <Button
            onClick={() => {
              if (step === TOTAL_STEPS - 1) {
                handleComplete()
              } else {
                setStep(s => s + 1)
              }
            }}
            className="flex-1 h-14 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            {step === TOTAL_STEPS - 1 ? 'Go to Dashboard' : 'Next'}
            {step < TOTAL_STEPS - 1 && <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
