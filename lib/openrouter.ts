/**
 * OpenRouter API helper
 *
 * Shared utility for calling OpenRouter's OpenAI-compatible chat completions
 * endpoint from Next.js API routes.
 *
 * Model used: deepseek/deepseek-chat (DeepSeek V3 — fast & cheap)
 * Override via OPENROUTER_MODEL env var if needed.
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const DEFAULT_MODEL = 'deepseek/deepseek-chat'

export interface OpenRouterOptions {
  temperature?: number
  maxTokens?: number
}

/**
 * Call OpenRouter and return the assistant message text.
 * Throws an Error with a descriptive message on failure.
 */
export async function callOpenRouter(
  prompt: string,
  options: OpenRouterOptions = {}
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured')
  }

  const model = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
      'X-Title': 'ATS CV Generator',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('OpenRouter API error:', errorText)
    throw new Error(`AI service error (${response.status})`)
  }

  const data = await response.json()
  const text: string | undefined = data?.choices?.[0]?.message?.content

  if (!text) {
    throw new Error('Invalid response from AI service')
  }

  return text.trim()
}
