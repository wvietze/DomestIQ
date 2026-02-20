import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const { work_history, education, skills, languages, personal_statement } = body

    // Validate work_history entries
    if (work_history && !Array.isArray(work_history)) {
      return NextResponse.json({ error: 'work_history must be an array' }, { status: 400 })
    }

    if (education && !Array.isArray(education)) {
      return NextResponse.json({ error: 'education must be an array' }, { status: 400 })
    }

    if (skills && !Array.isArray(skills)) {
      return NextResponse.json({ error: 'skills must be an array' }, { status: 400 })
    }

    if (languages && !Array.isArray(languages)) {
      return NextResponse.json({ error: 'languages must be an array' }, { status: 400 })
    }

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
