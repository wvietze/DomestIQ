import { createAdminClient } from '@/lib/supabase/admin'

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
  actions?: { action: string; title: string }[]
}

/**
 * Lazily load and configure web-push (Node.js only, heavy crypto deps)
 */
async function getWebPush() {
  const webPush = await import('web-push')
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
  const privateKey = process.env.VAPID_PRIVATE_KEY || ''
  if (publicKey && privateKey) {
    webPush.setVapidDetails('mailto:support@domestiq.co.za', publicKey, privateKey)
  }
  return { webPush, configured: !!(publicKey && privateKey) }
}

/**
 * Send a push notification to a specific user (all their devices)
 */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  const { webPush, configured } = await getWebPush()

  if (!configured) {
    console.warn('VAPID keys not configured — skipping push notification')
    return { sent: 0, failed: 0 }
  }

  const supabase = createAdminClient()

  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (error || !subscriptions?.length) {
    return { sent: 0, failed: 0 }
  }

  let sent = 0
  let failed = 0
  const staleIds: string[] = []

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        )
        sent++
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode
        // 404 or 410 = subscription expired/invalid — clean up
        if (statusCode === 404 || statusCode === 410) {
          staleIds.push(sub.id)
        }
        failed++
      }
    })
  )

  // Clean up stale subscriptions
  if (staleIds.length > 0) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .in('id', staleIds)
  }

  return { sent, failed }
}

/**
 * Send a push notification to multiple users
 */
export async function sendPushToUsers(userIds: string[], payload: PushPayload) {
  const results = await Promise.allSettled(
    userIds.map((id) => sendPushToUser(id, payload))
  )

  return results.reduce(
    (acc, r) => {
      if (r.status === 'fulfilled') {
        acc.sent += r.value.sent
        acc.failed += r.value.failed
      }
      return acc
    },
    { sent: 0, failed: 0 }
  )
}
