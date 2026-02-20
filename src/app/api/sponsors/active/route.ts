import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const placement = request.nextUrl.searchParams.get('placement')
    if (!placement) {
      return NextResponse.json({ error: 'placement query param required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const now = new Date().toISOString()

    const { data: sponsorships, error } = await supabase
      .from('sponsorships')
      .select('id, partner_name, partner_logo_url, placement, headline, description, cta_text, cta_url, bg_color, text_color')
      .eq('placement', placement)
      .eq('is_active', true)
      .lte('starts_at', now)
      .or(`ends_at.is.null,ends_at.gte.${now}`)

    if (error) {
      console.error('Sponsorship fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch sponsorships' }, { status: 500 })
    }

    // Increment impression count for returned sponsorships
    if (sponsorships && sponsorships.length > 0) {
      for (const s of sponsorships) {
        const { data: current } = await supabase
          .from('sponsorships')
          .select('impressions')
          .eq('id', s.id)
          .single()

        if (current) {
          await supabase
            .from('sponsorships')
            .update({ impressions: (current.impressions || 0) + 1 })
            .eq('id', s.id)
        }
      }
    }

    return NextResponse.json({ sponsorships: sponsorships || [] })
  } catch (error) {
    console.error('Sponsorship active error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sponsorship_id } = await request.json()
    if (!sponsorship_id) {
      return NextResponse.json({ error: 'sponsorship_id required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Increment click count
    const { data: current } = await supabase
      .from('sponsorships')
      .select('clicks')
      .eq('id', sponsorship_id)
      .single()

    if (current) {
      await supabase
        .from('sponsorships')
        .update({ clicks: (current.clicks || 0) + 1 })
        .eq('id', sponsorship_id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Sponsorship click error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
