import { NextRequest, NextResponse } from 'next/server'
import { callOpenRouter } from '@/lib/openrouter'
import { ResumeSchema } from '@/lib/validations'
import {
  validateLanguage,
  genericErrorBody,
  INPUT_LIMITS,
} from '@/lib/api-validation'

interface ATSScoreBreakdown {
  contactInfo: number
  summary: number
  experience: number
  education: number
  skills: number
  certifications: number
  formatting: number
}

interface ATSScoreResult {
  score: number
  breakdown: ATSScoreBreakdown
  topIssues: string[]
  quickWins: string[]
}

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

    if (!body.resume || typeof body.resume !== 'object') {
      return NextResponse.json({ error: 'Missing required field: resume' }, { status: 400 })
    }

    const resumeJson = JSON.stringify(body.resume)
    if (resumeJson.length > INPUT_LIMITS.RESUME_JSON_BYTES) {
      return NextResponse.json({ error: `Resume payload too large (max ${INPUT_LIMITS.RESUME_JSON_BYTES} bytes)` }, { status: 413 })
    }

    const resumeRaw = {
      ...body.resume,
      createdAt: new Date(body.resume.createdAt),
      updatedAt: new Date(body.resume.updatedAt),
    }
    const parseResult = ResumeSchema.safeParse(resumeRaw)
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid resume data' }, { status: 400 })
    }

    const resume = parseResult.data

    // Build plain-text resume for the prompt
    const lines: string[] = []
    lines.push(`Name: ${resume.personalDetails.fullName}`)
    lines.push(`Email: ${resume.personalDetails.email}`)
    lines.push(`Phone: ${resume.personalDetails.phoneNumber}`)
    lines.push(`Job Target: ${resume.personalDetails.jobTarget}`)
    lines.push(`Country: ${resume.personalDetails.country}`)
    if (resume.personalDetails.linkedinUrl) lines.push(`LinkedIn: ${resume.personalDetails.linkedinUrl}`)
    if (resume.personalDetails.githubUrl) lines.push(`GitHub: ${resume.personalDetails.githubUrl}`)
    if (resume.professionalSummary) lines.push(`\nProfessional Summary:\n${resume.professionalSummary}`)
    if (resume.experience.length > 0) {
      lines.push('\nWork Experience:')
      for (const exp of resume.experience) {
        lines.push(`- ${exp.jobTitle} at ${exp.companyName} (${exp.startDate} - ${exp.endDate})`)
        if (exp.description) lines.push(`  ${exp.description}`)
      }
    }
    if (resume.education.length > 0) {
      lines.push('\nEducation:')
      for (const edu of resume.education) {
        lines.push(`- ${edu.degree} in ${edu.fieldOfStudy} at ${edu.schoolName} (${edu.graduationDate})`)
        if (edu.description) lines.push(`  ${edu.description}`)
      }
    }
    if (resume.skills.length > 0) lines.push(`\nSkills: ${resume.skills.map((s) => s.name).join(', ')}`)
    if (resume.certifications.length > 0) {
      lines.push('\nCertifications:')
      for (const cert of resume.certifications) {
        lines.push(`- ${cert.certificationName} by ${cert.issuingOrganization} (${cert.issueDate})`)
      }
    }
    const resumeText = lines.join('\n')

    const prompt = `You are an ATS resume reviewer.
Analyze the resume below using modern ATS best practices.

RESUME:
${resumeText}

Language for output text: ${language}

Evaluate across these 7 categories (score 0-100 each):
1. contactInfo — name, email, phone, location, LinkedIn presence
2. summary — ATS keyword relevance, clarity, no buzzwords
3. experience — quantified achievements, action verbs, XYZ formula usage
4. education — completeness, relevance
5. skills — ATS keyword coverage, hard + soft skills balance
6. certifications — presence and relevance
7. formatting — single column, no images, standard structure

Scoring Rules:
REWARD:
- LinkedIn profile present
- Quantified achievements with metrics
- ATS keywords naturally used
- Strong action verbs (increased, reduced, implemented, delivered)
- Clear accomplishments

PENALIZE:
- Missing LinkedIn
- Missing metrics or quantified results
- Buzzwords (hardworking, passionate, team player, motivated)
- Generic language without specifics
- Weak achievement statements (responsible for, helped with)
- Missing contact information

Also provide:
- topIssues: 3-5 most critical issues hurting the ATS score
- quickWins: 3-5 quick improvements that would boost the score immediately

Return ONLY valid JSON. No markdown. No explanations. No additional text. Only JSON:
{
  "score": 0,
  "breakdown": {
    "contactInfo": 0,
    "summary": 0,
    "experience": 0,
    "education": 0,
    "skills": 0,
    "certifications": 0,
    "formatting": 0
  },
  "topIssues": [],
  "quickWins": []
}`

    const rawText = await callOpenRouter(prompt, { temperature: 0.2, maxTokens: 1024 })

    let result: ATSScoreResult
    try {
      const cleaned = rawText.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim()
      result = JSON.parse(cleaned)
    } catch {
      console.error('Failed to parse ATS score JSON:', rawText)
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n ?? 0)))

    return NextResponse.json({
      score: clamp(result.score),
      breakdown: {
        contactInfo: clamp(result.breakdown?.contactInfo),
        summary: clamp(result.breakdown?.summary),
        experience: clamp(result.breakdown?.experience),
        education: clamp(result.breakdown?.education),
        skills: clamp(result.breakdown?.skills),
        certifications: clamp(result.breakdown?.certifications),
        formatting: clamp(result.breakdown?.formatting),
      },
      topIssues: Array.isArray(result.topIssues) ? result.topIssues : [],
      quickWins: Array.isArray(result.quickWins) ? result.quickWins : [],
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(genericErrorBody(message), { status: 500 })
  }
}
