import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/worker-estates?workerId=xxx
 * Get estate registrations for a worker.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const workerId = request.nextUrl.searchParams.get('workerId')

    if (!workerId) {
      // If no workerId, get for authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'workerId or auth required' }, { status: 400 })
      }

      const { data: registrations } = await supabase
        .from('worker_estate_registrations')
        .select('*, estate:estates(*)')
        .eq('worker_id', user.id)
        .order('created_at', { ascending: false })

      return NextResponse.json({ registrations: registrations || [] })
    }

    const { data: registrations } = await supabase
      .from('worker_estate_registrations')
      .select('*, estate:estates(*)')
      .eq('worker_id', workerId)
      .order('created_at', { ascending: false })

    return NextResponse.json({ registrations: registrations || [] })
  } catch (error) {
    console.error('GET /api/worker-estates error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/worker-estates
 * Register worker at an estate.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { estate_id, registration_number, registered_since } = body

    if (!estate_id) {
      return NextResponse.json({ error: 'estate_id is required' }, { status: 400 })
    }

    const { data: registration, error } = await supabase
      .from('worker_estate_registrations')
      .insert({
        worker_id: user.id,
        estate_id,
        registration_number: registration_number || null,
        registered_since: registered_since || null,
      })
      .select('*, estate:estates(*)')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Already registered at this estate' }, { status: 409 })
      }
      console.error('Estate registration error:', error)
      return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
    }

    return NextResponse.json({ registration }, { status: 201 })
  } catch (error) {
    console.error('POST /api/worker-estates error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/worker-estates?id=xxx
 * Remove estate registration.
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('worker_estate_registrations')
      .delete()
      .eq('id', id)
      .eq('worker_id', user.id)

    if (error) {
      console.error('Estate registration deletion error:', error)
      return NextResponse.json({ error: 'Failed to remove registration' }, { status: 500 })
    }

    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('DELETE /api/worker-estates error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
