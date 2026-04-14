'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Payment callback — currently unused (payments not yet active).
// Acts as a safe redirect back to bookings while rendering a branded spinner.
// Original Paystack verification flow preserved in the comment block below.

export default function PaymentCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const t = setTimeout(() => router.replace('/bookings'), 600)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div className="min-h-[70vh] bg-[#f9f9f7] flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-[0_8px_24px_rgba(26,28,27,0.04)] flex items-center justify-center animate-pulse">
          <span
            className="material-symbols-outlined text-[#005d42]"
            style={{ fontVariationSettings: "'FILL' 1", fontSize: '48px' }}
          >
            event_available
          </span>
        </div>
        <div className="flex flex-col items-center gap-4">
          <p className="font-heading font-semibold text-[#1a1c1b] text-center tracking-tight">
            Redirecting to your bookings...
          </p>
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#047857] animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-[#047857] animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-[#047857] animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  )
}

/*
 * ── Original Paystack Payment Callback (preserved for future restoration) ──
 *
 * import { useState, useEffect, Suspense } from 'react'
 * import { useSearchParams, useRouter } from 'next/navigation'
 * import { Card, CardContent } from '@/components/ui/card'
 * import { Button } from '@/components/ui/button'
 *
 * interface VerifiedTransaction {
 *   id: string
 *   booking_id: string
 *   total_amount: number
 *   worker_amount: number
 *   platform_fee: number
 *   status: string
 *   paid_at: string | null
 * }
 *
 * type VerificationState =
 *   | { phase: 'loading' }
 *   | { phase: 'success'; transaction: VerifiedTransaction }
 *   | { phase: 'failed'; message: string; bookingId?: string }
 *
 * function PaymentCallbackContent() {
 *   const searchParams = useSearchParams()
 *   const router = useRouter()
 *   const [state, setState] = useState<VerificationState>({ phase: 'loading' })
 *   const reference = searchParams.get('reference')
 *
 *   useEffect(() => {
 *     if (!reference) {
 *       setState({ phase: 'failed', message: 'No payment reference found.' })
 *       return
 *     }
 *     async function verifyPayment() {
 *       try {
 *         const res = await fetch(`/api/payments/verify?reference=${encodeURIComponent(reference!)}`)
 *         const data = await res.json()
 *         if (!res.ok) {
 *           setState({ phase: 'failed', message: data.error || 'Payment verification failed.' })
 *           return
 *         }
 *         if (data.status === 'success') {
 *           setState({ phase: 'success', transaction: data.transaction })
 *         } else {
 *           setState({ phase: 'failed', message: `Payment not completed. Status: ${data.status}`, bookingId: data.transaction?.booking_id })
 *         }
 *       } catch {
 *         setState({ phase: 'failed', message: 'Something went wrong while verifying your payment.' })
 *       }
 *     }
 *     verifyPayment()
 *   }, [reference])
 * }
 */
