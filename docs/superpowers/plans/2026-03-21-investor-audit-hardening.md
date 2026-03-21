# DomestIQ Investor Audit Hardening — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring every API route, layout, and page up to pre-acquisition audit standard — fix all CRITICAL/HIGH/MEDIUM security and quality issues identified in the audit.

**Architecture:** Six phases executed in dependency order. Phase 1 (CRITICALs) must deploy first. Phases 2-3 (auth + security) next. Phase 4 (Zod validation) is the largest single phase. Phases 5-6 (UX + performance) are independent.

**Tech Stack:** Next.js 16, Supabase, TypeScript, Zod (already installed), crypto (Node built-in)

**Deferred (out of scope):** L1 (test framework), H6 (Supabase type regeneration), M5 (Sentry setup)

**Important:** No `Co-Authored-By` or AI attribution in any commit messages. This is commercial software.

---

## Phase 1: Stop the Bleeding (CRITICALs)

### Task 1: Kill DEV_MODE in middleware and use-user hook

**Files:**
- Modify: `src/middleware.ts:5,17`
- Modify: `src/lib/hooks/use-user.ts:10,84,90,113`

- [ ] **Step 1: Fix middleware.ts — make DEV_MODE env-driven**

Replace hardcoded `const DEV_MODE = true` with:
```typescript
const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
```

This keeps the bypass available for local dev but is `false` in production unless explicitly set.

**Deployment note:** After this change, all protected routes will require real authentication. Before deploying, confirm test accounts can log in. If the app is being actively demoed with `DEV_MODE=true`, set `NEXT_PUBLIC_DEV_MODE=true` in Vercel env vars temporarily, then remove it when ready to enforce auth.

- [ ] **Step 2: Fix use-user.ts — same env-driven pattern**

Replace line 10:
```typescript
const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: Clean build, no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/middleware.ts src/lib/hooks/use-user.ts
git commit -m "Fix: make DEV_MODE env-driven, defaults to false in production"
```

---

### Task 2: Fix partner API key validation

**Files:**
- Modify: `src/app/api/partners/verify-income/route.ts:21-27`
- Modify: `src/app/api/partners/verify-employment/route.ts:21-27`
- Modify: `src/app/api/partners/analytics/route.ts:15-21`

All three partner routes have the same bug: they query `partner_api_keys` with `.eq('is_active', true).single()` but never filter by the actual API key value.

**Verified from migration `00021_create_partner_api.sql`:** The column is `api_key_hash TEXT NOT NULL UNIQUE` — bcrypt hash of the API key. So we need to bcrypt-compare, not plain-text match.

- [ ] **Step 1: Fix verify-income — bcrypt compare against `api_key_hash`**

The table stores bcrypt hashes. We can't filter by hash in the query (bcrypt produces different hashes each time). Instead, fetch all active keys and compare:

```typescript
import bcrypt from 'bcryptjs'

// ... inside the handler, after extracting apiKey:

// Fetch all active partner keys and bcrypt-compare
const { data: partners } = await supabase
  .from('partner_api_keys')
  .select('*')
  .eq('is_active', true)

let partner = null
for (const p of partners || []) {
  if (await bcrypt.compare(apiKey, p.api_key_hash)) {
    partner = p
    break
  }
}

if (!partner) {
  return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
}
```

**Note:** If `bcryptjs` is not installed, run `npm install bcryptjs && npm install -D @types/bcryptjs`. At small partner counts (<100) this loop is fine. At scale, switch to a SHA-256 prefix lookup.

- [ ] **Step 2: Apply the same fix to verify-employment (lines 21-27)**

Same bcrypt pattern.

- [ ] **Step 3: Apply the same fix to analytics (lines 15-21)**

Same bcrypt pattern.

- [ ] **Step 4: Remove the misleading comment**

Delete `// Note: In production, hash the API key and compare with stored hash` from all three files. The code now does what it says.

- [ ] **Step 5: Verify build passes**

Run: `npm run build`

- [ ] **Step 6: Commit**

```bash
git add src/app/api/partners/verify-income/route.ts src/app/api/partners/verify-employment/route.ts src/app/api/partners/analytics/route.ts
git commit -m "Fix: validate partner API key against actual key value, not just is_active"
```

