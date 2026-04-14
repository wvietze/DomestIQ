import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { favoriteSchema, parseBody } from '@/lib/validations/api'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // favorite_workers.worker_id references profiles(id). worker_profiles joins
  // through profiles via its own user_id FK, so the nested join has to go
  // through profiles rather than being requested as a sibling.
  const { data, error } = await supabase
    .from('favorite_workers')
    .select(`
      id, client_id, worker_id, created_at,
      profiles!worker_id(
        full_name,
        avatar_url,
        worker_profiles(
          hourly_rate, overall_rating, total_reviews, id_verified, criminal_check_clear, bio
        )
      )
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

  const rawBody = await request.json()
  const parsed = parseBody(favoriteSchema, rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }
  const { worker_id } = parsed.data

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

  const rawBody = await request.json()
  const parsed = parseBody(favoriteSchema, rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }
  const { worker_id } = parsed.data

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
