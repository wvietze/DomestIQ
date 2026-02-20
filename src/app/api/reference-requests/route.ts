import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/reference-requests
 * Workers see their sent requests; clients see pending requests.
 */
export async function GET() {
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

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.role === 'client') {
      const { data: requests } = await supabase
        .from('reference_requests')
        .select('*, worker:profiles!reference_requests_worker_id_fkey(id, full_name, avatar_url)')
        .eq('client_id', user.id)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      return NextResponse.json({ requests: requests || [] })
    } else {
      const { data: requests } = await supabase
        .from('reference_requests')
        .select('*, client:profiles!reference_requests_client_id_fkey(id, full_name)')
        .eq('worker_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      return NextResponse.json({ requests: requests || [] })
    }
  } catch (error) {
    console.error('GET /api/reference-requests error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/reference-requests
 * Worker requests a reference from a client.
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
      .select('role, full_name')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'worker') {
      return NextResponse.json({ error: 'Only workers can request references' }, { status: 403 })
    }

    const body = await request.json()
    const { client_id, message } = body

    if (!client_id) {
      return NextResponse.json({ error: 'client_id is required' }, { status: 400 })
    }

    const { data: refRequest, error } = await supabase
      .from('reference_requests')
      .insert({
        worker_id: user.id,
        client_id,
        message: message || null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Reference request already sent to this client' }, { status: 409 })
      }
      console.error('Reference request error:', error)
      return NextResponse.json({ error: 'Failed to create reference request' }, { status: 500 })
    }

    // Notify client
    await supabase.from('notifications').insert({
      user_id: client_id,
      title: 'Reference Request',
      body: `${profile.full_name} would like you to write them a reference.`,
      type: 'reference_request',
      data: { reference_request_id: refRequest.id, worker_id: user.id },
      channel: 'in_app',
    })

    return NextResponse.json({ referenceRequest: refRequest }, { status: 201 })
  } catch (error) {
    console.error('POST /api/reference-requests error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
