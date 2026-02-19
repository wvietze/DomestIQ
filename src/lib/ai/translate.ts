import { askClaude } from './claude'

const VULAVULA_API_URL =
  'https://vulavula-services.lelapa.ai/api/v1/translate/process'

// Languages that VulaVula supports natively
const VULAVULA_LANGUAGES = ['zulu', 'xhosa', 'sotho', 'zu', 'xh', 'st']

interface TranslationResult {
  translation: string
  provider: 'claude' | 'vulavula'
}

/**
 * Translate text using VulaVula API (for South African languages).
 * Returns null if the request fails so we can fall back to Claude.
 */
async function translateWithVulaVula(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string | null> {
  const apiKey = process.env.VULAVULA_API_KEY
  if (!apiKey) return null

  try {
    const response = await fetch(VULAVULA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input_text: text,
        source_lang: sourceLanguage,
        target_lang: targetLanguage,
      }),
    })

    if (!response.ok) return null

    const data = await response.json()
    return data.translation ?? data.translated_text ?? null
  } catch {
    return null
  }
}

/**
 * Translate text using Claude.
 */
async function translateWithClaude(
  text: string,
  targetLanguage: string
): Promise<string> {
  return askClaude({
    system: `You are a translator. Translate the following text to ${targetLanguage}. Return ONLY the translated text, nothing else.`,
    prompt: text,
    model: 'claude-haiku-4-5-20251001',
    maxTokens: 1024,
  })
}

/**
 * Determines whether VulaVula should be tried first based on target language.
 */
function shouldTryVulaVula(targetLanguage: string): boolean {
  return VULAVULA_LANGUAGES.some(
    (lang) => targetLanguage.toLowerCase().includes(lang)
  )
}

/**
 * Translate text, automatically selecting the best provider.
 *
 * For Zulu/Xhosa/Sotho: tries VulaVula first, falls back to Claude.
 * For English/Afrikaans and others: uses Claude directly.
 */
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<TranslationResult> {
  // For South African indigenous languages, try VulaVula first
  if (shouldTryVulaVula(targetLanguage)) {
    const vulavulaResult = await translateWithVulaVula(
      text,
      sourceLanguage || 'english',
      targetLanguage
    )
    if (vulavulaResult) {
      return { translation: vulavulaResult, provider: 'vulavula' }
    }
  }

  // Fallback (or primary for English/Afrikaans): use Claude
  const claudeResult = await translateWithClaude(text, targetLanguage)
  return { translation: claudeResult, provider: 'claude' }
}