---

### Task 3: Add server-side auth to admin layout

**Files:**
- Create: `src/app/(admin)/layout-auth.tsx` (server component wrapper)
- Modify: `src/app/(admin)/layout.tsx` (rename to client-only shell)

The admin layout is currently a pure `'use client'` component with no auth. We need a server component wrapper that checks auth before rendering.

- [ ] **Step 1: Rename existing layout to admin-shell.tsx (MUST be done first)**

Rename `src/app/(admin)/layout.tsx` → `src/app/(admin)/admin-shell.tsx`. Change `export default function AdminLayout` → `export default function AdminShell`. This preserves all the sidebar/nav UI code before we create the new layout.

```bash
git mv src/app/(admin)/layout.tsx src/app/(admin)/admin-shell.tsx
```

Then in `admin-shell.tsx`, change the export name:
```typescript
export default function AdminShell({
```

- [ ] **Step 2: Create new server-side auth layout**

Now create the new `src/app/(admin)/layout.tsx` as a server component:

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from './admin-shell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/login')
  }

  return <AdminShell>{children}</AdminShell>
}
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/app/(admin)/layout.tsx src/app/(admin)/admin-shell.tsx
git commit -m "Fix: add server-side auth check to admin layout, redirect non-admins"
```

---

### Task 4: Fix Paystack webhook timing-safe comparison

**Files:**
- Modify: `src/lib/payments/paystack.ts:204-220`

- [ ] **Step 1: Replace require with ES import and fix comparison**

Replace lines 204-220:
```typescript
import crypto from 'crypto'

// ... (earlier in file, at top level)

// Then in verifyWebhookSignature:
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) return false

  const hash = crypto
    .createHmac('sha512', secretKey)
    .update(body)
    .digest('hex')

  // Timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'utf8'),
      Buffer.from(signature, 'utf8')
    )
  } catch {
    // Lengths differ — not equal
    return false
  }
}
```

This also fixes L3 (`require('crypto')` → ES import).

- [ ] **Step 2: Check if crypto is already imported at top of file**

If there's an existing `import crypto` or `require('crypto')` elsewhere in the file, consolidate to a single top-level `import crypto from 'crypto'`.

- [ ] **Step 3: Verify build passes**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/lib/payments/paystack.ts
git commit -m "Fix: use timing-safe comparison for Paystack webhook HMAC verification"
```

---

## Phase 2: Auth & Access Control (HIGHs)

### Task 5: Protect helpdesk register endpoint

**Files:**
- Modify: `src/app/api/helpdesk/register/route.ts:4-10`

- [ ] **Step 1: Add secret header check at top of POST handler**

Add after `const body = await request.json()` (or before it, at the start of the handler):

