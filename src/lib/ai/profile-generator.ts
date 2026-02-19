import { askClaude } from './claude'

interface ProfileGenerateInput {
  name: string
  services: string[]
  experience?: string
  language?: string
}

interface ProfileGenerateResult {
  bio: string
  bioTranslated?: string
}

/**
 * Generate a professional bio for a domestic worker using Claude.
 *
 * Optionally translates the bio if a non-English language is specified.
 */
export async function generateWorkerBio(
  input: ProfileGenerateInput
): Promise<ProfileGenerateResult> {
  const { name, services, experience, language } = input

  const servicesList = services.join(', ')
  const experienceNote = experience
    ? `They have the following experience: ${experience}.`
    : ''

  const bio = await askClaude({
    system:
      'Generate a short, professional bio (2-3 sentences) for a domestic worker in South Africa. Be warm and professional. Use simple, clear language.',
    prompt: `Name: ${name}\nServices offered: ${servicesList}\n${experienceNote}`,
    model: 'claude-haiku-4-5-20251001',
    maxTokens: 512,
  })

  const result: ProfileGenerateResult = { bio }

  // If a non-English language is requested, translate the bio
  if (language && language.toLowerCase() !== 'english') {
    const bioTranslated = await askClaude({
      system: `You are a translator. Translate the following text to ${language}. Return ONLY the translated text, nothing else.`,
      prompt: bio,
      model: 'claude-haiku-4-5-20251001',
      maxTokens: 512,
    })
    result.bioTranslated = bioTranslated
  }

  return result
}
