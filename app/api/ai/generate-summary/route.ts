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

const prompt = `You are an ATS resume writer.
Write a Professional Summary for a resume using ONLY the information explicitly provided below.

INPUT
Job Title: ${safeJobTitle}
Skills: ${safeSkills.join(', ')}
Language: ${language}

STRICT GROUNDING RULES (highest priority — follow these even if it makes the summary more general):
- Use ONLY the Job Title and Skills listed above as factual basis.
- Do NOT invent or imply: years/duration of experience, number of projects, specific achievements, metrics or percentages, team size, company names, industries, or certifications that are not in the input.
- Do NOT phrase anything as a completed accomplishment (e.g. "increased sales by X%", "led a team of X", "successfully delivered X projects") since no such data was provided.
- Instead, describe the candidate's professional identity and capability based on the job title and skills — framed as strengths/competencies, not as verified past results.
- It is fine to say what someone in this role with these skills is generally able to contribute, as long as it stays general and is not stated as a fact about this specific person's history.

Writing requirements:
- ATS-friendly; weave the listed skills naturally as keywords
- Blend hard skills and soft skills from the list naturally, not as a list
- Concise and recruiter-friendly, 3-5 sentences, strictly under 500 characters total
- No first-person pronouns
- Avoid these buzzwords: hardworking, motivated individual, passionate professional, results-oriented professional, team player, dynamic professional, highly dedicated
- Sound natural and credible, not generic, robotic, or templated

OUTPUT FORMAT:
- Plain text only
- No markdown, no headings, no bold, no italics
- No bullet points or numbering
- No code blocks
- No quotation marks
- Return only the summary text, nothing else`

    const raw = await callOpenRouter(prompt, { temperature: 0.7, maxTokens: 300 })
    const summary = cleanAIOutput(raw)

    return NextResponse.json({ summary })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(genericErrorBody(message), { status: 500 })
  }
}