```typescript
// Verify helpdesk secret — only authorized helpdesk terminals can register workers
const helpdeskSecret = request.headers.get('x-helpdesk-secret')
if (!helpdeskSecret || helpdeskSecret !== process.env.HELPDESK_SECRET) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

- [ ] **Step 2: Update the helpdesk page to send the secret**

Find the fetch call in `src/app/helpdesk/page.tsx` that posts to `/api/helpdesk/register` and add the header:

```typescript
headers: {
  'Content-Type': 'application/json',
  'x-helpdesk-secret': process.env.NEXT_PUBLIC_HELPDESK_SECRET || '',
},
```

**Note:** This uses a `NEXT_PUBLIC_` var because the helpdesk page is a client component. This is acceptable because the helpdesk is an internal tool — the secret prevents casual abuse, not determined attackers. For stronger protection, the helpdesk page itself should require Supabase auth login (future improvement).

- [ ] **Step 2b: Set env vars on Vercel before deploying**

Run (or set via Vercel dashboard):
```bash
vercel env add HELPDESK_SECRET production preview
vercel env add NEXT_PUBLIC_HELPDESK_SECRET production preview
```

Both should be the same random string (e.g., `openssl rand -hex 32`). Without these, the helpdesk endpoint will reject all requests after deploy.

- [ ] **Step 3: Fix the collision check (L5)**

Replace lines 33-44 in the register route. The current `listUsers({ page: 1, perPage: 1 })` doesn't check for the specific email. Remove the `while` loop's collision pre-check entirely — rely on the `createUser` error handling which already catches duplicates:

```typescript
// Remove the listUsers check (it was a no-op anyway)
// The createUser call below will fail with a duplicate error if the email exists
```

- [ ] **Step 4: Verify build passes**

Run: `npm run build`

- [ ] **Step 5: Commit**

```bash
git add src/app/api/helpdesk/register/route.ts src/app/helpdesk/page.tsx
git commit -m "Fix: add secret header auth to helpdesk register, fix collision check"
```

---

### Task 6: Restrict notification send to self-only

**Files:**
- Modify: `src/app/api/notifications/send/route.ts:22-30`

- [ ] **Step 1: Add ownership check**

After extracting `userId` from the request body, add:

```typescript
// Only allow sending notifications to yourself (system notifications use internal calls)
if (userId !== user.id) {
  return NextResponse.json(
    { error: 'Can only send notifications to yourself' },
    { status: 403 }
  )
}
```

**Note:** Internal notification sending (bookings, messages, reviews) already calls `sendPushToUser()` directly from server-side code, not through this API route. This change only affects the public endpoint.

- [ ] **Step 2: Verify build passes**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/app/api/notifications/send/route.ts
git commit -m "Fix: restrict notification send endpoint to self-only"
```

---

### Task 7: Add auth to blocked-dates GET + fix referral ownership

**Files:**
- Modify: `src/app/api/blocked-dates/route.ts:4-15`
- Modify: `src/app/api/referrals/route.ts:68-76`

- [ ] **Step 1: Add auth check to blocked-dates GET**

Add at the start of the GET handler:
```typescript
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ... rest of existing code
```

- [ ] **Step 2: Add auth + ownership check to referrals POST**

The POST handler currently accepts `referred_user_id` from the body without verifying the caller is that user. Add after auth check:

```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser()

if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// ... after extracting body:
// Verify the caller is the referred user
if (referred_user_id !== user.id) {
  return NextResponse.json(
    { error: 'Can only record referrals for yourself' },
    { status: 403 }
  )
}
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/app/api/blocked-dates/route.ts src/app/api/referrals/route.ts
git commit -m "Fix: add auth to blocked-dates GET, add ownership check to referrals POST"
```

---

## Phase 3: Security Hardening

### Task 8: Add security headers to next.config.ts

**Files:**
- Modify: `next.config.ts:22-30`

- [ ] **Step 1: Add comprehensive security headers**

Replace the `headers` function in `next.config.ts`:

```typescript
headers: async () => [
  {
    source: '/sw.js',
    headers: [
      { key: 'Service-Worker-Allowed', value: '/' },
      { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
    ],
  },
  {
    // Apply security headers to all routes
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com https://js.paystack.co",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://maps.googleapis.com https://maps.gstatic.com https://*.googleusercontent.com",
          "font-src 'self' https://fonts.gstatic.com",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://maps.googleapis.com https://api.anthropic.com",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; '),
      },
    ],
  },
],
```

**Note:** `unsafe-inline` and `unsafe-eval` for scripts are needed because Next.js injects inline scripts. The CSP can be tightened with nonces in a future iteration.

- [ ] **Step 2: Verify build passes and test locally**

