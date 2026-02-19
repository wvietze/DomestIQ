import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyTransaction } from '@/lib/payments/paystack'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reference = request.nextUrl.searchParams.get('reference')
    if (!reference) {
      return NextResponse.json(
        { error: 'reference is required' },
        { status: 400 }
      )
    }

    // Check that the transaction belongs to this user
    const { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('paystack_reference', reference)
      .eq('client_id', user.id)
      .single()

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Verify with Paystack
    const verification = await verifyTransaction(reference)

    return NextResponse.json({
      status: verification.data?.status || 'unknown',
      transaction: {
        id: transaction.id,
        booking_id: transaction.booking_id,
        worker_amount: transaction.worker_amount,
        platform_fee: transaction.platform_fee,
        total_amount: transaction.total_amount,
        status: transaction.status,
        paid_at: transaction.paid_at,
      },
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
