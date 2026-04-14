'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'
import { WaveBars } from '@/components/loading'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/hooks/use-translation'

type AuthTab = 'email' | 'phone' | 'worker-id'

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-sm mx-auto rounded-2xl" />}>
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

  const tabs: { key: AuthTab; icon: string; label: string }[] = [
    { key: 'worker-id', icon: 'badge', label: 'Worker ID' },
    { key: 'email', icon: 'mail', label: t('auth.email', 'Email') },
    { key: 'phone', icon: 'phone_android', label: t('auth.phone', 'Phone') },
  ]

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-4 max-w-sm mx-auto w-full">
      {/* Header / Logo */}
      <header className="flex flex-col items-center mb-6">
        <div className="bg-[#047857] p-2 rounded-lg mb-2">
          <span className="material-symbols-outlined text-[#9ffdd3] text-2xl">home</span>
        </div>
        <h1 className="font-[var(--font-heading)] font-bold tracking-tighter text-xl text-[#1a1c1b]">DomestIQ</h1>
      </header>

      {/* Welcome */}
      <section className="text-center mb-6">
        <h2 className="font-[var(--font-heading)] text-2xl font-bold tracking-tight text-[#1a1c1b]">Welcome back</h2>
      </section>

      {/* Tab Navigation */}
      <nav className="flex w-full bg-[#f4f4f2] p-1 rounded-lg mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => { setActiveTab(tab.key); setError(null) }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition-all duration-200',
              activeTab === tab.key
                ? 'bg-[#047857] text-[#9ffdd3] font-bold shadow-sm'
                : 'text-[#3e4943] hover:bg-[#eaeae8]'
            )}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Error Message */}
      {error && (
        <div className="w-full rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4 transition-all duration-200">
          {error}
        </div>
      )}

      {/* Worker ID Login */}
      {activeTab === 'worker-id' && (
        <form onSubmit={handleWorkerIdLogin} className="w-full space-y-4 mb-6">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[#3e4943]/60 text-lg">badge</span>
            <input
              type="text"
              placeholder="DQ Code"
              value={workerCode}
              onChange={(e) => setWorkerCode(e.target.value.toUpperCase())}
              required
              autoComplete="username"
              maxLength={7}
              className="w-full pl-10 pr-4 py-3 bg-[#f4f4f2] border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#047857]/30 text-sm font-mono tracking-widest placeholder:text-[#3e4943]/50"
            />
          </div>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[#3e4943]/60 text-lg">lock</span>
            <input
              type="password"
              placeholder={t('auth.password', 'Password')}
              value={workerPassword}
              onChange={(e) => setWorkerPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full pl-10 pr-4 py-3 bg-[#f4f4f2] border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#047857]/30 text-sm placeholder:text-[#3e4943]/50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#005d42] text-white font-bold rounded-lg active:scale-[0.98] transition-all duration-150 shadow-sm disabled:opacity-50"
          >
            {loading ? <WaveBars size="sm" /> : 'Sign In'}
          </button>
          <div className="text-center">
            <p className="text-xs text-[#3e4943]">
              Don&apos;t have a code?{' '}
              <Link href="/helpdesk" className="text-[#1a1c1b] font-semibold underline">Register at a help desk</Link>
            </p>
          </div>
        </form>
      )}

      {/* Email Login */}
      {activeTab === 'email' && (
        <form onSubmit={handleEmailLogin} className="w-full space-y-4 mb-6">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[#3e4943]/60 text-lg">mail</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full pl-10 pr-4 py-3 bg-[#f4f4f2] border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#047857]/30 text-sm placeholder:text-[#3e4943]/50"
            />
          </div>
          <div>
            <div className="flex items-center justify-end mb-1.5">
              <Link href="/forgot-password" className="text-xs text-[#005d42] font-medium hover:underline">
                {t('auth.forgot_password', 'Forgot Password?')}
              </Link>
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#3e4943]/60 text-lg">lock</span>
              <input
                type="password"
                placeholder={t('auth.password', 'Password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-4 py-3 bg-[#f4f4f2] border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#047857]/30 text-sm placeholder:text-[#3e4943]/50"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#005d42] text-white font-bold rounded-lg active:scale-[0.98] transition-all duration-150 shadow-sm disabled:opacity-50"
          >
            {loading ? <WaveBars size="sm" /> : 'Sign In'}
          </button>
        </form>
      )}

      {/* Phone Login */}
      {activeTab === 'phone' && (
        <div className="w-full mb-6">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#3e4943]/60 text-lg">phone_android</span>
                <input
                  type="tel"
                  placeholder="e.g. 0821234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#f4f4f2] border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#047857]/30 text-sm placeholder:text-[#3e4943]/50"
                />
              </div>
              <p className="text-xs text-[#3e4943]">South African numbers will be prefixed with +27 automatically.</p>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#005d42] text-white font-bold rounded-lg active:scale-[0.98] transition-all duration-150 shadow-sm disabled:opacity-50"
              >
                {loading ? <WaveBars size="sm" /> : t('auth.send_otp', 'Send Code')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#3e4943]/60 text-lg">pin</span>
                <input
                  type="text"
                  placeholder="Enter the code sent to your phone"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  className="w-full pl-10 pr-4 py-3 bg-[#f4f4f2] border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#047857]/30 text-sm text-center tracking-widest placeholder:text-[#3e4943]/50 placeholder:tracking-normal placeholder:text-left"
                />
              </div>
              <p className="text-xs text-[#3e4943]">
                We sent a verification code to {phone.startsWith('+') ? phone : `+27${phone}`}
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#005d42] text-white font-bold rounded-lg active:scale-[0.98] transition-all duration-150 shadow-sm disabled:opacity-50"
              >
                {loading ? <WaveBars size="sm" /> : t('auth.verify', 'Verify')}
              </button>
              <button
                type="button"
                onClick={() => { setOtpSent(false); setOtp(''); setError(null) }}
                className="w-full py-2.5 text-sm font-medium text-[#3e4943] hover:text-[#1a1c1b] rounded-lg hover:bg-[#f4f4f2] transition-all duration-150"
              >
                Use a different number
              </button>
            </form>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="relative w-full mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#3e4943]/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#f9f9f7] px-3 text-[#3e4943]">{t('auth.or', 'or')}</span>
        </div>
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 rounded-lg bg-white border border-[#3e4943]/10 px-4 py-3 text-sm font-medium text-[#1a1c1b] hover:bg-[#f4f4f2] hover:shadow-sm active:scale-[0.98] transition-all duration-150 disabled:opacity-50 mb-8"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        {t('auth.google', 'Continue with Google')}
      </button>

      {/* Footer */}
      <footer className="mt-auto pt-4 border-t border-[#3e4943]/10 w-full text-center">
        <Link href="/register" className="text-sm font-bold text-[#005d42]">
          New here? {t('auth.register', 'Create an account')}
        </Link>
      </footer>
    </main>
  )
}
