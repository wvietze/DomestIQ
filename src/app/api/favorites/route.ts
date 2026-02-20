import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('favorite_workers')
    .select(`
      id, client_id, worker_id, created_at,
      profiles!worker_id(full_name, avatar_url),
      worker_profiles!inner(hourly_rate, overall_rating, total_reviews, id_verified, criminal_check_clear, bio)
    `)
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ favorites: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { worker_id } = await request.json()

  if (!worker_id) {
    return NextResponse.json({ error: 'worker_id is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('favorite_workers')
    .upsert({ client_id: user.id, worker_id }, { onConflict: 'client_id,worker_id' })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ favorite: data })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { worker_id } = await request.json()

  if (!worker_id) {
    return NextResponse.json({ error: 'worker_id is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('favorite_workers')
    .delete()
    .eq('client_id', user.id)
    .eq('worker_id', worker_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
