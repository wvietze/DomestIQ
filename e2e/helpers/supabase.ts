/**
 * Minimal Supabase admin helpers for E2E fixtures. Provisions and tears down a
 * disposable confirmed client account against the project's Supabase backend
 * (the same backend dev runs against), using the service-role key. Used only by
 * global setup/teardown — never imported into app code.
 */

function env() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anon || !service) {
    throw new Error(
      'E2E: missing Supabase env (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY)'
    )
  }
  return { url, anon, service }
}

function adminHeaders(json = false): Record<string, string> {
  const { service } = env()
  const h: Record<string, string> = {
    apikey: service,
    Authorization: `Bearer ${service}`,
  }
  if (json) h['Content-Type'] = 'application/json'
  return h
}

export async function deleteUser(id: string): Promise<void> {
  const { url } = env()
  await fetch(`${url}/rest/v1/profiles?id=eq.${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  })
  await fetch(`${url}/auth/v1/admin/users/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  })
}

export async function deleteUserByEmail(email: string): Promise<void> {
  const { url } = env()
  const res = await fetch(`${url}/auth/v1/admin/users?per_page=200`, {
    headers: adminHeaders(),
  })
  if (!res.ok) return
  const body = await res.json()
  const users: Array<{ id: string; email: string }> = body.users ?? body
  const match = users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
  if (match) await deleteUser(match.id)
}

/**
 * Create a confirmed client account with a `client` profile whose created_at is
 * backdated, so the onboarding gate (which only fires within 10 minutes of
 * profile creation) does not redirect the dashboard to /onboarding.
 */
export async function createConfirmedClient(
  email: string,
  password: string
): Promise<string> {
  const { url } = env()

  const userRes = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: adminHeaders(true),
    body: JSON.stringify({ email, password, email_confirm: true }),
  })
  const userBody = await userRes.json()
  if (!userRes.ok) {
    throw new Error(`E2E: create user failed: ${JSON.stringify(userBody)}`)
  }
  const id: string = userBody.id

  const profileRes = await fetch(`${url}/rest/v1/profiles`, {
    method: 'POST',
    headers: { ...adminHeaders(true), Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({
      id,
      role: 'client',
      full_name: 'E2E Tester',
      email,
      created_at: '2026-01-01T00:00:00Z',
    }),
  })
  if (!profileRes.ok) {
    throw new Error(`E2E: profile upsert failed: ${await profileRes.text()}`)
  }

  return id
}
