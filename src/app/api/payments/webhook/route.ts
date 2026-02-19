import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyWebhookSignature, verifyTransaction } from '@/lib/payments/paystack'

// Paystack sends webhook events for payment status changes
// This endpoint must be publicly accessible (no auth)

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    if (!signature || !verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)

    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data)
        break
      case 'charge.failed':
        await handleChargeFailed(event.data)
        break
      case 'transfer.success':
        await handleTransferSuccess(event.data)
        break
      case 'transfer.failed':
        await handleTransferFailed(event.data)
        break
      default:
        // Unhandled event type - acknowledge receipt
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ received: true }) // Always return 200 to Paystack
  }
}

async function handleChargeSuccess(data: { reference: string }) {
  const supabase = createAdminClient()

  // Verify with Paystack to be safe
  const verification = await verifyTransaction(data.reference)
  if (!verification.status || verification.data.status !== 'success') {
    console.error('Payment verification failed for:', data.reference)
    return
  }

  // Update transaction status
  const { data: transaction } = await supabase
    .from('transactions')
    .update({
      status: 'completed',
      paid_at: new Date().toISOString(),
    })
    .eq('paystack_reference', data.reference)
    .eq('status', 'pending')
    .select()
    .single()

  if (!transaction) return

  // Update booking status to indicate payment received
  await supabase
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', transaction.booking_id)

  // Create revenue ledger entry for platform fee
  await supabase.from('revenue_ledger').insert({
    transaction_id: transaction.id,
    entry_type: 'platform_fee',
    amount: transaction.platform_fee,
    currency: 'ZAR',
    description: `Platform fee for booking ${transaction.booking_id}`,
  })

  // Notify worker about the payment
  await supabase.from('notifications').insert({
    user_id: transaction.worker_id,
    type: 'payment_received',
    title: 'Payment Received',
    message: `Payment of R${Number(transaction.worker_amount).toFixed(2)} has been received for your booking.`,
    data: {
      booking_id: transaction.booking_id,
      transaction_id: transaction.id,
      amount: transaction.worker_amount,
    },
  })

  // Notify client about successful payment
  await supabase.from('notifications').insert({
    user_id: transaction.client_id,
    type: 'payment_confirmed',
    title: 'Payment Confirmed',
    message: `Your payment of R${Number(transaction.total_amount).toFixed(2)} has been processed.`,
    data: {
      booking_id: transaction.booking_id,
      transaction_id: transaction.id,
    },
  })
}

async function handleChargeFailed(data: { reference: string }) {
  const supabase = createAdminClient()

  await supabase
    .from('transactions')
    .update({ status: 'failed' })
    .eq('paystack_reference', data.reference)
    .eq('status', 'pending')
}

async function handleTransferSuccess(data: { reference: string; transfer_code: string }) {
  const supabase = createAdminClient()

  const { data: payout } = await supabase
    .from('worker_payouts')
    .update({
      status: 'completed',
      paid_at: new Date().toISOString(),
    })
    .eq('paystack_transfer_code', data.transfer_code)
    .select()
    .single()

  if (!payout) return

  // Notify worker
  await supabase.from('notifications').insert({
    user_id: payout.worker_id,
    type: 'payout_completed',
    title: 'Payout Sent',
    message: `R${Number(payout.amount).toFixed(2)} has been sent to your bank account.`,
    data: { payout_id: payout.id },
  })
}

async function handleTransferFailed(data: { reference: string; transfer_code: string }) {
  const supabase = createAdminClient()

  await supabase
    .from('worker_payouts')
    .update({
      status: 'failed',
      failure_reason: 'Transfer failed - please verify bank details',
    })
    .eq('paystack_transfer_code', data.transfer_code)
}
