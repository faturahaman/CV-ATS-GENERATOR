import { NextRequest, NextResponse } from 'next/server'
import { callOpenRouter } from '@/lib/openrouter'
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

    const jobTitle = validateString(body.jobTitle, INPUT_LIMITS.JOB_TITLE)
    if (!jobTitle) {
      return NextResponse.json({ error: `Missing or invalid jobTitle (max ${INPUT_LIMITS.JOB_TITLE} characters)` }, { status: 400 })
    }

    const safeJobTitle = sanitiseForPrompt(jobTitle)

    const prompt = `You are an ATS optimization expert.
Generate skills for this role.

INPUT
Job Title: ${safeJobTitle}
Language: ${language}

Requirements:
- Suggest hard skills (technical)
- Suggest soft skills (interpersonal)
- Suggest tools and technologies
- Total: 10-15 skills

Prioritize:
- ATS keywords commonly found in job descriptions
- Common recruiter requirements
- Modern industry skills

Avoid:
- duplicate skills
- outdated skills
- generic non-skills

Return valid JSON only. No markdown. No explanation. No code fences.

{"skills":["Skill1","Skill2","Skill3"]}`

    const rawText = await callOpenRouter(prompt, { temperature: 0.7, maxTokens: 400 })

    let skills: string[]
    try {
      const cleaned = rawText.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      // Accept both { skills: [] } and flat array
      skills = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.skills) ? parsed.skills : [])
      if (skills.length === 0) throw new Error('Empty skills array')
    } catch {
      // Fallback: split by comma or newline
      skills = rawText
        .split(/[,\n]/)
        .map((s: string) => s.replace(/^[-•*\d."[\]{}]\s*/g, '').replace(/["\]{}]/g, '').trim())
        .filter((s: string) => s.length > 1)
        .slice(0, 15)
    }

    return NextResponse.json({ skills })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(genericErrorBody(message), { status: 500 })
  }
}