Run: `npm run build`
Then: `npm run dev` — check browser console for CSP violations. Adjust domains if Google Maps or Supabase URLs are blocked.

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "Add security headers: CSP, X-Frame-Options, X-Content-Type, Referrer-Policy"
```

---

### Task 9: Remove broken in-memory rate limiter + clean up helpdesk password response

**Files:**
- Modify: `src/app/api/ai/translate/route.ts:9-27`
- Modify: `src/app/api/helpdesk/register/route.ts:195-201`

- [ ] **Step 1: Remove the in-memory rate limiter from translate route**

Delete the `rateLimitMap`, `MAX_REQUESTS_PER_MINUTE`, and `checkRateLimit` function (lines 9-27). Remove the rate limit check in the handler (lines ~57-62). Add a `TODO` comment:

```typescript
// TODO: Add Redis-based rate limiting (Upstash) — in-memory Map doesn't work on serverless
```

**Why remove instead of replace?** We don't have Upstash/Redis set up yet (deferred). A broken rate limiter that gives false confidence is worse than no rate limiter. The `TODO` marks it for the future.

- [ ] **Step 2: Audit helpdesk password response (L4)**

In `src/app/api/helpdesk/register/route.ts`, the password is returned in the response (line ~197). This is intentional — the help desk operator needs to see it to give to the worker. Add a comment making this explicit:

```typescript
// Password returned intentionally — displayed once to helpdesk operator, never stored in logs
return NextResponse.json({
  success: true,
  workerCode,
  password: customPassword || pwd,
  fullName,
  userId,
})
```

No code change needed, just the documenting comment.

- [ ] **Step 3: Verify build passes**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/app/api/ai/translate/route.ts src/app/api/helpdesk/register/route.ts
git commit -m "Remove broken in-memory rate limiter, document helpdesk password response"
```

---

## Phase 4: Input Validation (Zod on all API routes)

### Task 10: Create shared Zod schemas

**Files:**
- Create: `src/lib/validations/api.ts`

- [ ] **Step 1: Create the shared validation schemas file**

```typescript
import { z } from 'zod'

// ─── Shared primitives ───
export const uuidSchema = z.string().uuid()
export const shortString = z.string().min(1).max(500)
export const longString = z.string().min(1).max(5000)

// ─── Bookings ───
export const createBookingSchema = z.object({
  worker_id: uuidSchema,
  service_type: shortString,
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}$/),
  estimated_hours: z.number().positive().max(24),
  address: shortString,
  notes: z.string().max(2000).optional(),
  estimated_cost: z.number().positive().optional(),
})

export const updateBookingSchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'in_progress', 'completed']).optional(),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  notes: z.string().max(2000).optional(),
})

// ─── Messages ───
export const sendMessageSchema = z.object({
  conversationId: uuidSchema,
  content: shortString,
  messageType: z.enum(['text', 'image']).default('text'),
  imageUrl: z.string().url().optional(),
})

// ─── Reviews ───
export const createReviewSchema = z.object({
  booking_id: uuidSchema,
  worker_id: uuidSchema,
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
  traits: z.array(z.string().max(50)).max(10).optional(),
})

// ─── Referrals ───
export const createReferralSchema = z.object({
  referral_code: z.string().min(2).max(20),
  referred_user_id: uuidSchema,
})

// ─── Notifications ───
export const sendNotificationSchema = z.object({
  userId: uuidSchema,
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  url: z.string().max(500).optional(),
  tag: z.string().max(100).optional(),
})

// ─── Translation ───
export const translateSchema = z.object({
  text: z.string().min(1).max(5000),
  targetLanguage: z.string().min(2).max(10),
  sourceLanguage: z.string().min(2).max(10).optional(),
})

// ─── Helpdesk ───
export const helpdeskRegisterSchema = z.object({
  fullName: z.string().min(2).max(200),
  phone: z.string().max(20).optional(),
  city: z.string().min(1).max(200),
  selectedServices: z.array(z.string().max(100)).min(1),
  availableDays: z.array(z.number().int().min(0).max(6)),
  popiConsent: z.literal(true),
  avatarBase64: z.string().optional(),
  idDocBase64: z.string().optional(),
  password: z.string().min(6).max(100).optional(),
})

// ─── Blocked Dates ───
export const blockedDateSchema = z.object({
  blocked_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(500).optional(),
})

// ─── Consent ───
export const consentSchema = z.object({
  consent_type: z.string().min(1).max(100),
  consent_given: z.boolean(),
  consent_text: z.string().max(2000).optional(),
})

// ─── CV Data ───
export const cvDataSchema = z.object({
  personal_statement: z.string().max(5000).optional(),
  work_history: z.array(z.object({
    title: z.string().max(200),
    company: z.string().max(200).optional(),
    period: z.string().max(100).optional(),
    description: z.string().max(1000).optional(),
  })).optional(),
  education: z.array(z.object({
    qualification: z.string().max(200),
    institution: z.string().max(200).optional(),
    year: z.string().max(10).optional(),
  })).optional(),
  skills: z.array(z.string().max(100)).optional(),
  languages: z.array(z.string().max(50)).optional(),
})

// ─── Partner requests ───
export const partnerVerifySchema = z.object({
  worker_id: uuidSchema,
  consent_reference: uuidSchema,
})

// ─── Favorites ───
export const favoriteSchema = z.object({
  worker_id: uuidSchema,
})

// ─── Upload ───
export const uploadSchema = z.object({
  fileName: z.string().min(1).max(500),
  fileType: z.string().min(1).max(100),
  bucket: z.string().min(1).max(100),
  path: z.string().min(1).max(500),
})

// ─── Reviews request ───
export const reviewRequestSchema = z.object({
  worker_id: uuidSchema,
  booking_id: uuidSchema.optional(),
})

// ─── Reference request ───
export const referenceRequestSchema = z.object({
  referee_name: z.string().min(1).max(200),
  referee_email: z.string().email().max(300).optional(),
  referee_phone: z.string().max(20).optional(),
  relationship: z.string().max(200),
})

// ─── Worker estates ───
export const workerEstateSchema = z.object({
  estate_id: uuidSchema,
})

// ─── Payments ───
export const paymentInitializeSchema = z.object({
  booking_id: uuidSchema,
  amount: z.number().positive(),
  email: z.string().email().max(300),
})

// ─── Partner application ───
export const partnerApplySchema = z.object({
  company_name: z.string().min(1).max(300),
  contact_name: z.string().min(1).max(200),
  contact_email: z.string().email().max(300),
  use_case: z.string().min(1).max(2000),
  website: z.string().url().max(500).optional(),
})

// ─── Helper: parse and return 400 on failure ───
export function parseBody<T>(schema: z.ZodSchema<T>, data: unknown):
  { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)
  if (!result.success) {
    const firstError = result.error.errors[0]
    return {
      success: false,
      error: `Validation error: ${firstError.path.join('.')} — ${firstError.message}`,
    }
  }
  return { success: true, data: result.data }
}
```

