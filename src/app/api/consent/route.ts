import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: List user's active consents
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: consents } = await supabase
      .from('consent_records')
      .select('*')
      .eq('user_id', user.id)
      .is('revoked_at', null)
      .order('created_at', { ascending: false })

    return NextResponse.json({ consents: consents || [] })
  } catch (error) {
    console.error('Consent fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Grant a new consent
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { consent_type, consent_category, consent_text } = body

    const validTypes = [
      'platform_terms',
      'privacy_policy',
      'popi_consent',
      'income_data_sharing',
      'identity_sharing',
      'marketing',
      'location_tracking',
    ]

    if (!consent_type || !validTypes.includes(consent_type)) {
      return NextResponse.json(
        { error: `Invalid consent_type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if active consent of this type already exists
    const { data: existing } = await supabase
      .from('consent_records')
      .select('id')
      .eq('user_id', user.id)
      .eq('consent_type', consent_type)
      .eq('consent_given', true)
      .is('revoked_at', null)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Active consent already exists for this type', consent_id: existing.id },
        { status: 409 }
      )
    }

    // Calculate expiry (income sharing expires after 1 year, others don't expire)
    const expiresAt = ['income_data_sharing', 'identity_sharing'].includes(consent_type)
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : null

    const { data: consent, error } = await supabase
      .from('consent_records')
      .insert({
        user_id: user.id,
        consent_type,
        consent_given: true,
        consent_text: consent_text || `User consented to ${consent_type}`,
        consent_category: consent_category || consent_type,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        expires_at: expiresAt,
      })
      .select()
      .single()

    if (error) {
      console.error('Consent insert error:', error)
      return NextResponse.json(
        { error: 'Failed to record consent' },
        { status: 500 }
      )
    }

    return NextResponse.json({ consent })
  } catch (error) {
    console.error('Consent error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Revoke a consent
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const consentId = request.nextUrl.searchParams.get('id')
    if (!consentId) {
      return NextResponse.json(
        { error: 'consent id is required' },
        { status: 400 }
      )
    }

    // Revoke consent (don't delete - keep audit trail)
    const { error } = await supabase
      .from('consent_records')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', consentId)
      .eq('user_id', user.id)
      .is('revoked_at', null)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to revoke consent' },
        { status: 500 }
      )
    }

    // Also expire any pending partner data requests linked to this consent
    await supabase
      .from('partner_data_requests')
      .update({ status: 'denied' })
      .eq('consent_id', consentId)
      .eq('status', 'pending_consent')

    return NextResponse.json({ revoked: true })
  } catch (error) {
    console.error('Consent revocation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
