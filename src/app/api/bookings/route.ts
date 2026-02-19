import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/bookings
 * List bookings for the authenticated user, filtered by their role.
 * Clients see bookings where they are the client; workers see bookings where they are the worker.
 * Supports query params: status, limit, offset.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Determine user role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Build query based on role
    let query = supabase
      .from('bookings')
      .select(
        '*, service:services(id, name, category), client:profiles!bookings_client_id_fkey(id, full_name, avatar_url), worker:profiles!bookings_worker_id_fkey(id, full_name, avatar_url)',
        { count: 'exact' }
      )

    if (profile.role === 'client') {
      query = query.eq('client_id', user.id)
    } else if (profile.role === 'worker') {
      query = query.eq('worker_id', user.id)
    }

    if (status) {
      query = query.eq('status', status)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: bookings, error: bookingsError, count } = await query

    if (bookingsError) {
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      bookings,
      pagination: {
        total: count,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('GET /api/bookings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/bookings
 * Create a new booking (client only).
 * Required fields: worker_id, service_id, scheduled_date, scheduled_start_time, scheduled_end_time.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a client
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'client') {
      return NextResponse.json(
        { error: 'Only clients can create bookings' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      worker_id,
      service_id,
      scheduled_date,
      scheduled_start_time,
      scheduled_end_time,
      location_address,
      location_lat,
      location_lng,
      estimated_cost,
      client_notes,
    } = body

    // Validate required fields
    if (
      !worker_id ||
      !service_id ||
      !scheduled_date ||
      !scheduled_start_time ||
      !scheduled_end_time
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: worker_id, service_id, scheduled_date, scheduled_start_time, scheduled_end_time',
        },
        { status: 400 }
      )
    }

    // Verify worker exists
    const { data: workerProfile } = await supabase
      .from('worker_profiles')
      .select('user_id, is_active')
      .eq('user_id', worker_id)
      .single()

    if (!workerProfile) {
      return NextResponse.json(
        { error: 'Worker not found' },
        { status: 404 }
      )
    }

    if (!workerProfile.is_active) {
      return NextResponse.json(
        { error: 'Worker is not currently active' },
        { status: 400 }
      )
    }

    // Verify service exists
    const { data: service } = await supabase
      .from('services')
      .select('id')
      .eq('id', service_id)
      .eq('is_active', true)
      .single()

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found or inactive' },
        { status: 404 }
      )
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        client_id: user.id,
        worker_id,
        service_id,
        scheduled_date,
        scheduled_start_time,
        scheduled_end_time,
        location_address: location_address || null,
        location_lat: location_lat || null,
        location_lng: location_lng || null,
        estimated_cost: estimated_cost || null,
        client_notes: client_notes || null,
        status: 'pending',
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Booking creation error:', bookingError)
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    // Create notification for the worker
    await supabase.from('notifications').insert({
      user_id: worker_id,
      title: 'New Booking Request',
      body: `You have a new booking request for ${scheduled_date}.`,
      type: 'booking',
      data: { booking_id: booking.id },
      channel: 'in_app',
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error('POST /api/bookings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
