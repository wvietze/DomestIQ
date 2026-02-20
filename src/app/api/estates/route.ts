import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/estates?q=xxx&city=xxx
 * Search estates by name (fuzzy) and optionally city.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const q = request.nextUrl.searchParams.get('q') || ''
    const city = request.nextUrl.searchParams.get('city')

    let query = supabase
      .from('estates')
      .select('*')
      .order('name')
      .limit(20)

    if (q.length >= 2) {
      query = query.ilike('name', `%${q}%`)
    }

    if (city) {
      query = query.eq('city', city)
    }

    const { data: estates, error } = await query

    if (error) {
      console.error('Estate search error:', error)
      return NextResponse.json({ error: 'Failed to search estates' }, { status: 500 })
    }

    return NextResponse.json({ estates: estates || [] })
  } catch (error) {
    console.error('GET /api/estates error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/estates
 * Add a new estate (authenticated users only).
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, suburb, city, province, security_company, requires_preregistration } = body

    if (!name || !suburb || !city || !province) {
      return NextResponse.json(
        { error: 'name, suburb, city, and province are required' },
        { status: 400 }
      )
    }

    const { data: estate, error } = await supabase
      .from('estates')
      .insert({
        name,
        suburb,
        city,
        province,
        security_company: security_company || null,
        requires_preregistration: requires_preregistration ?? true,
        added_by: user.id,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Estate already exists' }, { status: 409 })
      }
      console.error('Estate creation error:', error)
      return NextResponse.json({ error: 'Failed to add estate' }, { status: 500 })
    }

    return NextResponse.json({ estate }, { status: 201 })
  } catch (error) {
    console.error('POST /api/estates error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
