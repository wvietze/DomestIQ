import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSmartRecommendations } from '@/lib/ai/smart-match'

/**
 * POST /api/ai/smart-match
 * Get smart worker recommendations for a client.
 * Body: { clientId: string, serviceId?: string, description?: string }
 *
 * 1. Queries top 10 workers from search_workers RPC.
 * 2. Uses Claude to score/rank them based on the client's needs.
 * Returns: { recommendations: Array<{ workerId, score, reason }> }
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

    const body = await request.json()
    const { clientId, serviceId, description } = body

    if (!clientId) {
      return NextResponse.json(
        { error: 'Missing required field: clientId' },
        { status: 400 }
      )
    }

    // Verify the requesting user is the client or an admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (profile.role !== 'admin' && user.id !== clientId) {
      return NextResponse.json(
        { error: 'You can only get recommendations for yourself' },
        { status: 403 }
      )
    }

    const result = await getSmartRecommendations({
      clientId,
      serviceId,
      description,
    })

    return NextResponse.json({
      recommendations: result.recommendations,
    })
  } catch (error) {
    console.error('POST /api/ai/smart-match error:', error)
    return NextResponse.json(
      { error: 'Smart matching failed' },
      { status: 500 }
    )
  }
}
