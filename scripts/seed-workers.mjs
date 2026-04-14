// Seed realistic dummy workers around Paarl for local/staging testing.
// Run: node --env-file=.env.local scripts/seed-workers.mjs
// Re-running wipes any existing @seed.domestiq.app accounts first.

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const SEED_DOMAIN = 'seed.domestiq.app'
const PAARL = { lat: -33.7274, lng: 18.9581 }
const VAL_DE_VIE = { lat: -33.7658, lng: 18.9784 }

// Stable portrait URLs (Unsplash free-use) — whitelisted in next.config.ts
const PORTRAITS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop',
]

// 30 workers: 60% domestic workers (18), 40% other trades (12).
// 75% of 30 = 22 assigned to Val de Vie (verified). Remaining 8 scattered
// around greater Paarl / Wellington (unverified).
const WORKERS = [
  // ── Domestic Workers — Val de Vie, verified (13) ───────────────────────
  { name: 'Thandiwe Mabaso',   services: ['Domestic Worker', 'Window Cleaner'], rate: 130, rating: 4.9, reviews: 47,
    bio: 'Experienced live-out domestic worker. Neat, reliable, and I love a clean kitchen. Long-term references from Val de Vie families.' },
  { name: 'Nomsa Khumalo',     services: ['Domestic Worker'], rate: 120, rating: 4.8, reviews: 39,
    bio: 'Domestic worker, fluent in English, isiXhosa and Afrikaans. Ironing is my specialty. Available Mon–Fri.' },
  { name: 'Zanele Mokoena',    services: ['Domestic Worker', 'Babysitter'], rate: 115, rating: 5.0, reviews: 58,
    bio: 'Full-day help with light cooking and school-run support. First-aid certified. Great with young children.' },
  { name: 'Palesa Dube',       services: ['Domestic Worker', 'Window Cleaner'], rate: 135, rating: 4.7, reviews: 24,
    bio: 'Deep-clean and window specialist. I love the before-and-after. Weekly, biweekly, or once-off.' },
  { name: 'Refilwe Mofokeng',  services: ['Domestic Worker'], rate: 125, rating: 4.9, reviews: 44,
    bio: 'Cooking, laundry, ironing — I prefer long-term placements. Trusted by families across the estate.' },
  { name: 'Lindiwe Ngcobo',    services: ['Domestic Worker'], rate: 120, rating: 4.8, reviews: 31,
    bio: 'Quiet, thorough, and punctual. Four years working in Val de Vie. Own transport from Mbekweni.' },
  { name: 'Busisiwe Zondo',    services: ['Domestic Worker'], rate: 130, rating: 4.9, reviews: 52,
    bio: 'Live-out domestic help. I treat your home like my own. Strong references available on request.' },
  { name: 'Nosipho Mthembu',   services: ['Domestic Worker', 'Babysitter'], rate: 115, rating: 4.8, reviews: 27,
    bio: 'Patient with kids and pets. I handle school pickups and light meal prep. Available three days a week.' },
  { name: 'Phumzile Ndaba',    services: ['Domestic Worker'], rate: 125, rating: 4.7, reviews: 19,
    bio: 'Full-day cleaning, laundry, and pantry tidying. Reliable and honest — I have never missed a day.' },
  { name: 'Gugu Radebe',       services: ['Domestic Worker'], rate: 140, rating: 5.0, reviews: 63,
    bio: 'Senior domestic worker with 15 years experience. I run a household properly — inventory, menus, and all.' },
  { name: 'Thembi Nhlapo',     services: ['Domestic Worker', 'Window Cleaner'], rate: 120, rating: 4.8, reviews: 35,
    bio: 'Thorough and fast. I prefer homes with clear routines. Weekdays only.' },
  { name: 'Ntombi Shabalala',  services: ['Domestic Worker'], rate: 125, rating: 4.9, reviews: 41,
    bio: 'Cleaning, ironing, and meal prep. Calm household manner. Mbekweni-based, own transport.' },
  { name: 'Beauty Mhlongo',    services: ['Domestic Worker'], rate: 115, rating: 4.7, reviews: 22,
    bio: 'Reliable twice-a-week domestic help. Detail-oriented, especially with bathrooms and kitchens.' },

  // ── Other trades — Val de Vie, verified (9) ─────────────────────────────
  { name: 'Sipho Dlamini',     services: ['Gardener'], rate: 160, rating: 4.9, reviews: 51,
    bio: 'Gardener with 12 years experience. Lawns, hedges, irrigation, seasonal planting. I bring my own tools.' },
  { name: 'Jabu Sibanyoni',    services: ['Gardener'], rate: 150, rating: 4.8, reviews: 33,
    bio: 'Full garden maintenance — edging, pruning, composting. Weekly visits on a fixed schedule.' },
  { name: 'Petrus Adams',      services: ['Gardener', 'Handyman'], rate: 170, rating: 4.9, reviews: 44,
    bio: 'Experienced gardener with small handyman skills. I manage irrigation systems and patio repairs too.' },
  { name: 'Themba Nkosi',      services: ['Painter', 'Handyman'], rate: 240, rating: 4.9, reviews: 61,
    bio: 'Painter — interior and exterior. Clean drop-sheets, honest quotes, no mess left behind.' },
  { name: 'Christo Botha',     services: ['Plumber', 'Handyman'], rate: 340, rating: 4.9, reviews: 72,
    bio: 'Qualified plumber. Geysers, leaks, blockages. Same-day call-outs across Paarl and Franschhoek.' },
  { name: 'Lerato Sithole',    services: ['Pool Cleaner'], rate: 190, rating: 4.8, reviews: 38,
    bio: 'Pool maintenance — weekly service, chemicals included. Pool-pump repairs and filter replacements.' },
  { name: 'Johan van der Merwe', services: ['Electrician', 'Handyman'], rate: 360, rating: 4.9, reviews: 67,
    bio: 'Qualified electrician. Installations, fault-finding, compliance certificates. Based in Val de Vie.' },
  { name: 'Bongani Ndlovu',    services: ['Tiler', 'Handyman'], rate: 260, rating: 4.8, reviews: 36,
    bio: 'Tiler — bathrooms, kitchens, patios. Tidy, on-time, fair pricing. Portfolio available.' },
  { name: 'Mandla Zulu',       services: ['Welder', 'Handyman'], rate: 290, rating: 4.8, reviews: 42,
    bio: 'Welder — gates, burglar bars, trailers, small repairs. MIG and stick. Mobile rig.' },

  // ── Domestic Workers — outside Val de Vie, NOT verified (5) ────────────
  { name: 'Mapule Letsoalo',   services: ['Domestic Worker'], rate: 100, rating: 4.4, reviews: 8,
    bio: 'New to the platform. Available weekdays. Detail-oriented and punctual. References available.' },
  { name: 'Sindiswa Qwabe',    services: ['Domestic Worker', 'Window Cleaner'], rate: 95, rating: 4.5, reviews: 11,
    bio: 'Part-time domestic worker, Paarl East. Ironing, light cooking, and tidying.' },
  { name: 'Ayanda Gcaba',      services: ['Domestic Worker'], rate: 105, rating: 4.3, reviews: 6,
    bio: 'Reliable and trustworthy. I work two days a week and I am looking for more clients.' },
  { name: 'Khensani Baloyi',   services: ['Domestic Worker'], rate: 100, rating: 4.6, reviews: 14,
    bio: 'Cleaning and laundry, Wellington area. Own transport. References on request.' },
  { name: 'Precious Majola',   services: ['Domestic Worker', 'Babysitter'], rate: 110, rating: 4.5, reviews: 9,
    bio: 'Good with children. I handle school runs, meals, and homework. Part-time availability.' },

  // ── Other trades — outside Val de Vie, NOT verified (3) ─────────────────
  { name: 'Vusi Mahlangu',     services: ['Gardener'], rate: 140, rating: 4.4, reviews: 7,
    bio: 'Gardener, Wellington. Lawns and hedges. Looking to build my client base.' },
  { name: 'Lucky Makhubela',   services: ['Gardener', 'Handyman'], rate: 135, rating: 4.3, reviews: 5,
    bio: 'New on DomestIQ. Garden clean-ups and small fixes. Paarl Central.' },
  { name: 'Neo Mthimkulu',     services: ['Handyman', 'Painter'], rate: 200, rating: 4.5, reviews: 10,
    bio: 'General handyman — small paint jobs, shelving, minor plumbing. Quotes within 24 hours.' },
]

