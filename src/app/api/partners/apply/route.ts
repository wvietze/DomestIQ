import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { partnerApplySchema, parseBody } from '@/lib/validations/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = parseBody(partnerApplySchema, body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const { company_name, contact_name, contact_email, contact_phone, company_type, interest, message, website } = parsed.data

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
