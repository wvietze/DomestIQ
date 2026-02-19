import { askClaude } from './claude'

interface OcrResult {
  rawText: string
  extractedData: {
    full_name: string | null
    id_number: string | null
    date_of_birth: string | null
    nationality: string | null
  }
}

/**
 * Call Google Cloud Vision API for document text detection.
 */
async function detectText(imageUrl: string): Promise<string> {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_CLOUD_VISION_API_KEY is not configured')
  }

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { source: { imageUri: imageUrl } },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          },
        ],
      }),
    }
  )

  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`Google Vision API error: ${response.status} - ${errorData}`)
  }

  const data = await response.json()
  const annotation = data.responses?.[0]?.fullTextAnnotation

  if (!annotation) {
    throw new Error('No text detected in the image')
  }

  return annotation.text
}

/**
 * Use Claude to extract structured data from raw OCR text of a South African ID document.
 */
async function extractIdFields(
  rawText: string
): Promise<OcrResult['extractedData']> {
  const result = await askClaude({
    system:
      'Extract the following fields from this South African ID document text: full_name, id_number, date_of_birth, nationality. Return as JSON.',
    prompt: rawText,
    model: 'claude-haiku-4-5-20251001',
    maxTokens: 512,
  })

  try {
    // Try to parse the JSON from Claude's response
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return {
      full_name: null,
      id_number: null,
      date_of_birth: null,
      nationality: null,
    }
  } catch {
    return {
      full_name: null,
      id_number: null,
      date_of_birth: null,
      nationality: null,
    }
  }
}

/**
 * Process a document image with OCR and extract structured ID data.
 *
 * 1. Sends the image to Google Cloud Vision for text detection.
 * 2. Sends the raw text to Claude for structured field extraction.
 */
export async function processDocumentOcr(imageUrl: string): Promise<OcrResult> {
  const rawText = await detectText(imageUrl)
  const extractedData = await extractIdFields(rawText)
  return { rawText, extractedData }
}
