import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendPushToUser } from '@/lib/push/send'

/**
 * POST /api/notifications/send
 * Send a push notification to a user. Requires authentication.
 * Body: { userId, title, body, url?, tag? }
 *
 * In production, restrict this to admin/system calls.
 * For now it's auth-gated so only logged-in users can trigger.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, title, body, url, tag } = await request.json()

    if (!userId || !title || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, body' },
        { status: 400 }
      )
    }

    const result = await sendPushToUser(userId, { title, body, url, tag })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('POST /api/notifications/send error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
