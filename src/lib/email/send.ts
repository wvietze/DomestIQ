/**
 * Email sending utility for DomestIQ.
 *
 * Uses the Resend API (https://resend.com) for transactional emails.
 * Set RESEND_API_KEY in your environment to enable.
 *
 * Usage:
 *   import { sendEmail } from '@/lib/email/send'
 *   await sendEmail({ to: 'user@example.com', subject: '...', html: '...' })
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const FROM_ADDRESS = process.env.EMAIL_FROM || 'DomestIQ <noreply@domestiq.co.za>'

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; id?: string }> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured — skipping email send')
    return { success: false }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        reply_to: options.replyTo,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Email send failed:', err)
      return { success: false }
    }

    const data = await res.json()
    return { success: true, id: data.id }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false }
  }
}
