import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/references?workerId=xxx
 * Get visible references for a worker (public).
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const workerId = request.nextUrl.searchParams.get('workerId')

    if (!workerId) {
      return NextResponse.json({ error: 'workerId is required' }, { status: 400 })
    }

    const { data: references } = await supabase
      .from('worker_references')
      .select('*, client:profiles!worker_references_client_id_fkey(id, full_name, avatar_url)')
      .eq('worker_id', workerId)
      .eq('is_visible_on_profile', true)
      .order('created_at', { ascending: false })

    return NextResponse.json({ references: references || [] })
  } catch (error) {
    console.error('GET /api/references error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/references
 * Client writes a reference for a worker.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'client') {
      return NextResponse.json({ error: 'Only clients can write references' }, { status: 403 })
    }

    const body = await request.json()
    const { worker_id, reference_text, relationship, duration_months, booking_id } = body

    if (!worker_id || !reference_text || !relationship) {
      return NextResponse.json(
        { error: 'worker_id, reference_text, and relationship are required' },
        { status: 400 }
      )
    }

    const validRelationships = ['employer', 'client', 'regular_client']
    if (!validRelationships.includes(relationship)) {
      return NextResponse.json(
        { error: `relationship must be one of: ${validRelationships.join(', ')}` },
        { status: 400 }
      )
    }

    if (reference_text.length < 20 || reference_text.length > 2000) {
      return NextResponse.json(
        { error: 'Reference must be between 20 and 2000 characters' },
        { status: 400 }
      )
    }

    const { data: reference, error } = await supabase
      .from('worker_references')
      .insert({
        worker_id,
        client_id: user.id,
        booking_id: booking_id || null,
        reference_text,
        relationship,
        duration_months: duration_months || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Reference creation error:', error)
      return NextResponse.json({ error: 'Failed to create reference' }, { status: 500 })
    }

    // Mark matching reference request as completed
    await supabase
      .from('reference_requests')
      .update({ status: 'completed' })
      .eq('worker_id', worker_id)
      .eq('client_id', user.id)
      .eq('status', 'pending')

    // Notify worker
    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    await supabase.from('notifications').insert({
      user_id: worker_id,
      title: 'New Reference',
      body: `${clientProfile?.full_name || 'A client'} wrote you a reference.`,
      type: 'reference',
      data: { reference_id: reference.id },
      channel: 'in_app',
    })

    return NextResponse.json({ reference }, { status: 201 })
  } catch (error) {
    console.error('POST /api/references error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
