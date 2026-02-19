import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  initializeTransaction,
  generateReference,
} from '@/lib/payments/paystack'
import { calculatePlatformFee } from '@/lib/types/payment'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { booking_id } = body

    if (!booking_id) {
      return NextResponse.json(
        { error: 'booking_id is required' },
        { status: 400 }
      )
    }

    // Fetch booking with worker info
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .eq('client_id', user.id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (!['pending', 'accepted', 'confirmed'].includes(booking.status)) {
      return NextResponse.json(
        { error: 'Booking is not in a payable state' },
        { status: 400 }
      )
    }

    // Check if a transaction already exists for this booking
    const { data: existingTx } = await supabase
      .from('transactions')
      .select('id, status')
      .eq('booking_id', booking_id)
      .in('status', ['pending', 'processing', 'completed'])
      .single()

    if (existingTx) {
      return NextResponse.json(
        { error: 'Payment already initiated for this booking' },
        { status: 409 }
      )
    }

    const workerAmount = Number(booking.total_amount) || 0
    if (workerAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid booking amount' },
        { status: 400 }
      )
    }

    // Calculate fee breakdown
    const { platformFee, totalAmount, feePercent } =
      calculatePlatformFee(workerAmount)

    const reference = generateReference()
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/bookings/payment-callback`

    // Initialize Paystack transaction
    const paystackResult = await initializeTransaction({
      email: user.email || '',
      amount: totalAmount,
      reference,
      callbackUrl,
      metadata: {
        booking_id,
        client_id: user.id,
        worker_id: booking.worker_id,
        worker_amount: workerAmount,
        platform_fee: platformFee,
      },
    })

    if (!paystackResult.status) {
      return NextResponse.json(
        { error: paystackResult.message || 'Payment initialization failed' },
        { status: 502 }
      )
    }

    // Create transaction record
    await supabase.from('transactions').insert({
      booking_id,
      client_id: user.id,
      worker_id: booking.worker_id,
      worker_amount: workerAmount,
      platform_fee: platformFee,
      total_amount: totalAmount,
      platform_fee_percent: feePercent,
      currency: 'ZAR',
      status: 'pending',
      paystack_reference: reference,
      paystack_access_code: paystackResult.data.access_code,
    })

    return NextResponse.json({
      authorization_url: paystackResult.data.authorization_url,
      access_code: paystackResult.data.access_code,
      reference,
      breakdown: {
        worker_amount: workerAmount,
        platform_fee: platformFee,
        total_amount: totalAmount,
        fee_percent: feePercent,
      },
    })
  } catch (error) {
    console.error('Payment initialization error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
