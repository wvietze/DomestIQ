import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processDocumentOcr } from '@/lib/ai/ocr'

/**
 * POST /api/ai/ocr
 * Process document image with OCR.
 * Body: { imageUrl: string }
 *
 * 1. Calls Google Cloud Vision API for DOCUMENT_TEXT_DETECTION.
 * 2. Sends raw OCR text to Claude for structured extraction of SA ID fields.
 * Returns: { rawText: string, extractedData: { full_name, id_number, date_of_birth, nationality } }
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
    const { imageUrl } = body

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing required field: imageUrl' },
        { status: 400 }
      )
    }

    if (typeof imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'imageUrl must be a string' },
        { status: 400 }
      )
    }

    // Validate it looks like a URL
    try {
      new URL(imageUrl)
    } catch {
      return NextResponse.json(
        { error: 'imageUrl must be a valid URL' },
        { status: 400 }
      )
    }

    const result = await processDocumentOcr(imageUrl)

    return NextResponse.json({
      rawText: result.rawText,
      extractedData: result.extractedData,
    })
  } catch (error) {
    console.error('POST /api/ai/ocr error:', error)

    const message =
      error instanceof Error ? error.message : 'OCR processing failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
