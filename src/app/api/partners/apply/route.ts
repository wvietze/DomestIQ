import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { company_name, contact_name, contact_email, contact_phone, company_type, interest, message, website } = body

    // Validate required fields
    if (!company_name || !contact_name || !contact_email || !company_type || !interest) {
      return NextResponse.json(
        { error: 'company_name, contact_name, contact_email, company_type, and interest are required' },
        { status: 400 }
      )
    }

    // Validate company_type
    const validTypes = ['bank', 'insurer', 'micro_lender', 'sponsor', 'advertiser', 'government', 'other']
    if (!validTypes.includes(company_type)) {
      return NextResponse.json(
        { error: `company_type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate interest
    const validInterests = ['data_api', 'sponsorship', 'advertising', 'multiple']
    if (!validInterests.includes(interest)) {
      return NextResponse.json(
        { error: `interest must be one of: ${validInterests.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('partner_applications')
      .insert({
        company_name,
        contact_name,
        contact_email,
        contact_phone: contact_phone || null,
        company_type,
        interest,
        message: message || null,
        website: website || null,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Partner application insert error:', error)
      return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
    }

    return NextResponse.json({ success: true, applicationId: data.id })
  } catch (error) {
    console.error('Partner application error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
