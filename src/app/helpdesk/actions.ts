'use server'

import crypto from 'crypto'

export async function registerWorkerAction(formData: {
  fullName: string
  phone?: string | null
  city: string
  selectedServices: string[]
  availableDays: number[]
  popiConsent: boolean
  avatarBase64?: string
  idDocBase64?: string
  password?: string
}) {
  // The secret is only ever accessed server-side now — never bundled into client JS
  const secret = process.env.HELPDESK_SECRET
  if (!secret) {
    return { error: 'Helpdesk not configured' }
  }

  const vercelUrl = process.env.VERCEL_URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const baseUrl = siteUrl
    ? siteUrl
    : vercelUrl
      ? `https://${vercelUrl}`
      : 'http://localhost:3000'

  const res = await fetch(`${baseUrl}/api/helpdesk/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-helpdesk-secret': secret,
    },
    body: JSON.stringify(formData),
  })

  return res.json()
}
