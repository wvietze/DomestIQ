import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWorkerBio } from '@/lib/ai/profile-generator'

/**
 * POST /api/ai/profile-generate
 * Generate a professional bio for a worker.
 * Body: { name: string, services: string[], experience?: string, language?: string }
 *
 * Uses Claude API to generate a warm, professional bio (2-3 sentences).
 * If a non-English language is specified, also translates the bio.
 * Returns: { bio: string, bioTranslated?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, services, experience, language } = body

    if (!name || !services) {
      return NextResponse.json(
        { error: 'Missing required fields: name, services' },
        { status: 400 }
      )
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name must be a non-empty string' },
        { status: 400 }
      )
    }

    if (!Array.isArray(services) || services.length === 0) {
      return NextResponse.json(
        { error: 'Services must be a non-empty array of strings' },
        { status: 400 }
      )
    }

    const result = await generateWorkerBio({
      name,
      services,
      experience,
      language,
    })

    return NextResponse.json({
      bio: result.bio,
      ...(result.bioTranslated && { bioTranslated: result.bioTranslated }),
    })
  } catch (error) {
    console.error('POST /api/ai/profile-generate error:', error)
    return NextResponse.json(
      { error: 'Bio generation failed' },
      { status: 500 }
    )
  }
}
