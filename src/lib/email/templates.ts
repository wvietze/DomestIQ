/**
 * Email templates for DomestIQ transactional emails.
 * All templates return { subject, html } ready for sendEmail().
 */

const BRAND_COLOR = '#059669'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://domestiq-kappa.vercel.app'

function layout(content: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,-apple-system,sans-serif;">
      <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:24px;font-weight:800;color:#111827;">domest<span style="color:${BRAND_COLOR};">IQ</span></span>
        </div>
        <div style="background:white;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
          ${content}
        </div>
        <div style="text-align:center;margin-top:24px;color:#9ca3af;font-size:12px;">
          <p>DomestIQ - Trusted Domestic Workers in South Africa</p>
          <p><a href="${APP_URL}" style="color:${BRAND_COLOR};">domestiq.co.za</a></p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function welcomeWorker(name: string) {
  return {
    subject: `Welcome to DomestIQ, ${name}!`,
    html: layout(`
      <h1 style="font-size:22px;color:#111827;margin:0 0 16px;">Welcome, ${name}! 🎉</h1>
      <p style="color:#374151;line-height:1.6;">
        You're now part of DomestIQ — South Africa's growing platform for trusted domestic workers.
      </p>
      <p style="color:#374151;line-height:1.6;">Here's what to do next:</p>
      <ol style="color:#374151;line-height:1.8;">
        <li><strong>Complete your profile</strong> — add a photo, bio, and your rates</li>
        <li><strong>Upload your ID</strong> — verified workers get 3x more bookings</li>
        <li><strong>Share your referral code</strong> — earn R2 for each qualified referral</li>
      </ol>
      <div style="text-align:center;margin-top:24px;">
        <a href="${APP_URL}/worker-profile/edit" style="display:inline-block;background:${BRAND_COLOR};color:white;padding:12px 32px;border-radius:50px;text-decoration:none;font-weight:600;">
          Complete Your Profile
        </a>
      </div>
    `),
  }
}

export function welcomeClient(name: string) {
  return {
    subject: `Welcome to DomestIQ, ${name}!`,
    html: layout(`
      <h1 style="font-size:22px;color:#111827;margin:0 0 16px;">Welcome, ${name}!</h1>
      <p style="color:#374151;line-height:1.6;">
        You're ready to find trusted, ID-verified domestic workers near you.
      </p>
      <p style="color:#374151;line-height:1.6;">
        Browse workers by service type, read real reviews, and book securely — all in one place.
      </p>
      <div style="text-align:center;margin-top:24px;">
        <a href="${APP_URL}/search" style="display:inline-block;background:${BRAND_COLOR};color:white;padding:12px 32px;border-radius:50px;text-decoration:none;font-weight:600;">
          Browse Workers
        </a>
      </div>
    `),
  }
}

export function bookingConfirmation(opts: {
  clientName: string
  workerName: string
  service: string
  date: string
  time: string
  amount: string
  bookingId: string
}) {
  return {
    subject: `Booking Confirmed: ${opts.service} on ${opts.date}`,
    html: layout(`
      <h1 style="font-size:22px;color:#111827;margin:0 0 16px;">Booking Confirmed!</h1>
      <p style="color:#374151;line-height:1.6;">Hi ${opts.clientName}, your booking has been confirmed.</p>
      <div style="background:#ecfdf5;border-radius:8px;padding:16px;margin:16px 0;">
        <table style="width:100%;color:#374151;font-size:14px;">
          <tr><td style="padding:4px 0;font-weight:600;">Service</td><td>${opts.service}</td></tr>
          <tr><td style="padding:4px 0;font-weight:600;">Worker</td><td>${opts.workerName}</td></tr>
          <tr><td style="padding:4px 0;font-weight:600;">Date</td><td>${opts.date}</td></tr>
          <tr><td style="padding:4px 0;font-weight:600;">Time</td><td>${opts.time}</td></tr>
          <tr><td style="padding:4px 0;font-weight:600;">Amount</td><td>R${opts.amount}</td></tr>
        </table>
      </div>
      <div style="text-align:center;margin-top:24px;">
        <a href="${APP_URL}/bookings/${opts.bookingId}" style="display:inline-block;background:${BRAND_COLOR};color:white;padding:12px 32px;border-radius:50px;text-decoration:none;font-weight:600;">
          View Booking
        </a>
      </div>
    `),
  }
}

export function newBookingWorker(opts: {
  workerName: string
  clientName: string
  service: string
  date: string
  time: string
  bookingId: string
}) {
  return {
    subject: `New Booking Request: ${opts.service} on ${opts.date}`,
    html: layout(`
      <h1 style="font-size:22px;color:#111827;margin:0 0 16px;">New Booking Request!</h1>
      <p style="color:#374151;line-height:1.6;">Hi ${opts.workerName}, you have a new booking request.</p>
      <div style="background:#eff6ff;border-radius:8px;padding:16px;margin:16px 0;">
        <table style="width:100%;color:#374151;font-size:14px;">
          <tr><td style="padding:4px 0;font-weight:600;">Client</td><td>${opts.clientName}</td></tr>
          <tr><td style="padding:4px 0;font-weight:600;">Service</td><td>${opts.service}</td></tr>
          <tr><td style="padding:4px 0;font-weight:600;">Date</td><td>${opts.date}</td></tr>
          <tr><td style="padding:4px 0;font-weight:600;">Time</td><td>${opts.time}</td></tr>
        </table>
      </div>
      <p style="color:#374151;line-height:1.6;">Please respond within 30 minutes to keep your acceptance rate high.</p>
      <div style="text-align:center;margin-top:24px;">
        <a href="${APP_URL}/worker-bookings/${opts.bookingId}" style="display:inline-block;background:${BRAND_COLOR};color:white;padding:12px 32px;border-radius:50px;text-decoration:none;font-weight:600;">
          View & Respond
        </a>
      </div>
    `),
  }
}

export function reviewReceived(opts: {
  workerName: string
  clientName: string
  rating: number
  comment: string
}) {
  const stars = '★'.repeat(opts.rating) + '☆'.repeat(5 - opts.rating)
  return {
    subject: `New ${opts.rating}-Star Review from ${opts.clientName}`,
    html: layout(`
      <h1 style="font-size:22px;color:#111827;margin:0 0 16px;">You Got a Review!</h1>
      <p style="color:#374151;line-height:1.6;">Hi ${opts.workerName}, ${opts.clientName} left you a review.</p>
      <div style="text-align:center;margin:20px 0;">
        <span style="font-size:28px;color:#f59e0b;">${stars}</span>
      </div>
      ${opts.comment ? `<p style="color:#374151;font-style:italic;text-align:center;">"${opts.comment}"</p>` : ''}
      <div style="text-align:center;margin-top:24px;">
        <a href="${APP_URL}/worker-reviews" style="display:inline-block;background:${BRAND_COLOR};color:white;padding:12px 32px;border-radius:50px;text-decoration:none;font-weight:600;">
          View All Reviews
        </a>
      </div>
    `),
  }
}
