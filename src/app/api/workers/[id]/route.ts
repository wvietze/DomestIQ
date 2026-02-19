import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/workers/[id]
 * Get worker profile with services, availability, and recent reviews.
 * The [id] param is the worker's user_id.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Fetch worker profile with base profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, preferred_language')
      .eq('id', id)
      .eq('role', 'worker')
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Worker not found' },
        { status: 404 }
      )
    }

    // Fetch worker profile details
    const { data: workerProfile } = await supabase
      .from('worker_profiles')
      .select('*')
      .eq('user_id', id)
      .single()

    if (!workerProfile) {
      return NextResponse.json(
        { error: 'Worker profile not found' },
        { status: 404 }
      )
    }

    // Fetch worker services
    const { data: workerServices } = await supabase
      .from('worker_services')
      .select('*, service:services(id, name, category, description)')
      .eq('worker_id', id)

    // Fetch worker availability
    const { data: availability } = await supabase
      .from('worker_availability')
      .select('*')
      .eq('worker_id', id)
      .eq('is_available', true)
      .order('day_of_week', { ascending: true })

    // Fetch recent reviews (last 10)
    const { data: reviews } = await supabase
      .from('reviews')
      .select(
        '*, reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, avatar_url)'
      )
      .eq('reviewee_id', id)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(10)

    // Fetch service areas
    const { data: serviceAreas } = await supabase
      .from('worker_service_areas')
      .select('*')
      .eq('worker_id', id)

    return NextResponse.json({
      worker: {
        ...profile,
        ...workerProfile,
        services: workerServices || [],
        availability: availability || [],
        reviews: reviews || [],
        serviceAreas: serviceAreas || [],
      },
    })
  } catch (error) {
    console.error('GET /api/workers/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
