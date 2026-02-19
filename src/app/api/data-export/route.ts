import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/data-export
 *
 * POPIA (Protection of Personal Information Act) compliant data export endpoint.
 * Allows authenticated users to download all their personal data held by DomestIQ.
 *
 * Returns a JSON file containing every category of personal data associated with
 * the requesting user, structured into clearly labelled sections.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── 1. Fetch the user profile first (needed to determine role) ──────────

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // ── 2. Helper to safely query a table ───────────────────────────────────
    // If an individual query fails we capture the error message instead of
    // aborting the entire export. This ensures partial data is still returned.

    async function safeQuery<T>(
      label: string,
      queryFn: () => PromiseLike<{ data: T | null; error: { message: string } | null }>
    ): Promise<{ data: T | null; error: string | null }> {
      try {
        const { data, error } = await queryFn()
        if (error) {
          console.error(`Data export – ${label} query error:`, error)
          return { data: null, error: `Failed to retrieve ${label}: ${error.message}` }
        }
        return { data, error: null }
      } catch (err) {
        console.error(`Data export – ${label} exception:`, err)
        return {
          data: null,
          error: `Failed to retrieve ${label}: unexpected error`,
        }
      }
    }

    // ── 3. Parallel data collection ─────────────────────────────────────────

    const [
      workerProfileResult,
      clientProfileResult,
      workerServicesResult,
      workerAvailabilityResult,
      bookingsAsClientResult,
      bookingsAsWorkerResult,
      reviewsGivenResult,
      reviewsReceivedResult,
      messagesSentResult,
      consentRecordsResult,
      transactionsResult,
      notificationsResult,
      documentsResult,
    ] = await Promise.all([
      // Worker profile (only relevant for workers, but query safely regardless)
      safeQuery('worker_profile', () =>
        supabase
          .from('worker_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
      ),

      // Client profile
      safeQuery('client_profile', () =>
        supabase
          .from('client_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
      ),

      // Worker services with service names joined
      safeQuery('worker_services', () =>
        supabase
          .from('worker_services')
          .select('*, service:services(id, name, category)')
          .eq('worker_id', user.id)
          .order('created_at', { ascending: false })
      ),

      // Worker availability schedule
      safeQuery('worker_availability', () =>
        supabase
          .from('worker_availability')
          .select('*')
          .eq('worker_id', user.id)
          .order('day_of_week', { ascending: true })
      ),

      // Bookings where user is the client
      safeQuery('bookings_as_client', () =>
        supabase
          .from('bookings')
          .select('*')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false })
      ),

      // Bookings where user is the worker
      safeQuery('bookings_as_worker', () =>
        supabase
          .from('bookings')
          .select('*')
          .eq('worker_id', user.id)
          .order('created_at', { ascending: false })
      ),

      // Reviews given by the user
      safeQuery('reviews_given', () =>
        supabase
          .from('reviews')
          .select('*')
          .eq('reviewer_id', user.id)
          .order('created_at', { ascending: false })
      ),

      // Reviews received by the user
      safeQuery('reviews_received', () =>
        supabase
          .from('reviews')
          .select('*')
          .eq('reviewee_id', user.id)
          .order('created_at', { ascending: false })
      ),

      // Messages sent by the user only (not messages from others, for privacy)
      safeQuery('messages_sent', () =>
        supabase
          .from('messages')
          .select('*')
          .eq('sender_id', user.id)
          .order('created_at', { ascending: false })
      ),

      // All consent records
      safeQuery('consent_records', () =>
        supabase
          .from('consent_records')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ),

      // Transaction / payment history
      safeQuery('transactions', () =>
        supabase
          .from('transactions')
          .select('*')
          .or(`client_id.eq.${user.id},worker_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
      ),

      // Notifications
      safeQuery('notifications', () =>
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ),

      // Document metadata (NOT the actual files, just records)
      safeQuery('documents', () =>
        supabase
          .from('documents')
          .select('id, user_id, document_type, file_name, verification_status, verified_at, rejection_reason, created_at, updated_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ),
    ])

    // ── 4. Merge bookings from both roles into a single deduplicated list ───

    const allBookings: unknown[] = []
    const seenBookingIds = new Set<string>()

    for (const list of [bookingsAsClientResult.data, bookingsAsWorkerResult.data]) {
      if (Array.isArray(list)) {
        for (const booking of list) {
          const b = booking as { id: string }
          if (!seenBookingIds.has(b.id)) {
            seenBookingIds.add(b.id)
            allBookings.push(booking)
          }
        }
      }
    }

    // ── 5. Determine which sections are included ────────────────────────────

    const sectionsIncluded: string[] = ['profile']

    if (profile.role === 'worker' && workerProfileResult.data) {
      sectionsIncluded.push('worker_profile')
    }
    if (profile.role === 'client' && clientProfileResult.data) {
      sectionsIncluded.push('client_profile')
    }
    if (Array.isArray(workerServicesResult.data) && workerServicesResult.data.length > 0) {
      sectionsIncluded.push('services')
    }
    if (Array.isArray(workerAvailabilityResult.data) && workerAvailabilityResult.data.length > 0) {
      sectionsIncluded.push('availability')
    }
    sectionsIncluded.push('bookings')
    sectionsIncluded.push('reviews_given')
    sectionsIncluded.push('reviews_received')
    sectionsIncluded.push('messages_sent')
    sectionsIncluded.push('consent_records')
    sectionsIncluded.push('transactions')
    sectionsIncluded.push('notifications')
    sectionsIncluded.push('documents')

    // ── 6. Collect any per-section errors ───────────────────────────────────

    const errors: Record<string, string> = {}
    const resultMap: Record<string, { error: string | null }> = {
      worker_profile: workerProfileResult,
      client_profile: clientProfileResult,
      services: workerServicesResult,
      availability: workerAvailabilityResult,
      bookings_as_client: bookingsAsClientResult,
      bookings_as_worker: bookingsAsWorkerResult,
      reviews_given: reviewsGivenResult,
      reviews_received: reviewsReceivedResult,
      messages_sent: messagesSentResult,
      consent_records: consentRecordsResult,
      transactions: transactionsResult,
      notifications: notificationsResult,
      documents: documentsResult,
    }

    for (const [section, result] of Object.entries(resultMap)) {
      if (result.error) {
        errors[section] = result.error
      }
    }

    // ── 7. Build the export payload ─────────────────────────────────────────

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exportData: Record<string, any> = {
      metadata: {
        export_date: new Date().toISOString(),
        user_id: user.id,
        platform: 'DomestIQ',
        data_protection_act: 'POPIA - Protection of Personal Information Act',
        sections_included: sectionsIncluded,
        ...(Object.keys(errors).length > 0 && { section_errors: errors }),
      },
      profile: {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        role: profile.role,
        preferred_language: profile.preferred_language,
        popi_consent: profile.popi_consent,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      },
    }

    // Conditionally include role-specific profiles
    if (profile.role === 'worker' && workerProfileResult.data) {
      exportData.worker_profile = workerProfileResult.data
    }

    if (profile.role === 'client' && clientProfileResult.data) {
      exportData.client_profile = clientProfileResult.data
    }

    // Include worker-specific data if present
    if (Array.isArray(workerServicesResult.data) && workerServicesResult.data.length > 0) {
      exportData.services = workerServicesResult.data
    }

    if (Array.isArray(workerAvailabilityResult.data) && workerAvailabilityResult.data.length > 0) {
      exportData.availability = workerAvailabilityResult.data
    }

    exportData.bookings = allBookings
    exportData.reviews_given = reviewsGivenResult.data || []
    exportData.reviews_received = reviewsReceivedResult.data || []
    exportData.messages_sent = messagesSentResult.data || []
    exportData.consent_records = consentRecordsResult.data || []
    exportData.transactions = transactionsResult.data || []
    exportData.notifications = notificationsResult.data || []
    exportData.documents = documentsResult.data || []

    // ── 8. Return as a downloadable JSON file ───────────────────────────────

    const jsonString = JSON.stringify(exportData, null, 2)
    const fileName = `domestiq-data-export-${user.id}-${new Date().toISOString().split('T')[0]}.json`

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('GET /api/data-export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
