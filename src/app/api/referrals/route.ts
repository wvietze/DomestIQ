import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/referrals
 * Returns the current worker's referral stats + list of referrals
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get worker profile with referral code
    const { data: workerProfile } = await supabase
      .from('worker_profiles')
      .select('id, referral_code')
      .eq('user_id', user.id)
      .single()

    if (!workerProfile) {
      return NextResponse.json({ error: 'Worker profile not found' }, { status: 404 })
    }

    // Get referrals with referred profile info
    const { data: referrals } = await supabase
      .from('referrals')
      .select('*, referred_profile:profiles!referred_user_id(full_name, avatar_url)')
      .eq('referrer_worker_profile_id', workerProfile.id)
      .order('created_at', { ascending: false })

    const referralList = referrals || []
    const qualifiedReferrals = referralList.filter(r => r.status === 'qualified' || r.status === 'paid')
    const totalEarned = qualifiedReferrals.reduce((sum, r) => sum + Number(r.reward_amount), 0)

    return NextResponse.json({
      referrals: referralList,
      stats: {
        total_referrals: referralList.length,
        qualified_referrals: qualifiedReferrals.length,
        total_earned: totalEarned,
        referral_code: workerProfile.referral_code || '',
      },
    })
  } catch (error) {
    console.error('GET /api/referrals error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/referrals
 * Records a referral during registration
 * Body: { referral_code: string, referred_user_id: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { referral_code, referred_user_id } = body

    if (!referral_code || !referred_user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: referral_code, referred_user_id' },
        { status: 400 }
      )
    }

    // Look up the referrer by referral code
    const { data: referrerProfile } = await supabase
      .from('worker_profiles')
      .select('id, user_id')
      .eq('referral_code', referral_code.toUpperCase().trim())
      .single()

    if (!referrerProfile) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
    }

    // Prevent self-referral
    if (referrerProfile.user_id === referred_user_id) {
      return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 })
    }

    // Check if referral already exists for this user
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_user_id', referred_user_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Referral already recorded' }, { status: 409 })
    }

    // Insert the referral
    const { data: referral, error: insertError } = await supabase
      .from('referrals')
      .insert({
        referrer_worker_profile_id: referrerProfile.id,
        referred_user_id,
        referral_code_used: referral_code.toUpperCase().trim(),
        status: 'pending',
        reward_amount: 2.00,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Referral insert error:', insertError)
      return NextResponse.json({ error: 'Failed to record referral' }, { status: 500 })
    }

    return NextResponse.json({ referral }, { status: 201 })
  } catch (error) {
    console.error('POST /api/referrals error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