- [ ] **Step 2: Commit the schemas file**

```bash
git add src/lib/validations/api.ts
git commit -m "Add Zod validation schemas for all API route request bodies"
```

---

### Task 11: Wire Zod validation into all API routes

**Files to modify (every route with a POST/PATCH body):**
- `src/app/api/bookings/route.ts` (POST)
- `src/app/api/bookings/[id]/route.ts` (PATCH)
- `src/app/api/messages/route.ts` (POST)
- `src/app/api/reviews/route.ts` (POST)
- `src/app/api/referrals/route.ts` (POST)
- `src/app/api/notifications/send/route.ts` (POST)
- `src/app/api/ai/translate/route.ts` (POST)
- `src/app/api/helpdesk/register/route.ts` (POST)
- `src/app/api/blocked-dates/route.ts` (POST, DELETE)
- `src/app/api/consent/route.ts` (POST)
- `src/app/api/cv-data/route.ts` (POST/PUT)
- `src/app/api/partners/verify-income/route.ts` (POST)
- `src/app/api/partners/verify-employment/route.ts` (POST)
- `src/app/api/favorites/route.ts` (POST)
- `src/app/api/upload/route.ts` (POST)
- `src/app/api/review-requests/route.ts` (POST)
- `src/app/api/reference-requests/route.ts` (POST)
- `src/app/api/references/route.ts` (POST)
- `src/app/api/worker-estates/route.ts` (POST)
- `src/app/api/payments/initialize/route.ts` (POST)
- `src/app/api/partners/apply/route.ts` (POST)

- [ ] **Step 1: Add validation to each route**

The pattern for every route is the same. Replace manual `if (!field)` checks with:

```typescript
import { parseBody, createBookingSchema } from '@/lib/validations/api'

// Inside handler:
const body = await request.json()
const parsed = parseBody(createBookingSchema, body)
if (!parsed.success) {
  return NextResponse.json({ error: parsed.error }, { status: 400 })
}
const { worker_id, service_type, ... } = parsed.data
```

