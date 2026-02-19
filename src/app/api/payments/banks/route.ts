import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listBanks } from '@/lib/payments/paystack'

// Returns list of SA banks for worker payout setup
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await listBanks()

    if (!result.status) {
      return NextResponse.json(
        { error: 'Failed to fetch banks' },
        { status: 502 }
      )
    }

    // Return only active banks
    const banks = result.data
      .filter((b) => b.active)
      .map((b) => ({
        name: b.name,
        code: b.code,
        slug: b.slug,
      }))

    return NextResponse.json({ banks })
  } catch (error) {
    console.error('Banks fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
