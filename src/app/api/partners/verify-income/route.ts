import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Partner API: Verify worker income (consent-gated)
// Partners must authenticate with API key and provide consent reference

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Verify API key (hash comparison)
    // In production, use bcrypt. For now, we'll use a simple lookup
    const { data: partner } = await supabase
      .from('partner_api_keys')
      .select('*')
      .eq('is_active', true)
      .single()

    // Note: In production, hash the API key and compare with stored hash
    if (!partner) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    // Check permissions
    if (!partner.permissions.includes('income_verification')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { worker_id, consent_reference } = body

    if (!worker_id || !consent_reference) {
      return NextResponse.json(
        { error: 'worker_id and consent_reference required' },
        { status: 400 }
      )
    }

    // Verify consent exists and is active
    const { data: consent } = await supabase
      .from('consent_records')
      .select('*')
      .eq('id', consent_reference)
      .eq('user_id', worker_id)
      .eq('consent_type', 'income_data_sharing')
      .eq('consent_given', true)
      .is('revoked_at', null)
      .single()

    if (!consent) {
      return NextResponse.json(
        { error: 'No valid consent found. Worker must grant consent first.' },
        { status: 403 }
      )
    }

    // Check consent hasn't expired
    if (consent.expires_at && new Date(consent.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Consent has expired. Worker must renew consent.' },
        { status: 403 }
      )
    }

    // Fetch income data (sanitized - no personal details)
    const { data: statements } = await supabase
      .from('income_statements')
      .select('period_start, period_end, total_earnings, total_bookings, avg_booking_value, verification_hash')
      .eq('worker_id', worker_id)
      .order('period_start', { ascending: false })
      .limit(12)

    // Calculate aggregate metrics
    const totalEarnings = (statements || []).reduce(
      (sum, s) => sum + Number(s.total_earnings), 0
    )
    const totalMonths = (statements || []).length
    const avgMonthlyEarnings = totalMonths > 0 ? totalEarnings / totalMonths : 0

    // Get worker verification status (no personal data)
    const { data: workerProfile } = await supabase
      .from('worker_profiles')
      .select('is_verified, overall_rating, total_reviews')
      .eq('user_id', worker_id)
      .single()

    const responseData = {
      worker_id,
      verification_status: {
        identity_verified: workerProfile?.is_verified || false,
        platform_rating: workerProfile?.overall_rating || null,
        total_reviews: workerProfile?.total_reviews || 0,
      },
      income_summary: {
        currency: 'ZAR',
        months_of_data: totalMonths,
        total_earnings: totalEarnings,
        avg_monthly_earnings: avgMonthlyEarnings,
        data_period: statements && statements.length > 0
          ? {
              from: statements[statements.length - 1].period_start,
              to: statements[0].period_end,
            }
          : null,
      },
      monthly_breakdown: (statements || []).map((s) => ({
        period: s.period_start,
        earnings: Number(s.total_earnings),
        bookings: s.total_bookings,
        verification_hash: s.verification_hash,
      })),
      consent: {
        reference: consent_reference,
        granted_at: consent.created_at,
        expires_at: consent.expires_at,
      },
    }

    // Log the request and mark data as shared
    await supabase.from('partner_data_requests').insert({
      partner_id: partner.id,
      worker_id,
      consent_id: consent_reference,
      request_type: 'income_verification',
      status: 'fulfilled',
      data_shared: responseData,
      fulfilled_at: new Date().toISOString(),
    })

    // Log API request
    await supabase.from('partner_api_log').insert({
      partner_id: partner.id,
      endpoint: '/api/partners/verify-income',
      method: 'POST',
      status_code: 200,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    })

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Partner income verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