Apply this pattern to every route listed above. Remove the old manual `if (!field)` checks that are now redundant.

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Fix any type mismatches between Zod schemas and existing code.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/
git commit -m "Add Zod validation to all API route request bodies"
```

---

## Phase 5: Error Handling & UX

### Task 12: Add error.tsx to every route group

**Files to create:**
- `src/app/(admin)/error.tsx`
- `src/app/(auth)/error.tsx`
- `src/app/(client)/error.tsx`
- `src/app/(worker)/error.tsx`
- `src/app/error.tsx` (root)

- [ ] **Step 1: Create a shared error component**

All error boundaries can share the same pattern. Create each `error.tsx`:

```typescript
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page error:', error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertTriangle className="h-12 w-12 text-amber-500" />
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/app/error.tsx src/app/(admin)/error.tsx src/app/(auth)/error.tsx src/app/(client)/error.tsx src/app/(worker)/error.tsx
git commit -m "Add error.tsx boundaries to all route groups"
```

---

### Task 13: Add loading.tsx to every route group

**Files to create:**
- `src/app/(admin)/loading.tsx`
- `src/app/(auth)/loading.tsx`
- `src/app/(client)/loading.tsx`
- `src/app/(worker)/loading.tsx`

- [ ] **Step 1: Create loading skeletons**

Each route group gets a tailored skeleton. Example for client/worker:

```typescript
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}
```

Adjust each skeleton to roughly match the layout of that route group (admin = sidebar + content, auth = centered card, etc.).

- [ ] **Step 2: Verify build passes**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/app/(admin)/loading.tsx src/app/(auth)/loading.tsx src/app/(client)/loading.tsx src/app/(worker)/loading.tsx
git commit -m "Add loading.tsx skeletons to all route groups"
```

---

## Phase 6: Performance & Quality

### Task 14: Fix N+1 query in messages route

**Files:**
- Modify: `src/app/api/messages/route.ts:43-67`

- [ ] **Step 1: Replace N+1 with single aggregate query**

Replace the `Promise.all` + per-conversation unread count with a single query. After fetching conversations, get all unread counts in one go:

```typescript
// Get unread counts for all conversations in one query
const conversationIds = (conversations || []).map(c => c.id)
const unreadCounts: Record<string, number> = {}

if (conversationIds.length > 0) {
  // Fetch unread messages grouped by conversation
  const { data: unreadData } = await supabase
    .from('messages')
    .select('conversation_id')
    .in('conversation_id', conversationIds)
    .neq('sender_id', user.id)
    .eq('is_read', false)

  // Count per conversation
  for (const msg of unreadData || []) {
    unreadCounts[msg.conversation_id] = (unreadCounts[msg.conversation_id] || 0) + 1
  }
}

// Map conversations (no more async)
const conversationsWithUnread = (conversations || []).map((conv) => {
  const otherParticipant =
    conv.participant_one === user.id
      ? conv.participant_two_profile
      : conv.participant_one_profile

  return {
    id: conv.id,
    bookingId: conv.booking_id,
    otherParticipant,
    lastMessageAt: conv.last_message_at,
    lastMessagePreview: conv.last_message_preview,
    unreadCount: unreadCounts[conv.id] || 0,
    createdAt: conv.created_at,
  }
})
```

This reduces N+1 queries to exactly 2 queries regardless of conversation count.

