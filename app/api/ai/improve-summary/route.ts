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
Improve the writing quality of the resume summary below — without changing its underlying facts or meaning.

ORIGINAL SUMMARY:
${safeSummary}

Language: ${language}

STRICT GROUNDING RULES (highest priority):
- Use ONLY the facts, roles, skills, and claims already present in the original summary.
- Do NOT add new claims about experience, achievements, metrics, team size, scope, or impact that are not already stated or clearly implied in the original.
- Do NOT escalate the strength of existing claims beyond what the original supports (e.g. do not turn "involved in projects" into "led projects" if leadership isn't stated).
- The goal is better PHRASING of the same facts, not new or bigger facts.

Improvement requirements:
- Increase ATS keyword relevance using terms already relevant to the roles/skills mentioned
- Improve clarity, flow, and readability
- Remove buzzwords, fluff, and generic statements
- Tighten weak or vague phrasing into more precise, confident phrasing — grounded in what's already there
- Keep professional tone
- Keep concise and factual, strictly under 500 characters
- No first-person pronouns

Avoid:
- generic statements, corporate jargon, filler words
- hardworking, motivated, passionate, team player, dynamic, results-oriented, highly dedicated

CRITICAL OUTPUT RULES:
- Plain text only
- No markdown, no headings, no bold, no italics
- No bullet points, no numbering
- Return only the improved summary, nothing else`

    const raw = await callOpenRouter(prompt, { temperature: 0.7, maxTokens: 300 })
    const improvedSummary = cleanAIOutput(raw)

    return NextResponse.json({ improvedSummary })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(genericErrorBody(message), { status: 500 })
  }
}
