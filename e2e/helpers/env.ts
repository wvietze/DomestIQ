import fs from 'fs'
import path from 'path'

/**
 * Playwright (unlike Next.js) does not auto-load .env.local. Parse it into
 * process.env so the E2E fixtures can reach Supabase. Existing env vars win, so
 * CI can override by exporting the values directly.
 */
export function loadEnvLocal(): void {
  const p = path.resolve(process.cwd(), '.env.local')
  if (!fs.existsSync(p)) return
  for (const rawLine of fs.readFileSync(p, 'utf8').split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let val = line.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = val
  }
}
