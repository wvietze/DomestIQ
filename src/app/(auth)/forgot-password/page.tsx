'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback?next=/profile`
        : undefined

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo }
    )

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#005d42]"
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              home
            </span>
            <span className="font-heading text-xl font-bold">DomestIQ</span>
          </Link>
        </div>

        <h1 className="font-heading text-2xl font-bold text-[#1a1c1b]">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-[#3e4943]">
          {sent
            ? 'Check your inbox for a reset link.'
            : 'Enter your email and we’ll send you a link to reset your password.'}
        </p>

        {!sent && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-lg border border-[#ba1a1a]/40 bg-[#ffdad6] px-4 py-3 text-sm text-[#ba1a1a]">
                {error}
              </div>
            )}

            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#3e4943]/60 text-lg">
                mail
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-lg border-none bg-[#f4f4f2] px-4 py-3 pl-10 text-sm placeholder:text-[#3e4943]/50 focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#005d42] py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-[#3e4943]">
          Remembered it?{' '}
          <Link
            href="/login"
            className="font-medium text-[#005d42] hover:underline"
          >
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  )
}
