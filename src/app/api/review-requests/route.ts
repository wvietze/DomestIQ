import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/review-requests
 * Get pending review requests for the authenticated user.
 * Workers see their sent requests; clients see pending requests to review.
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
      // Client: show pending requests they need to complete
      const { data: requests } = await supabase
        .from('review_requests')
        .select('*, worker:profiles!review_requests_worker_id_fkey(id, full_name, avatar_url), booking:bookings(id, scheduled_date, service:services(name))')
        .eq('client_id', user.id)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      return NextResponse.json({ requests: requests || [] })
    } else {
      // Worker: show their sent requests
      const { data: requests } = await supabase
        .from('review_requests')
        .select('*, client:profiles!review_requests_client_id_fkey(id, full_name), booking:bookings(id, scheduled_date)')
        .eq('worker_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      return NextResponse.json({ requests: requests || [] })
    }
  } catch (error) {
    console.error('GET /api/review-requests error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/review-requests
 * Worker requests a review from a client for a completed booking.
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
      return NextResponse.json({ error: 'Only workers can request reviews' }, { status: 403 })
    }

    const body = await request.json()
    const { booking_id } = body

    if (!booking_id) {
      return NextResponse.json({ error: 'booking_id is required' }, { status: 400 })
    }

    // Verify booking exists, is completed, and user is the worker
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, client_id, worker_id, status')
      .eq('id', booking_id)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.worker_id !== user.id) {
      return NextResponse.json({ error: 'Not your booking' }, { status: 403 })
    }

    if (booking.status !== 'completed') {
      return NextResponse.json({ error: 'Booking must be completed' }, { status: 400 })
    }

    // Check existing review
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', booking_id)
      .eq('reviewer_id', booking.client_id)
      .single()

    if (existingReview) {
      return NextResponse.json({ error: 'Review already exists for this booking' }, { status: 409 })
    }

    const { data: reviewRequest, error } = await supabase
      .from('review_requests')
      .insert({
        worker_id: user.id,
        client_id: booking.client_id,
        booking_id,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Review request already sent' }, { status: 409 })
      }
      console.error('Review request error:', error)
      return NextResponse.json({ error: 'Failed to create review request' }, { status: 500 })
    }

    // Notify client
    await supabase.from('notifications').insert({
      user_id: booking.client_id,
      title: 'Review Request',
      body: `${profile.full_name} would like you to review their service.`,
      type: 'review_request',
      data: { review_request_id: reviewRequest.id, booking_id },
      channel: 'in_app',
    })

    return NextResponse.json({ reviewRequest }, { status: 201 })
  } catch (error) {
    console.error('POST /api/review-requests error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
