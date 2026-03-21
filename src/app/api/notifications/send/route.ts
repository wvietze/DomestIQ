import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendNotificationSchema, parseBody } from '@/lib/validations/api'

// Force Node.js runtime (web-push needs crypto/http)
export const runtime = 'nodejs'

/**
 * POST /api/notifications/send
 * Send a push notification to a user. Requires authentication.
 * Body: { userId, title, body, url?, tag? }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rawBody = await request.json()
    const parsed = parseBody(sendNotificationSchema, rawBody)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const { userId, title, body, url, tag } = parsed.data

    // Only allow sending notifications to yourself (system notifications use internal calls)
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Can only send notifications to yourself' },
        { status: 403 }
      )
    }

    // Dynamic import to avoid bundling web-push at build time
    const { sendPushToUser } = await import('@/lib/push/send')
    const result = await sendPushToUser(userId, { title, body, url, tag })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('POST /api/notifications/send error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
