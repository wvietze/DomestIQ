import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/reviews
 * Get reviews for a user (query param: userId). Supports pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const userId = searchParams.get('userId')
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '20', 10),
      100
    )
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required query param: userId' },
        { status: 400 }
      )
    }

    const { data: reviews, error, count } = await supabase
      .from('reviews')
      .select(
        '*, reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, avatar_url), booking:bookings(id, service_id, scheduled_date, service:services(id, name))',
        { count: 'exact' }
      )
      .eq('reviewee_id', userId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Reviews fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      reviews: reviews || [],
      pagination: {
        total: count,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('GET /api/reviews error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Validate that a rating value is between 1 and 5.
 */
function isValidRating(value: unknown): value is number {
  return typeof value === 'number' && value >= 1 && value <= 5
}

/**
 * POST /api/reviews
 * Create a review. Client only, must have a completed booking with the worker.
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
        { error: 'Only clients can create reviews' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      booking_id,
      rating,
      comment,
      professionalism_rating,
      punctuality_rating,
      quality_rating,
    } = body

    // Validate required fields
    if (!booking_id || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields: booking_id, rating' },
        { status: 400 }
      )
    }

    // Validate rating values
    if (!isValidRating(rating)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (
      professionalism_rating !== undefined &&
      !isValidRating(professionalism_rating)
    ) {
      return NextResponse.json(
        { error: 'professionalism_rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (
      punctuality_rating !== undefined &&
      !isValidRating(punctuality_rating)
    ) {
      return NextResponse.json(
        { error: 'punctuality_rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (quality_rating !== undefined && !isValidRating(quality_rating)) {
      return NextResponse.json(
        { error: 'quality_rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Verify booking exists, is completed, and user is the client
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, client_id, worker_id, status')
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (booking.client_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only review bookings you created' },
        { status: 403 }
      )
    }

    if (booking.status !== 'completed') {
      return NextResponse.json(
        { error: 'You can only review completed bookings' },
        { status: 400 }
      )
    }

    // Check if a review already exists for this booking by this user
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', booking_id)
      .eq('reviewer_id', user.id)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this booking' },
        { status: 409 }
      )
    }

    // Create the review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        booking_id,
        reviewer_id: user.id,
        reviewee_id: booking.worker_id,
        rating,
        comment: comment || null,
        professionalism_rating: professionalism_rating || null,
        punctuality_rating: punctuality_rating || null,
        quality_rating: quality_rating || null,
      })
      .select()
      .single()

    if (reviewError) {
      console.error('Review creation error:', reviewError)
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      )
    }

    // Notify the worker
    await supabase.from('notifications').insert({
      user_id: booking.worker_id,
      title: 'New Review',
      body: `You received a ${rating}-star review.`,
      type: 'review',
      data: { review_id: review.id, booking_id },
      channel: 'in_app',
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('POST /api/reviews error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
