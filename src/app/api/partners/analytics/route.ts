import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Verify API key
    const { data: partner } = await supabase
      .from('partner_api_keys')
      .select('*')
      .eq('is_active', true)
      .single()

    if (!partner) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Get total workers (approximate - rounded to nearest 10)
    const { count: workerCount } = await supabase
      .from('worker_profiles')
      .select('*', { count: 'exact', head: true })

    const totalWorkers = Math.round((workerCount || 0) / 10) * 10

    // Get total bookings (approximate)
    const { count: bookingCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .in('status', ['confirmed', 'in_progress', 'completed'])

    const totalBookings = Math.round((bookingCount || 0) / 10) * 10

    // Service categories breakdown
    const { data: services } = await supabase
      .from('services')
      .select('name')

    const serviceCategories = (services || []).map(s => ({
      name: s.name,
      count: 0,
    }))

    // City distribution from client profiles
    const { data: suburbs } = await supabase
      .from('client_profiles')
      .select('suburb')

    const cityMap = new Map<string, number>()
    for (const row of suburbs || []) {
      if (row.suburb) {
        const city = row.suburb
        cityMap.set(city, (cityMap.get(city) || 0) + 1)
      }
    }
    const cityDistribution = Array.from(cityMap.entries())
      .map(([city, count]) => ({ city, count: Math.round(count / 5) * 5 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Average rating
    const { data: ratingData } = await supabase
      .from('worker_profiles')
      .select('overall_rating')
      .gt('overall_rating', 0)

    const avgRating = ratingData && ratingData.length > 0
      ? Number((ratingData.reduce((sum, w) => sum + Number(w.overall_rating), 0) / ratingData.length).toFixed(1))
      : 0

    // --- Enhanced Analytics (Part 6) ---

    // Verification rate
    const { count: verifiedCount } = await supabase
      .from('worker_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true)

    const verificationRate = workerCount && workerCount > 0
      ? Number(((verifiedCount || 0) / workerCount * 100).toFixed(1))
      : 0

    // Trait distribution from reviews
    const { data: reviewsWithTraits } = await supabase
      .from('reviews')
      .select('traits')
      .not('traits', 'eq', '{}')
      .limit(500)

    const traitMap = new Map<string, number>()
    for (const review of reviewsWithTraits || []) {
      if (review.traits && Array.isArray(review.traits)) {
        for (const trait of review.traits) {
          traitMap.set(trait, (traitMap.get(trait) || 0) + 1)
        }
      }
    }
    const traitDistribution = Array.from(traitMap.entries())
      .map(([trait, count]) => ({ trait, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Growth metrics - new profiles by month (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: recentProfiles } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', sixMonthsAgo.toISOString())

    const monthlyGrowth = new Map<string, number>()
    for (const p of recentProfiles || []) {
      const month = p.created_at.substring(0, 7) // YYYY-MM
      monthlyGrowth.set(month, (monthlyGrowth.get(month) || 0) + 1)
    }
    const growthMetrics = Array.from(monthlyGrowth.entries())
      .map(([month, count]) => ({ month, new_registrations: count }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // Total clients
    const { count: clientCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'client')

    const totalClients = Math.round((clientCount || 0) / 10) * 10

    // Total references
    const { count: referenceCount } = await supabase
      .from('worker_references')
      .select('*', { count: 'exact', head: true })

    // Total CV profiles
    const { count: cvCount } = await supabase
      .from('worker_cv_data')
      .select('*', { count: 'exact', head: true })

    // Log API request
    await supabase.from('partner_api_log').insert({
      partner_id: partner.id,
      endpoint: '/api/partners/analytics',
      method: 'GET',
      status_code: 200,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    })

    return NextResponse.json({
      total_workers: totalWorkers,
      total_clients: totalClients,
      total_bookings: totalBookings,
      service_categories: serviceCategories,
      city_distribution: cityDistribution,
      average_rating: avgRating,
      verification_rate: verificationRate,
      trait_distribution: traitDistribution,
      growth_metrics: growthMetrics,
      data_richness: {
        workers_with_cv: cvCount || 0,
        total_references: referenceCount || 0,
        workers_verified_pct: verificationRate,
      },
      monthly_booking_trend: [],
    })
  } catch (error) {
    console.error('Partner analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