// First 22 are Val de Vie verified; remaining 8 are scattered & unverified.
const VERIFIED_COUNT = 22
const OUTSIDE_AREAS = ['Paarl East', 'Paarl Central', 'Wellington', 'Paarl North', 'Paarl South', 'Mbekweni', 'Wellington', 'Paarl East']

async function wipeExisting() {
  let total = 0
  let page = 1
  // listUsers is paginated
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const seedUsers = data.users.filter((u) => u.email?.endsWith(`@${SEED_DOMAIN}`))
    for (const u of seedUsers) {
      const { error: delErr } = await admin.auth.admin.deleteUser(u.id)
      if (delErr) console.warn(`Failed to delete ${u.email}:`, delErr.message)
      else total++
    }
    if (data.users.length < 200) break
    page++
  }
  console.log(`Wiped ${total} existing seed users.`)
}

async function getServiceMap() {
  const { data, error } = await admin.from('services').select('id, name')
  if (error) throw error
  return Object.fromEntries(data.map((s) => [s.name, s.id]))
}

// Deterministic pseudo-random so re-runs produce stable jitter per index.
function jitter(index, spread) {
  const seed = Math.sin(index * 9301 + 49297) * 233280
  return ((seed - Math.floor(seed)) - 0.5) * 2 * spread
}

