import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/bookings/[id]
 * Get booking detail. Only accessible if the user is the client or worker of the booking.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(
        '*, service:services(id, name, category, description), client:profiles!bookings_client_id_fkey(id, full_name, avatar_url, phone, email), worker:profiles!bookings_worker_id_fkey(id, full_name, avatar_url, phone, email)'
      )
      .eq('id', id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify the user is a participant
    if (booking.client_id !== user.id && booking.worker_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have access to this booking' },
        { status: 403 }
      )
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('GET /api/bookings/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Valid status transitions map.
 * Key: current status
 * Value: map of new status -> required role ('client' | 'worker' | 'either')
 */
const STATUS_TRANSITIONS: Record<
  string,
  Record<string, 'client' | 'worker' | 'either'>
> = {
  pending: {
    accepted: 'worker',
    declined: 'worker',
    cancelled: 'either',
  },
  accepted: {
    confirmed: 'client',
    cancelled: 'either',
  },
  confirmed: {
    in_progress: 'worker',
    cancelled: 'either',
  },
  in_progress: {
    completed: 'worker',
    no_show: 'worker',
  },
}

/**
 * Human-readable status labels for notifications.
 */
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
}

/**
 * PATCH /api/bookings/[id]
 * Update booking status with validated transitions.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status: newStatus, cancellation_reason, worker_notes } = body

    if (!newStatus) {
      return NextResponse.json(
        { error: 'Missing required field: status' },
        { status: 400 }
      )
    }

    // Fetch the current booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify the user is a participant
    if (booking.client_id !== user.id && booking.worker_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have access to this booking' },
        { status: 403 }
      )
    }

    // Determine the user's role in this booking
    const userRole =
      booking.client_id === user.id ? 'client' : 'worker'

    // Validate the status transition
    const allowedTransitions = STATUS_TRANSITIONS[booking.status]
    if (!allowedTransitions || !allowedTransitions[newStatus]) {
      return NextResponse.json(
        {
          error: `Invalid status transition from '${booking.status}' to '${newStatus}'`,
        },
        { status: 400 }
      )
    }

    const requiredRole = allowedTransitions[newStatus]
    if (requiredRole !== 'either' && requiredRole !== userRole) {
      return NextResponse.json(
        {
          error: `Only the ${requiredRole} can change status to '${newStatus}'`,
        },
        { status: 403 }
      )
    }

    // Build the update payload
    const updateData: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }

    if (newStatus === 'cancelled') {
      updateData.cancellation_reason = cancellation_reason || null
      updateData.cancelled_by = user.id
    }

    if (newStatus === 'in_progress') {
      updateData.actual_start_time = new Date().toISOString()
    }

    if (newStatus === 'completed') {
      updateData.actual_end_time = new Date().toISOString()
    }

    if (worker_notes !== undefined) {
      updateData.worker_notes = worker_notes
    }

    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Booking update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      )
    }

    // Notify the other party
    const notifyUserId =
      userRole === 'client' ? booking.worker_id : booking.client_id
    const statusLabel = STATUS_LABELS[newStatus] || newStatus

    await supabase.from('notifications').insert({
      user_id: notifyUserId,
      title: `Booking ${statusLabel}`,
      body: `Your booking has been updated to: ${statusLabel}.`,
      type: 'booking',
      data: { booking_id: id, new_status: newStatus },
      channel: 'in_app',
    })

    return NextResponse.json({ booking: updatedBooking })
  } catch (error) {
    console.error('PATCH /api/bookings/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
