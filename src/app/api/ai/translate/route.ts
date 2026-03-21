import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { translateText } from '@/lib/ai/translate'
import { translateSchema, parseBody } from '@/lib/validations/api'

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
    const parsed = parseBody(translateSchema, body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const { text, targetLanguage, sourceLanguage } = parsed.data

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
