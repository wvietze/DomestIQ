import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/notifications
 * Get notifications for authenticated user.
 * Query params: unread_only (boolean), limit (number).
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread_only') === 'true'
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '50', 10),
      200
    )

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    query = query
      .order('created_at', { ascending: false })
      .limit(limit)

    const { data: notifications, error: notifError, count } = await query

    if (notifError) {
      console.error('Notifications fetch error:', notifError)
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      notifications: notifications || [],
      total: count,
    })
  } catch (error) {
    console.error('GET /api/notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications
 * Mark notification(s) as read.
 * Body: { ids: string[] } to mark specific notifications, or { all: true } to mark all as read.
 */
export async function PATCH(request: NextRequest) {
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
    const { ids, all } = body as { ids?: string[]; all?: boolean }

    if (!ids && !all) {
      return NextResponse.json(
        { error: 'Provide either ids (string[]) or all (true)' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    if (all) {
      // Mark all unread notifications as read for the user
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: now })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (updateError) {
        console.error('Mark all read error:', updateError)
        return NextResponse.json(
          { error: 'Failed to mark notifications as read' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'All notifications marked as read',
      })
    }

    if (ids && Array.isArray(ids) && ids.length > 0) {
      // Mark specific notifications as read (only if they belong to the user)
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: now })
        .eq('user_id', user.id)
        .in('id', ids)

      if (updateError) {
        console.error('Mark specific read error:', updateError)
        return NextResponse.json(
          { error: 'Failed to mark notifications as read' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: `${ids.length} notification(s) marked as read`,
      })
    }

    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  } catch (error) {
    console.error('PATCH /api/notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
