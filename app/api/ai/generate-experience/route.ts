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

    const jobContext = validateString(body.jobContext, INPUT_LIMITS.JOB_CONTEXT)
    if (!jobContext) {
      return NextResponse.json({ error: `Missing or invalid jobContext (max ${INPUT_LIMITS.JOB_CONTEXT} characters)` }, { status: 400 })
    }

    const safeJobContext = sanitiseForPrompt(jobContext)

    const prompt = `You are an ATS resume expert.
Generate resume achievement bullets.

INPUT
${safeJobContext}

Language: ${language}

Requirements:
- Generate 4-6 achievement bullets
- Every bullet must start with a strong action verb
- Every bullet must include measurable impact
- Include metrics whenever possible
- Follow XYZ Formula: Accomplished X as measured by Y by doing Z
- Maximum Character 4 point and make sure it the word is dense and also containd 

Good examples:
Increased application performance by 35% through code splitting and lazy loading.
Reduced deployment time by 50% by implementing CI/CD automation.
Improved API response speed by 25% through database query optimization.


Include:
- technical skills
- business impact
- ownership
- collaboration

Avoid:
- responsible for
- worked on
- helped with
- involved in
- assisted with

CRITICAL OUTPUT RULES:
- Plain text only
- One bullet per line
- No markdown
- No asterisks
- No numbering
- No headings
- No explanations
- No bullet prefixes (no -, •, *)

Return only achievement statements.`

    const raw = await callOpenRouter(prompt, { temperature: 0.7, maxTokens: 600 })
    const cleaned = cleanAIOutput(raw)

    // Split into array of non-empty lines
    const bulletPoints = cleaned
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    return NextResponse.json({ bulletPoints })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(genericErrorBody(message), { status: 500 })
  }
}
