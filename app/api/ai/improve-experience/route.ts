import { NextRequest, NextResponse } from 'next/server'
import { callOpenRouter } from '@/lib/openrouter'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description, language } = body

    if (!description || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: description, language' },
        { status: 400 }
      )
    }

    const prompt = `Improve these experience bullet points to be more impactful and ATS-friendly: "${description}". Return only the improved text, no extra explanation. Language: ${language}`

    const improvedDescription = await callOpenRouter(prompt, { temperature: 0.7, maxTokens: 600 })

    return NextResponse.json({ improvedDescription })
  } catch (error) {
    console.error('Error in improve-experience route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
