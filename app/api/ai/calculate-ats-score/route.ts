import { NextRequest, NextResponse } from 'next/server'
import { callOpenRouter } from '@/lib/openrouter'
import type { Resume } from '@/types/resume'

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

function buildResumeText(resume: Resume): string {
  const lines: string[] = []

  lines.push(`Name: ${resume.personalDetails.fullName || ''}`)
  lines.push(`Email: ${resume.personalDetails.email || ''}`)
  lines.push(`Phone: ${resume.personalDetails.phoneNumber || ''}`)
  lines.push(`Job Target: ${resume.personalDetails.jobTarget || ''}`)
  lines.push(`Country: ${resume.personalDetails.country || ''}`)
  if (resume.personalDetails.linkedinUrl) lines.push(`LinkedIn: ${resume.personalDetails.linkedinUrl}`)
  if (resume.personalDetails.githubUrl) lines.push(`GitHub: ${resume.personalDetails.githubUrl}`)

  if (resume.professionalSummary) {
    lines.push(`\nProfessional Summary:\n${resume.professionalSummary}`)
  }

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

  if (resume.skills.length > 0) {
    lines.push(`\nSkills: ${resume.skills.map((s) => s.name).join(', ')}`)
  }

  if (resume.certifications.length > 0) {
    lines.push('\nCertifications:')
    for (const cert of resume.certifications) {
      lines.push(`- ${cert.certificationName} by ${cert.issuingOrganization} (${cert.issueDate})`)
    }
  }

  return lines.join('\n')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { resume, language } = body as { resume: Resume; language: 'EN' | 'ID' }

    if (!resume || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: resume, language' },
        { status: 400 }
      )
    }

    const resumeText = buildResumeText(resume)

    const prompt = `Analyze this CV for ATS (Applicant Tracking System) compatibility and provide a detailed score.

CV Content:
${resumeText}

Evaluate the CV across these 7 categories and provide scores (0-100 each):
1. contactInfo - Completeness of contact information (name, email, phone, location, LinkedIn)
2. summary - Quality and ATS-friendliness of professional summary
3. experience - Quality, quantity, and ATS-friendliness of work experience
4. education - Completeness and relevance of education section
5. skills - Relevance and quantity of skills listed
6. certifications - Presence and relevance of certifications
7. formatting - ATS-friendly formatting (single column, no images, standard fonts, clear sections)

Also provide:
- topIssues: Array of 3-5 most critical issues hurting the ATS score
- quickWins: Array of 3-5 quick improvements that would boost the score

Return ONLY a valid JSON object, no markdown fences, no explanation:
{
  "score": <overall score 0-100>,
  "breakdown": {
    "contactInfo": <0-100>,
    "summary": <0-100>,
    "experience": <0-100>,
    "education": <0-100>,
    "skills": <0-100>,
    "certifications": <0-100>,
    "formatting": <0-100>
  },
  "topIssues": ["issue1", "issue2", "issue3"],
  "quickWins": ["win1", "win2", "win3"]
}

Language for issues and quickWins text: ${language}`

    const rawText = await callOpenRouter(prompt, { temperature: 0.2, maxTokens: 1024 })

    let result: ATSScoreResult
    try {
      const cleaned = rawText.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim()
      result = JSON.parse(cleaned)
    } catch {
      console.error('Failed to parse ATS score JSON:', rawText)
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      )
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
    console.error('Error in calculate-ats-score route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
