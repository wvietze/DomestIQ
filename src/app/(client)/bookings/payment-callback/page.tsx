'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Payment callback — currently unused (payments not yet active)
// Original implementation preserved below for future activation

export default function PaymentCallbackPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/bookings') }, [router])
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to your bookings...</p>
    </div>
  )
}

/*
 * ── Original Paystack Payment Callback (preserved for future restoration) ──
 *
 * import { useState, useEffect, Suspense } from 'react'
 * import { useSearchParams, useRouter } from 'next/navigation'
 * import { motion } from 'framer-motion'
 * import { Card, CardContent } from '@/components/ui/card'
 * import { Button } from '@/components/ui/button'
 * import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react'
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
 *
 *   // ... loading / success / failed UI states with Paystack reference display
 * }
 */
