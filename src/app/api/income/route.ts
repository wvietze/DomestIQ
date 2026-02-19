import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Fetch worker's earnings summary and income statements
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user is a worker
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'worker') {
      return NextResponse.json({ error: 'Workers only' }, { status: 403 })
    }

    const period = request.nextUrl.searchParams.get('period') || 'all'

    // Get completed transactions for this worker
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('worker_id', user.id)
      .eq('status', 'completed')
      .order('paid_at', { ascending: false })

    // Apply date filter
    if (period === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      query = query.gte('paid_at', weekAgo.toISOString())
    } else if (period === 'month') {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      query = query.gte('paid_at', monthAgo.toISOString())
    } else if (period === 'year') {
      const yearAgo = new Date()
      yearAgo.setFullYear(yearAgo.getFullYear() - 1)
      query = query.gte('paid_at', yearAgo.toISOString())
    }

    const { data: transactions } = await query

    const totalEarnings = (transactions || []).reduce(
      (sum, t) => sum + Number(t.worker_amount),
      0
    )
    const totalBookings = (transactions || []).length
    const avgBookingValue = totalBookings > 0 ? totalEarnings / totalBookings : 0

    // Get income statements
    const { data: statements } = await supabase
      .from('income_statements')
      .select('*')
      .eq('worker_id', user.id)
      .order('period_start', { ascending: false })
      .limit(12)

    return NextResponse.json({
      summary: {
        total_earnings: totalEarnings,
        total_bookings: totalBookings,
        avg_booking_value: avgBookingValue,
        currency: 'ZAR',
      },
      transactions: (transactions || []).slice(0, 50),
      statements: statements || [],
    })
  } catch (error) {
    console.error('Income fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Generate income statement for a specific month
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { month } = body // Expected: 'YYYY-MM-DD' (first of month)

    if (!month) {
      return NextResponse.json(
        { error: 'month is required (YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    // Call the database function to generate/update statement
    const { data, error } = await supabase.rpc('generate_income_statement', {
      p_worker_id: user.id,
      p_month: month,
    })

    if (error) {
      console.error('Income statement generation error:', error)
      return NextResponse.json(
        { error: 'Failed to generate statement' },
        { status: 500 }
      )
    }

    return NextResponse.json({ statement_id: data })
  } catch (error) {
    console.error('Income statement error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
