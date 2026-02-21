'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Mail, Phone, Loader2, ArrowRight, IdCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/hooks/use-translation'

type AuthTab = 'email' | 'phone' | 'worker-id'

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-md mx-auto rounded-2xl" />}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const { t } = useTranslation()

  const [activeTab, setActiveTab] = useState<AuthTab>('worker-id')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [workerCode, setWorkerCode] = useState('')
  const [workerPassword, setWorkerPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push(redirectTo)
  }

  async function handleWorkerIdLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    // Convert Worker ID (e.g. "DQ12345") to internal email
    const code = workerCode.toUpperCase().replace(/\s/g, '')
    const internalEmail = `${code.toLowerCase()}@domestiq.app`
    const { error } = await supabase.auth.signInWithPassword({
      email: internalEmail,
      password: workerPassword,
    })
    if (error) {
      setError('Invalid Worker ID or password. Check your card and try again.')
      setLoading(false)
      return
    }
    router.push(redirectTo.includes('dashboard') ? '/worker-dashboard' : redirectTo)
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formattedPhone = phone.startsWith('+') ? phone : `+27${phone}`
    const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone })
    if (error) { setError(error.message); setLoading(false); return }
    setOtpSent(true)
    setLoading(false)
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formattedPhone = phone.startsWith('+') ? phone : `+27${phone}`
    const { error } = await supabase.auth.verifyOtp({ phone: formattedPhone, token: otp, type: 'sms' })
    if (error) { setError(error.message); setLoading(false); return }
    router.push(redirectTo)
  }

  async function handleGoogleLogin() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  return (
    <motion.div
      initial="hidden" animate="visible" variants={fadeUp}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl shadow-black/5 overflow-hidden">
        <div className="p-6 pb-0 text-center">
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-sm text-muted-foreground mt-1">Sign in to continue</p>
        </div>
        <div className="p-6 space-y-5">
          {/* Tab Toggle */}
          <div className="flex rounded-xl border bg-muted/50 p-1 gap-1">
            {([
              { key: 'worker-id' as const, icon: IdCard, label: 'Worker ID' },
              { key: 'email' as const, icon: Mail, label: t('auth.email', 'Email') },
              { key: 'phone' as const, icon: Phone, label: t('auth.phone', 'Phone') },
            ]).map(tab => (
              <button key={tab.key} type="button"
                onClick={() => { setActiveTab(tab.key); setError(null) }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  activeTab === tab.key
                    ? 'bg-white text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </motion.div>
          )}

          {/* Worker ID Login */}
          {activeTab === 'worker-id' && (
            <motion.form key="worker-id" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }} onSubmit={handleWorkerIdLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workerCode">Worker ID</Label>
                <Input id="workerCode" type="text" placeholder="e.g. DQ12345" value={workerCode}
                  onChange={e => setWorkerCode(e.target.value.toUpperCase())} required autoComplete="username"
                  className="h-12 text-center text-lg font-mono tracking-widest" maxLength={7} />
                <p className="text-xs text-muted-foreground">The code from your registration card</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workerPwd">{t('auth.password', 'Password')}</Label>
                <Input id="workerPwd" type="password" placeholder="Enter your password" value={workerPassword}
                  onChange={e => setWorkerPassword(e.target.value)} required autoComplete="current-password" className="h-12" />
              </div>
              <Button type="submit" className="w-full h-12 text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4 ml-1" /></>}
              </Button>
            </motion.form>
          )}

          {/* Email Login */}
          {activeTab === 'email' && (
            <motion.form key="email" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }} onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email', 'Email')}</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)} required autoComplete="email" className="h-12" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t('auth.password', 'Password')}</Label>
                  <Link href="/forgot-password" className="text-xs text-emerald-600 hover:underline">{t('auth.forgot_password', 'Forgot Password?')}</Link>
                </div>
                <Input id="password" type="password" placeholder="Enter your password" value={password}
                  onChange={e => setPassword(e.target.value)} required autoComplete="current-password" className="h-12" />
              </div>
              <Button type="submit" className="w-full h-12 text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4 ml-1" /></>}
              </Button>
            </motion.form>
          )}

          {/* Phone Login */}
          {activeTab === 'phone' && (
            <motion.div key="phone" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('auth.phone', 'Phone Number')}</Label>
                    <Input id="phone" type="tel" placeholder="e.g. 0821234567" value={phone}
                      onChange={e => setPhone(e.target.value)} required className="h-12" />
                    <p className="text-xs text-muted-foreground">South African numbers will be prefixed with +27 automatically.</p>
                  </div>
                  <Button type="submit" className="w-full h-12 text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700" disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.send_otp', 'Send Code')}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">{t('auth.otp', 'Enter OTP')}</Label>
                    <Input id="otp" type="text" placeholder="Enter the code sent to your phone" value={otp}
                      onChange={e => setOtp(e.target.value)} required autoComplete="one-time-code" inputMode="numeric" className="h-12 text-center text-lg tracking-widest" />
                    <p className="text-xs text-muted-foreground">
                      We sent a verification code to {phone.startsWith('+') ? phone : `+27${phone}`}
                    </p>
                  </div>
                  <Button type="submit" className="w-full h-12 text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700" disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.verify', 'Verify')}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => { setOtpSent(false); setOtp(''); setError(null) }}>
                    Use a different number
                  </Button>
                </form>
              )}
            </motion.div>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><Separator /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/80 px-2 text-muted-foreground">{t('auth.or', 'or')}</span>
            </div>
          </div>

          {/* Google OAuth */}
          <button type="button"
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-foreground hover:bg-gray-50 hover:shadow-sm transition-all disabled:opacity-50"
            onClick={handleGoogleLogin} disabled={loading}>
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {t('auth.google', 'Continue with Google')}
          </button>
        </div>
        <div className="p-6 pt-0 text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-emerald-600 hover:underline">{t('auth.register', 'Sign Up')}</Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
