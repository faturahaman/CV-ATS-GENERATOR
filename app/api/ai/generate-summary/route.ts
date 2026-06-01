import { NextRequest, NextResponse } from 'next/server'
import { callOpenRouter } from '@/lib/openrouter'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobTitle, skills, language } = body

    if (!jobTitle || !skills || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: jobTitle, skills, language' },
        { status: 400 }
      )
    }

    if (!Array.isArray(skills)) {
      return NextResponse.json(
        { error: 'skills must be an array' },
        { status: 400 }
      )
    }

    const prompt = `Generate a professional CV summary for a ${jobTitle} with skills: ${skills.join(', ')}. The summary should be 50-100 words, ATS-friendly, and compelling. Return only the summary text, no extra explanation. Language: ${language}`

    const summary = await callOpenRouter(prompt, { temperature: 0.7, maxTokens: 300 })

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error in generate-summary route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
