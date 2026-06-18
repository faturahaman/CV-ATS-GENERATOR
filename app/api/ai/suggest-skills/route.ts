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

 const prompt = `
You are an elite ATS resume optimization expert and recruiter.

Generate the most relevant resume skills for the following role.

INPUT

Job Title:
${safeJobTitle}

Language:
${language}

Requirements:

- Generate skills commonly found in real job descriptions for this role
- Prioritize ATS keywords used by recruiters
- Prioritize skills that improve candidate-job matching
- Include a balanced mix of:
  - Hard skills
  - Soft skills
  - Tools
  - Methodologies
  - Industry-relevant competencies

- Focus on skills that increase interview potential
- Focus on modern and currently relevant skills
- Total: 10-15 skills

Guidelines:

- Infer the most likely industry and role requirements from the job title
- If the job title is vague, generic, or ambiguous, use the most common/standard interpretation rather than a narrow or unusual one
- Include role-specific competencies
- Include transferable professional skills when appropriate
- Include commonly requested recruiter keywords
- Write every skill name in ${language === 'ID' ? 'Bahasa Indonesia' : 'English'}, using the terms recruiters in that language actually use (keep widely-used English tool/technology names as-is even in Bahasa Indonesia output, e.g. "Microsoft Excel", "Git")

Avoid:

- Duplicate or near-duplicate skills
- Outdated skills
- Generic personality traits
- Buzzwords without professional value

Examples of bad output:

- Hardworking
- Dedicated
- Friendly
- Honest
- Nice Person

Examples of good output:

- Project Management
- Customer Relationship Management
- Financial Reporting
- Digital Marketing
- Data Analysis
- Communication
- Stakeholder Management
- Problem Solving

CRITICAL OUTPUT RULES:

- Return valid JSON only
- Do not return markdown
- Do not return explanations
- Do not return code fences
- Do not return headings
- Do not return additional text

Response format:

{
  "skills": [
    "Skill 1",
    "Skill 2",
    "Skill 3"
  ]
}
`

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
