import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { translateText } from '@/lib/ai/translate'

/**
 * POST /api/ai/translate
 * Translate text.
 * Body: { text: string, targetLanguage: string, sourceLanguage?: string }
 *
 * For English/Afrikaans: Uses Claude API.
 * For Zulu/Xhosa/Sotho: Tries VulaVula API first, falls back to Claude.
 * Returns: { translation: string, provider: string }
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

    // TODO: Add Redis-based rate limiting (Upstash) — in-memory Map doesn't work on serverless

    const body = await request.json()
    const { text, targetLanguage, sourceLanguage } = body

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields: text, targetLanguage' },
        { status: 400 }
      )
    }

    if (typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text must be a non-empty string' },
        { status: 400 }
      )
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text must be 5000 characters or fewer' },
        { status: 400 }
      )
    }

    const result = await translateText(text, targetLanguage, sourceLanguage)

    return NextResponse.json({
      translation: result.translation,
      provider: result.provider,
    })
  } catch (error) {
    console.error('POST /api/ai/translate error:', error)
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
}
