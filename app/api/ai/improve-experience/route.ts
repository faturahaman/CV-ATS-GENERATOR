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

    const description = validateString(body.description, INPUT_LIMITS.DESCRIPTION)
    if (!description) {
      return NextResponse.json({ error: `Missing or invalid description (max ${INPUT_LIMITS.DESCRIPTION} characters)` }, { status: 400 })
    }

    const safeDescription = sanitiseForPrompt(description)

    const prompt = `You are a professional resume writer.
Rewrite the experience section below.

DESCRIPTION:
${safeDescription}

Language: ${language}

Requirements:
- Convert weak statements into strong achievements
- Increase ATS keyword relevance
- Add measurable outcomes where appropriate (use XYZ Formula: Accomplished X as measured by Y by doing Z)
- Use strong action verbs
- max 4 points 
- Improve clarity
- Remove fluff and repetitive wording
- Keep realistic

Avoid:
- responsible for
- assisted with
- helped with
- worked on
- involved in

Prefer:
- improved, increased, reduced, optimized, implemented, developed, automated, delivered, built, launched, led, designed, architected

CRITICAL OUTPUT RULES:
- Plain text only
- One achievement per line
- No markdown
- No bold
- No headings
- No numbering
- No bullet prefixes (no -, •, *)

Return only improved achievement statements.`

    const raw = await callOpenRouter(prompt, { temperature: 0.7, maxTokens: 600 })
    const improvedDescription = cleanAIOutput(raw)

    return NextResponse.json({ improvedDescription })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(genericErrorBody(message), { status: 500 })
  }
}
