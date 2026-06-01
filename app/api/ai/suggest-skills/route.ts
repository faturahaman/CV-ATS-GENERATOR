import { NextRequest, NextResponse } from 'next/server'
import { callOpenRouter } from '@/lib/openrouter'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobTitle, language } = body

    if (!jobTitle || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: jobTitle, language' },
        { status: 400 }
      )
    }

    const prompt = `Suggest 10 relevant skills for a ${jobTitle} position. Return as a JSON array of strings only, no markdown fences, no explanation. Language: ${language}`

    const rawText = await callOpenRouter(prompt, { temperature: 0.7, maxTokens: 300 })

    let skills: string[]
    try {
      const cleaned = rawText.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim()
      skills = JSON.parse(cleaned)
      if (!Array.isArray(skills)) throw new Error('Not an array')
    } catch {
      skills = rawText
        .split(/[,\n]/)
        .map((s: string) => s.replace(/^[-•*\d.]\s*/, '').replace(/"/g, '').trim())
        .filter((s: string) => s.length > 0)
        .slice(0, 10)
    }

    return NextResponse.json({ skills })
  } catch (error) {
    console.error('Error in suggest-skills route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
