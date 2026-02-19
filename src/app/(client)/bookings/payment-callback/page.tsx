'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react'

interface VerifiedTransaction {
  id: string
  booking_id: string
  total_amount: number
  worker_amount: number
  platform_fee: number
  status: string
  paid_at: string | null
}

type VerificationState =
  | { phase: 'loading' }
  | { phase: 'success'; transaction: VerifiedTransaction }
  | { phase: 'failed'; message: string; bookingId?: string }

function PaymentCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [state, setState] = useState<VerificationState>({ phase: 'loading' })

  const reference = searchParams.get('reference')

  useEffect(() => {
    if (!reference) {
      setState({
        phase: 'failed',
        message: 'No payment reference found. Please try again from your booking.',
      })
      return
    }

    async function verifyPayment() {
      try {
        const res = await fetch(`/api/payments/verify?reference=${encodeURIComponent(reference!)}`)
        const data = await res.json()

        if (!res.ok) {
          setState({
            phase: 'failed',
            message: data.error || 'Payment verification failed. Please contact support.',
          })
          return
        }

        // Paystack returns status 'success' for successful payments
        if (data.status === 'success') {
          setState({
            phase: 'success',
            transaction: data.transaction,
          })
        } else {
          setState({
            phase: 'failed',
            message: `Payment was not completed. Status: ${data.status}. Please try again.`,
            bookingId: data.transaction?.booking_id,
          })
        }
      } catch {
        setState({
          phase: 'failed',
          message: 'Something went wrong while verifying your payment. Please try again.',
        })
      }
    }

    verifyPayment()
  }, [reference])

  // Loading state
  if (state.phase === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl shadow-black/5">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">Verifying your payment...</h2>
                <p className="text-sm text-muted-foreground">
                  Please wait while we confirm your transaction with Paystack.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Success state
  if (state.phase === 'success') {
    const { transaction } = state

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl shadow-black/5">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
              {/* Animated checkmark */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
              </motion.div>

              <div className="space-y-1">
                <h2 className="text-2xl font-bold">Payment Successful!</h2>
                <p className="text-sm text-muted-foreground">
                  Your booking has been confirmed and paid.
                </p>
              </div>

              {/* Booking details summary */}
              <div className="w-full rounded-xl bg-muted/50 p-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-semibold text-foreground">
                    R{transaction.total_amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Completed
                  </span>
                </div>
                {transaction.paid_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium text-foreground">
                      {new Date(transaction.paid_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {reference}
                  </span>
                </div>
              </div>

              <Button
                className="w-full gap-2"
                onClick={() => router.push(`/bookings/${transaction.booking_id}`)}
              >
                View Booking
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Failed state
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl shadow-black/5">
          <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
            {/* Animated X icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            >
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-destructive" />
              </div>
            </motion.div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold">Payment Failed</h2>
              <p className="text-sm text-muted-foreground">
                {state.message}
              </p>
            </div>

            <div className="w-full space-y-3">
              {state.bookingId ? (
                <Button
                  className="w-full gap-2"
                  variant="default"
                  onClick={() => router.push(`/bookings/${state.bookingId}`)}
                >
                  Try Again
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  className="w-full gap-2"
                  variant="default"
                  onClick={() => router.push('/bookings')}
                >
                  Go to Bookings
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl shadow-black/5">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">Verifying your payment...</h2>
                <p className="text-sm text-muted-foreground">
                  Please wait while we confirm your transaction with Paystack.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  )
}
