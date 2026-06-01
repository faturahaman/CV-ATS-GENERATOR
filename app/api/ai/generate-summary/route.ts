import { NextRequest, NextResponse } from 'next/server'
import { callOpenRouter } from '@/lib/openrouter'
import { cleanAIOutput } from '@/lib/ai-output-cleaner'
import {
  validateLanguage,
  validateString,
  validateSkillsArray,
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

    const skills = validateSkillsArray(body.skills)
    if (!skills) {
      return NextResponse.json({ error: `Missing or invalid skills (must be a non-empty array of strings, max ${INPUT_LIMITS.SKILLS_ARRAY_LENGTH} items)` }, { status: 400 })
    }

    const safeJobTitle = sanitiseForPrompt(jobTitle)
    const safeSkills = skills.map(sanitiseForPrompt)

    const prompt = `You are an elite ATS resume writer and career strategist.
Create a Professional Summary for a resume.

INPUT
Job Title: ${safeJobTitle}
Skills: ${safeSkills.join(', ')}
Language: ${language}

Requirements:
- ATS-friendly writing
- Include relevant industry keywords naturally
- Include both hard skills and soft skills
- Focus on achievements, value, and impact
- Sound credible and realistic
- Keep concise and recruiter-friendly
- 3-5 sentences only
- 50-120 words
- Do not use first person pronouns

Avoid these buzzwords:
hardworking, motivated individual, passionate professional, results-oriented professional, team player, dynamic professional, highly dedicated

Do not exaggerate experience.
Do not invent certifications.
Do not invent companies.

CRITICAL OUTPUT RULES:
- Return plain text only
- No markdown
- No headings
- No bold
- No italics
- No bullet points
- No numbering
- No code blocks
- No quotation marks

Return only the summary content.`

    const raw = await callOpenRouter(prompt, { temperature: 0.7, maxTokens: 300 })
    const summary = cleanAIOutput(raw)

    return NextResponse.json({ summary })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(genericErrorBody(message), { status: 500 })
  }
}
