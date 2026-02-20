import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/references/share?token=xxx
 * Public endpoint — fetch shared references by token (no auth required).
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Find the share token
    const { data: shareToken } = await supabase
      .from('reference_share_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (!shareToken) {
      return NextResponse.json({ error: 'Invalid or expired share link' }, { status: 404 })
    }

    // Check expiry
    if (new Date(shareToken.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Share link has expired' }, { status: 410 })
    }

    // Fetch the references
    const { data: references } = await supabase
      .from('worker_references')
      .select('id, reference_text, relationship, duration_months, created_at, client:profiles!worker_references_client_id_fkey(full_name)')
      .in('id', shareToken.reference_ids)
      .eq('is_visible_on_profile', true)

    // Fetch worker public info
    const { data: workerProfile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', shareToken.worker_id)
      .single()

    const { data: workerDetails } = await supabase
      .from('worker_profiles')
      .select('overall_rating, total_reviews, services')
      .eq('user_id', shareToken.worker_id)
      .single()

    // Increment view count
    await supabase
      .from('reference_share_tokens')
      .update({ view_count: (shareToken.view_count || 0) + 1 })
      .eq('id', shareToken.id)

    return NextResponse.json({
      worker: {
        full_name: workerProfile?.full_name,
        avatar_url: workerProfile?.avatar_url,
        rating: workerDetails?.overall_rating,
        review_count: workerDetails?.total_reviews,
        services: workerDetails?.services,
      },
      references: references || [],
      expires_at: shareToken.expires_at,
    })
  } catch (error) {
    console.error('GET /api/references/share error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/references/share
 * Worker creates a shareable link for selected references.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { reference_ids } = body

    if (!reference_ids || !Array.isArray(reference_ids) || reference_ids.length === 0) {
      return NextResponse.json({ error: 'reference_ids array is required' }, { status: 400 })
    }

    // Verify all references belong to this worker
    const { data: refs } = await supabase
      .from('worker_references')
      .select('id')
      .eq('worker_id', user.id)
      .in('id', reference_ids)

    if (!refs || refs.length !== reference_ids.length) {
      return NextResponse.json({ error: 'Some references not found or not yours' }, { status: 403 })
    }

    const { data: shareToken, error } = await supabase
      .from('reference_share_tokens')
      .insert({
        worker_id: user.id,
        reference_ids,
      })
      .select()
      .single()

    if (error) {
      console.error('Share token creation error:', error)
      return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
    }

    return NextResponse.json({ shareToken }, { status: 201 })
  } catch (error) {
    console.error('POST /api/references/share error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