async function createWorker(worker, index, serviceMap) {
  const email = `seed${index + 1}@${SEED_DOMAIN}`
  const password = 'SeedPass!23'
  const isVerified = index < VERIFIED_COUNT
  const area = isVerified ? 'Val de Vie' : OUTSIDE_AREAS[(index - VERIFIED_COUNT) % OUTSIDE_AREAS.length]
  const center = isVerified ? VAL_DE_VIE : PAARL
  const spread = isVerified ? 0.008 : 0.045 // ~0.8km inside estate vs ~5km around Paarl
  const lat = center.lat + jitter(index * 2, spread)
  const lng = center.lng + jitter(index * 2 + 1, spread)

  // 1. Auth user — handle_new_user trigger creates profiles row
  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: worker.name, role: 'worker' },
  })
  if (authErr) throw new Error(`auth create failed for ${worker.name}: ${authErr.message}`)
  const userId = authData.user.id

  // 2. Update profiles row (role + avatar + phone)
  const portrait = PORTRAITS[index % PORTRAITS.length]
  const phone = `082${String(1000000 + index * 13337).slice(0, 7)}`
  const { error: profileErr } = await admin
    .from('profiles')
    .update({
      role: 'worker',
      full_name: worker.name,
      avatar_url: portrait,
      phone,
      popi_consent: true,
    })
    .eq('id', userId)
  if (profileErr) throw new Error(`profile update failed for ${worker.name}: ${profileErr.message}`)

  // 3. worker_profiles row
  const { data: workerProfile, error: wpErr } = await admin
    .from('worker_profiles')
    .insert({
      user_id: userId,
      bio: worker.bio,
      hourly_rate: worker.rate,
      overall_rating: worker.rating,
      total_reviews: worker.reviews,
      location_lat: lat,
      location_lng: lng,
      service_radius_km: isVerified ? 15 : 25,
      id_verified: isVerified,
      criminal_check_clear: isVerified,
      profile_completeness: isVerified ? 95 : 65,
      is_active: true,
    })
    .select('id')
    .single()
  if (wpErr) throw new Error(`worker_profiles insert failed for ${worker.name}: ${wpErr.message}`)
  const workerId = workerProfile.id

  // 4. worker_services — link to each named service
  const serviceRows = worker.services
    .map((name) => serviceMap[name])
    .filter(Boolean)
    .map((service_id) => ({
      worker_id: workerId,
      service_id,
      skill_level: isVerified ? 'expert' : 'intermediate',
      custom_rate: worker.rate,
      years_experience: isVerified ? 5 + (index % 10) : 1 + (index % 3),
    }))
  if (serviceRows.length) {
    const { error: svcErr } = await admin.from('worker_services').insert(serviceRows)
    if (svcErr) throw new Error(`worker_services insert failed for ${worker.name}: ${svcErr.message}`)
  }

  // 5. worker_service_areas
  const { error: areaErr } = await admin.from('worker_service_areas').insert({
    worker_id: workerId,
    area_name: area,
    center_lat: lat,
    center_lng: lng,
    radius_km: isVerified ? 15 : 25,
  })
  if (areaErr) throw new Error(`service_areas insert failed for ${worker.name}: ${areaErr.message}`)

  const badge = isVerified ? '✓ verified' : '  unverified'
  console.log(`  ${badge}  ${worker.name.padEnd(22)} ${worker.services[0].padEnd(16)} @ ${area}`)
}

async function main() {
  console.log('Wiping existing seed workers…')
  await wipeExisting()

  console.log('Fetching services…')
  const serviceMap = await getServiceMap()

  console.log(`Creating ${WORKERS.length} workers around Paarl…`)
  for (let i = 0; i < WORKERS.length; i++) {
    try {
      await createWorker(WORKERS[i], i, serviceMap)
    } catch (err) {
      console.error(`  ✗ ${WORKERS[i].name}: ${err.message}`)
    }
  }

  console.log('\nDone. Seed workers are searchable on the client-side search page.')
  console.log(`Log in as any worker:  seed1@${SEED_DOMAIN} … seed${WORKERS.length}@${SEED_DOMAIN}`)
  console.log('Password:              SeedPass!23')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
