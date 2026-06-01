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
  // Content-Type guard
  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return NextResponse.json(
      { error: 'Content-Type must be application/json' },
      { status: 415 }
    )
  }

  try {
    const body = await request.json()

    // Validate language (strict allowlist)
    const language = validateLanguage(body.language)
    if (!language) {
      return NextResponse.json(
        { error: "Invalid language. Must be 'EN' or 'ID'" },
        { status: 400 }
      )
    }

    // Validate and cap description
    const description = validateString(body.description, INPUT_LIMITS.DESCRIPTION)
    if (!description) {
      return NextResponse.json(
        {
          error: `Missing or invalid description (max ${INPUT_LIMITS.DESCRIPTION} characters)`,
        },
        { status: 400 }
      )
    }

    const safeDescription = sanitiseForPrompt(description)

    const prompt = `Improve this education description to be more professional and ATS-friendly: "${safeDescription}". Return only the improved text, no extra explanation. Language: ${language}`

    const improvedDescription = await callOpenRouter(prompt, { temperature: 0.7, maxTokens: 400 })

    return NextResponse.json({ improvedDescription: cleanAIOutput(improvedDescription) })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(genericErrorBody(message), { status: 500 })
  }
}
