import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const placement = request.nextUrl.searchParams.get('placement')
    const role = request.nextUrl.searchParams.get('role')
    const service = request.nextUrl.searchParams.get('service')

    if (!placement || !role) {
      return NextResponse.json({ error: 'placement and role query params required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const now = new Date().toISOString()

    // Fetch active ads matching placement and role
    let query = supabase
      .from('ad_placements')
      .select('id, advertiser_name, advertiser_logo_url, placement, headline, description, image_url, cta_text, cta_url')
      .eq('placement', placement)
      .eq('is_active', true)
      .lte('starts_at', now)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .in('target_role', [role, 'all'])

    const { data: ads, error } = await query

    if (error) {
      console.error('Ad fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 })
    }

    if (!ads || ads.length === 0) {
      return NextResponse.json({ ad: null })
    }

    // Filter by target_services if service param provided
    // (we can't easily filter arrays in Supabase query, so filter in JS)
    let filtered = ads
    if (service) {
      // Get full ad data with target_services for filtering
      const { data: fullAds } = await supabase
        .from('ad_placements')
        .select('id, target_services')
        .in('id', ads.map(a => a.id))

      if (fullAds) {
        const serviceFilteredIds = fullAds
          .filter(a => !a.target_services || a.target_services.includes(service))
          .map(a => a.id)
        filtered = ads.filter(a => serviceFilteredIds.includes(a.id))
      }
    }

    if (filtered.length === 0) {
      return NextResponse.json({ ad: null })
    }

    // Pick one randomly
    const selectedAd = filtered[Math.floor(Math.random() * filtered.length)]

    // Increment impression count
    const { data: current } = await supabase
      .from('ad_placements')
      .select('impressions')
      .eq('id', selectedAd.id)
      .single()

    if (current) {
      await supabase
        .from('ad_placements')
        .update({ impressions: (current.impressions || 0) + 1 })
        .eq('id', selectedAd.id)
    }

    return NextResponse.json({ ad: selectedAd })
  } catch (error) {
    console.error('Ad serve error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { ad_id } = await request.json()
    if (!ad_id) {
      return NextResponse.json({ error: 'ad_id required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: current } = await supabase
      .from('ad_placements')
      .select('clicks')
      .eq('id', ad_id)
      .single()

    if (current) {
      await supabase
        .from('ad_placements')
        .update({ clicks: (current.clicks || 0) + 1 })
        .eq('id', ad_id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ad click error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
