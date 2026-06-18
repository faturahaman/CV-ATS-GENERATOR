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
Generate resume achievement bullets using ONLY the information provided in the input context below.

INPUT CONTEXT:
${safeJobContext}

Language: ${language}

STRICT GROUNDING RULES (highest priority):
- Use ONLY facts, numbers, scope, and outcomes that are explicitly stated or clearly implied in the input context.
- Do NOT invent metrics, percentages, ratings, follower/subscriber counts, timeframes, or outcomes that are not present in the input.
- If the input context already contains specific numbers or results, extract and highlight them clearly in the bullets.
- If the input context has NO measurable outcome for a particular point, write that bullet using clear scope and action instead — do not fabricate a number to fill the XYZ formula.
- Do not imply ownership, leadership, or scale beyond what the input supports.

Bullet writing requirements:
- Maximum 4 bullets
- Each bullet starts with a strong action verb
- Each bullet should be dense and specific — pack in the concrete details from the input (what was done, on what, for whom, with what result if stated) rather than being vague
- When a measurable outcome IS available in the input, follow the structure: Accomplished X as measured by Y by doing Z
- When no measurable outcome is available, use: strong action verb + specific scope + purpose/context

Good examples (when metrics are present in the input):
Increased application performance by 35% through code splitting and lazy loading.
Reduced deployment time by 50% by implementing CI/CD automation.

Good example (when no metric is present in the input):
Directed, wrote, and edited a short film from script to final cut, taking full creative ownership of the project.

Include where supported by the input:
- technical skills
- business impact
- ownership
- collaboration

Avoid starting bullets with:
- responsible for
- worked on
- helped with
- involved in
- assisted with

CRITICAL OUTPUT RULES:
- Plain text only
- One bullet per line
- No markdown, no asterisks, no numbering, no headings
- No bullet prefixes (no -, •, *)
- No explanations
- Return only the achievement statements, nothing else`

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
