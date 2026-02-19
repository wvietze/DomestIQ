import Anthropic from '@anthropic-ai/sdk'

let client: Anthropic | null = null

export function getClaudeClient() {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  }
  return client
}

export async function askClaude(options: {
  system?: string
  prompt: string
  maxTokens?: number
  model?: string
}): Promise<string> {
  const claude = getClaudeClient()
  const response = await claude.messages.create({
    model: options.model || 'claude-haiku-4-5-20251001',
    max_tokens: options.maxTokens || 1024,
    system: options.system,
    messages: [{ role: 'user', content: options.prompt }],
  })
  const block = response.content[0]
  return block.type === 'text' ? block.text : ''
}
