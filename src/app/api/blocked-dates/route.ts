import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const workerId = searchParams.get('worker_id')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if (!workerId) {
    return NextResponse.json({ error: 'worker_id is required' }, { status: 400 })
  }

  // Look up worker_profiles.id from user_id
  const { data: wp } = await supabase
    .from('worker_profiles')
    .select('id')
    .eq('user_id', workerId)
    .single()

  if (!wp) {
    return NextResponse.json({ blocked_dates: [] })
  }

  let query = supabase
    .from('worker_blocked_dates')
    .select('id, blocked_date, reason')
    .eq('worker_id', wp.id)
    .order('blocked_date', { ascending: true })

  if (from) query = query.gte('blocked_date', from)
  if (to) query = query.lte('blocked_date', to)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ blocked_dates: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { blocked_date, reason } = await request.json()

  if (!blocked_date) {
    return NextResponse.json({ error: 'blocked_date is required' }, { status: 400 })
  }

  // Get worker profile id
  const { data: wp } = await supabase
    .from('worker_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!wp) {
    return NextResponse.json({ error: 'Worker profile not found' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('worker_blocked_dates')
    .upsert(
      { worker_id: wp.id, blocked_date, reason: reason || null },
      { onConflict: 'worker_id,blocked_date' }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ blocked_date: data })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { blocked_date } = await request.json()

  if (!blocked_date) {
    return NextResponse.json({ error: 'blocked_date is required' }, { status: 400 })
  }

  // Get worker profile id
  const { data: wp } = await supabase
    .from('worker_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!wp) {
    return NextResponse.json({ error: 'Worker profile not found' }, { status: 404 })
  }

  const { error } = await supabase
    .from('worker_blocked_dates')
    .delete()
    .eq('worker_id', wp.id)
    .eq('blocked_date', blocked_date)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