- [ ] **Step 2: Verify build passes**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/app/api/messages/route.ts
git commit -m "Fix: replace N+1 queries with single aggregate for unread counts"
```

---

### Task 15: Add pagination to partner analytics

**Files:**
- Modify: `src/app/api/partners/analytics/route.ts`

- [ ] **Step 1: Reduce unbounded queries**

The analytics route currently fetches ALL worker profiles for rating calculation and ALL reviews for trait distribution. Add limits and use count queries where possible:

- Replace `select('overall_rating').gt(...)` (fetches all rows) with a Supabase RPC or use `.limit(1000)` as a safety cap
- The trait distribution already has `.limit(500)` — acceptable
- Add `Cache-Control` header to the response since analytics data is not real-time:

```typescript
const response = NextResponse.json({ ... })
response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
return response
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/app/api/partners/analytics/route.ts
git commit -m "Add caching headers and safety limits to partner analytics"
```

---

### Task 16: Replace raw img tags with next/image where appropriate

**Files (13 locations):**
- `src/components/messaging/message-bubble.tsx:52`
- `src/components/shared/dashboard-ad.tsx:64,66`
- `src/components/shared/sponsor-badge.tsx:57`
- `src/app/(worker)/worker-profile/edit/page.tsx:693`
- `src/app/(client)/workers/[id]/page.tsx:256`

**Skip these (client-side previews from base64/blob URLs — next/image doesn't help):**
- `src/app/(auth)/register/worker/page.tsx:527` (avatar preview)
- `src/app/helpdesk/page.tsx:341,485,533` (avatar/ID previews)
- `src/components/worker/document-upload.tsx:43` (preview)
- `src/components/ai/ocr-scanner.tsx:44` (preview)
- `src/components/shared/image-upload.tsx:39` (preview)

- [ ] **Step 1: Replace DB-sourced img tags with next/image**

For each file that renders images from database URLs (Supabase storage, external URLs):

```typescript
import Image from 'next/image'

// Replace:
// <img src={url} alt="..." className="w-14 h-14 rounded-lg object-cover" />
// With:
<Image src={url} alt="..." width={56} height={56} className="rounded-lg object-cover" />
```

For images where dimensions are variable (portfolio, message attachments), use `fill` with a sized container:
```typescript
<div className="relative w-full h-full">
  <Image src={url} alt="..." fill className="object-cover rounded-xl" />
</div>
```

- [ ] **Step 2: Verify all image domains are in next.config.ts remotePatterns**

Current patterns cover `*.supabase.co` and `images.unsplash.com`. If ads/sponsors load from other domains, add those patterns.

- [ ] **Step 3: Verify build passes**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/components/ src/app/
git commit -m "Replace raw img tags with next/image for DB-sourced images"
```

---

### Task 17: Clean up any types in application code

**Files:**
- `src/lib/ai/smart-match.ts:69`
- `src/lib/maps/google-maps.ts:25,28,29,32,42,47`
- `src/components/worker/location-picker.tsx:56,70`

- [ ] **Step 1: Fix smart-match.ts**

Replace `(workers as any[])` with a proper type:
```typescript
interface WorkerMatch {
  id: string
  // ... add relevant fields
}
const topWorkers = (workers as WorkerMatch[]).slice(0, 10)
```

- [ ] **Step 2: Add Google Maps type declarations**

Create `src/lib/maps/google-maps.d.ts` or use `@types/google.maps` if installed. If not worth the dependency, create a minimal interface:

```typescript
// At top of google-maps.ts:
declare global {
  interface Window {
    google?: {
      maps: typeof google.maps
    }
  }
}
```

Replace `(window as any).google` with `window.google` using the declaration.

- [ ] **Step 3: Fix location-picker.tsx**

Replace `(c: any)` with a proper type for Google Places address components:
```typescript
interface AddressComponent {
  types: string[]
  long_name: string
  short_name: string
}
const getComp = (type: string) => components.find((c: AddressComponent) => c.types.includes(type))?.long_name
```

- [ ] **Step 4: Verify build passes**

Run: `npm run build`

- [ ] **Step 5: Commit**

```bash
git add src/lib/ai/smart-match.ts src/lib/maps/google-maps.ts src/components/worker/location-picker.tsx
git commit -m "Replace any types with proper interfaces in application code"
```

---

## Summary

| Phase | Tasks | Commits | Priority |
|-------|-------|---------|----------|
| 1: CRITICALs | 1-4 | 4 | Immediate — deploy ASAP |
| 2: Auth gaps | 5-7 | 3 | Same day as Phase 1 |
| 3: Security hardening | 8-9 | 2 | Next |
| 4: Zod validation | 10-11 | 2 | Largest phase, all API routes |
| 5: Error handling/UX | 12-13 | 2 | Independent of Phase 4 |
| 6: Performance/quality | 14-17 | 4 | Can run in parallel with Phase 5 |

**Total: 17 tasks, ~17 commits**

After all phases: run `npm run build` one final time to confirm clean build with 100 routes.
