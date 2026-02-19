import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { translateText } from '@/lib/ai/translate'

/**
 * Simple in-memory rate limiter.
 * Tracks requests per user per minute. Resets every 60 seconds.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const MAX_REQUESTS_PER_MINUTE = 20

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 })
    return true
  }

  if (entry.count >= MAX_REQUESTS_PER_MINUTE) {
    return false
  }

  entry.count++
  return true
}

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

    // Rate limit check
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Max 20 requests per minute.' },
        { status: 429 }
      )
    }

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
