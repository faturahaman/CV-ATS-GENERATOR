import { NextRequest, NextResponse } from 'next/server'
import { callOpenRouter } from '@/lib/openrouter'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobContext, language } = body

    if (!jobContext || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: jobContext, language' },
        { status: 400 }
      )
    }

    const prompt = `Generate 3-5 professional bullet points for this job context: ${jobContext}. Make them ATS-friendly, action-oriented, and impactful. Return as a JSON array of strings only, no markdown fences, no explanation. Language: ${language}`

    const rawText = await callOpenRouter(prompt, { temperature: 0.7, maxTokens: 600 })

    let bulletPoints: string[]
    try {
      const cleaned = rawText.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim()
      bulletPoints = JSON.parse(cleaned)
      if (!Array.isArray(bulletPoints)) throw new Error('Not an array')
    } catch {
      bulletPoints = rawText
        .split('\n')
        .map((line: string) => line.replace(/^[-•*\d.]\s*/, '').trim())
        .filter((line: string) => line.length > 0)
    }

    return NextResponse.json({ bulletPoints })
  } catch (error) {
    console.error('Error in generate-experience route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
