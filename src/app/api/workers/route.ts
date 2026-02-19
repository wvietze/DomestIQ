import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/workers
 * Search workers using the search_workers RPC function.
 * Query params: lat, lng, radius, serviceId, minRating, availableDay, limit, offset.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const lat = parseFloat(searchParams.get('lat') || '')
    const lng = parseFloat(searchParams.get('lng') || '')
    const radius = parseFloat(searchParams.get('radius') || '25')
    const serviceId = searchParams.get('serviceId')
    const minRating = parseFloat(searchParams.get('minRating') || '0')
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '20', 10),
      100
    )
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Missing required query params: lat, lng' },
        { status: 400 }
      )
    }

    // Build RPC arguments
    const rpcArgs: {
      search_lat: number
      search_lng: number
      search_radius_km: number
      service_filter?: string
      min_rating?: number
    } = {
      search_lat: lat,
      search_lng: lng,
      search_radius_km: radius,
    }

    if (serviceId) {
      rpcArgs.service_filter = serviceId
    }

    if (minRating > 0) {
      rpcArgs.min_rating = minRating
    }

    const { data: workers, error } = await supabase.rpc(
      'search_workers',
      rpcArgs
    )

    if (error) {
      console.error('search_workers RPC error:', error)
      return NextResponse.json(
        { error: 'Failed to search workers' },
        { status: 500 }
      )
    }

    // Apply client-side pagination (RPC may not support offset natively)
    const paginatedWorkers = (workers || []).slice(offset, offset + limit)

    return NextResponse.json({
      workers: paginatedWorkers,
      pagination: {
        total: workers?.length || 0,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('GET /api/workers error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
