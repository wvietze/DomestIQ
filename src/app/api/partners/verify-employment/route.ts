import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/partners/verify-employment
 * Consent-gated endpoint returning structured work history + education + skills.
 * Same pattern as verify-income. Requires cv_data_sharing consent.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Verify API key
    const { data: partner } = await supabase
      .from('partner_api_keys')
      .select('*')
      .eq('is_active', true)
      .single()

    if (!partner) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Check permissions
    if (!partner.permissions.includes('employment_verification')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { worker_id, consent_reference } = body

    if (!worker_id || !consent_reference) {
      return NextResponse.json({ error: 'worker_id and consent_reference required' }, { status: 400 })
    }

    // Verify consent exists and is active
    const { data: consent } = await supabase
      .from('consent_records')
      .select('*')
      .eq('id', consent_reference)
      .eq('user_id', worker_id)
      .eq('consent_type', 'cv_data_sharing')
      .eq('consent_given', true)
      .is('revoked_at', null)
      .single()

    if (!consent) {
      return NextResponse.json(
        { error: 'No valid cv_data_sharing consent found.' },
        { status: 403 }
      )
    }

    if (consent.expires_at && new Date(consent.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Consent has expired.' }, { status: 403 })
    }

    // Fetch CV data (structured, no personal_statement)
    const { data: cvData } = await supabase
      .from('worker_cv_data')
      .select('work_history, education, skills, languages')
      .eq('worker_id', worker_id)
      .single()

    // Fetch verification + rating
    const { data: workerProfile } = await supabase
      .from('worker_profiles')
      .select('is_verified, overall_rating, total_reviews, years_experience')
      .eq('user_id', worker_id)
      .single()

    const responseData = {
      worker_id,
      verification_status: {
        identity_verified: workerProfile?.is_verified || false,
        platform_rating: workerProfile?.overall_rating || null,
        total_reviews: workerProfile?.total_reviews || 0,
        years_experience: workerProfile?.years_experience || null,
      },
      employment_data: {
        work_history: cvData?.work_history || [],
        education: cvData?.education || [],
        skills: cvData?.skills || [],
        languages: cvData?.languages || [],
      },
      consent: {
        reference: consent_reference,
        granted_at: consent.created_at,
        expires_at: consent.expires_at,
      },
    }

    // Log the request
    await supabase.from('partner_data_requests').insert({
      partner_id: partner.id,
      worker_id,
      consent_id: consent_reference,
      request_type: 'employment_verification',
      status: 'fulfilled',
      data_shared: responseData,
      fulfilled_at: new Date().toISOString(),
    })

    await supabase.from('partner_api_log').insert({
      partner_id: partner.id,
      endpoint: '/api/partners/verify-employment',
      method: 'POST',
      status_code: 200,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    })

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Partner employment verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
