import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cvDataSchema, parseBody } from '@/lib/validations/api'

/**
 * GET /api/cv-data
 * Get the authenticated worker's CV data.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: cvData } = await supabase
      .from('worker_cv_data')
      .select('*')
      .eq('worker_id', user.id)
      .single()

    return NextResponse.json({ cvData: cvData || null })
  } catch (error) {
    console.error('GET /api/cv-data error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/cv-data
 * Create or update the authenticated worker's CV data.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'worker') {
      return NextResponse.json({ error: 'Only workers can manage CV data' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = parseBody(cvDataSchema, body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const { work_history, education, skills, languages, personal_statement } = parsed.data

    // Upsert CV data
    const { data: cvData, error } = await supabase
      .from('worker_cv_data')
      .upsert(
        {
          worker_id: user.id,
          work_history: work_history || [],
          education: education || [],
          skills: skills || [],
          languages: languages || [],
          personal_statement: personal_statement || null,
        },
        { onConflict: 'worker_id' }
      )
      .select()
      .single()

    if (error) {
      console.error('CV data upsert error:', error)
      return NextResponse.json({ error: 'Failed to save CV data' }, { status: 500 })
    }

    return NextResponse.json({ cvData })
  } catch (error) {
    console.error('POST /api/cv-data error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
