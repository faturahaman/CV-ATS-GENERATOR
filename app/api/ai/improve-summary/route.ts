import { NextRequest, NextResponse } from 'next/server'
import { callOpenRouter } from '@/lib/openrouter'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { summary, language } = body

    if (!summary || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: summary, language' },
        { status: 400 }
      )
    }

    const prompt = `Improve this CV summary to be more compelling and ATS-friendly: "${summary}". Keep it between 50-100 words. Return only the improved summary text, no extra explanation. Language: ${language}`

    const improvedSummary = await callOpenRouter(prompt, { temperature: 0.7, maxTokens: 300 })

    return NextResponse.json({ improvedSummary })
  } catch (error) {
    console.error('Error in improve-summary route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
