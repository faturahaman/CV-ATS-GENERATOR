import { NextRequest, NextResponse } from 'next/server'
import { callOpenRouter } from '@/lib/openrouter'
import { cleanAIOutput } from '@/lib/ai-output-cleaner'
import {
  validateLanguage,
  validateString,
  sanitiseForPrompt,
  genericErrorBody,
  INPUT_LIMITS,
} from '@/lib/api-validation'

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 })
  }

  try {
    const body = await request.json()

    const language = validateLanguage(body.language)
    if (!language) {
      return NextResponse.json({ error: "Invalid language. Must be 'EN' or 'ID'" }, { status: 400 })
    }

    const summary = validateString(body.summary, INPUT_LIMITS.SUMMARY)
    if (!summary) {
      return NextResponse.json({ error: `Missing or invalid summary (max ${INPUT_LIMITS.SUMMARY} characters)` }, { status: 400 })
    }

    const safeSummary = sanitiseForPrompt(summary)

    const prompt = `You are a senior ATS resume consultant.
Improve the following resume summary.

SUMMARY:
${safeSummary}

Language: ${language}

Requirements:
- Increase ATS keyword relevance
- Improve clarity and readability
- Remove buzzwords and fluff
- Add stronger value statements
- Keep professional tone
- Keep concise and factual
- Do not use first person pronouns
- max 500 character

Avoid:
- generic statements
- corporate jargon
- filler words
- hardworking, motivated, passionate, team player, dynamic

CRITICAL OUTPUT RULES:
- Plain text only
- No markdown
- No headings
- No bold
- No italics
- No bullet points
- No numbering

Return only the improved summary.`

    const raw = await callOpenRouter(prompt, { temperature: 0.7, maxTokens: 300 })
    const improvedSummary = cleanAIOutput(raw)

    return NextResponse.json({ improvedSummary })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(genericErrorBody(message), { status: 500 })
  }
}
