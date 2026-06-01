/**
 * Plain Text Export
 *
 * Generates an ATS-friendly plain text version of a resume and triggers
 * a browser download. Sections are separated by blank lines; list items
 * use a "- " prefix.
 */

import type { Resume } from '@/types/resume'

/**
 * Formats a date string (YYYY-MM-DD) or "Present" into a human-readable
 * month/year string, e.g. "Jan 2022". Falls back to the raw value if the
 * date cannot be parsed.
 */
function formatDateLabel(value: string): string {
  if (!value) return ''
  if (value === 'Present') return 'Present'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

/**
 * Returns today's date formatted as YYYY-MM-DD for use in the filename.
 */
function todayISO(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Builds the plain-text content of the resume.
 *
 * Layout:
 *   FULL NAME [LAST NAME]
 *   Job Target
 *   email | phone | country
 *   [optional links]
 *
 *   PROFESSIONAL SUMMARY
 *   <summary text>
 *
 *   WORK EXPERIENCE
 *   Job Title — Company Name (Start – End)
 *   - bullet
 *   ...
 *
 *   EDUCATION
 *   Degree in Field of Study — School (Graduation)
 *   - description
 *
 *   SKILLS
 *   - Skill (Level)
 *
 *   CERTIFICATIONS
 *   - Cert Name, Issuing Org (Issue Date[ – Expiry])
 */
function buildTextContent(resume: Resume): string {
  const lines: string[] = []
  const { personalDetails: pd } = resume

  // ── Header ──────────────────────────────────────────────────────────────
  const fullName = [pd.fullName, pd.lastName].filter(Boolean).join(' ')
  if (fullName) lines.push(fullName)
  if (pd.jobTarget) lines.push(pd.jobTarget)

  const contactParts = [pd.email, pd.phoneNumber, pd.country].filter(Boolean)
  if (contactParts.length) lines.push(contactParts.join(' | '))

  const linkParts = [
    pd.linkedinUrl && `LinkedIn: ${pd.linkedinUrl}`,
    pd.githubUrl && `GitHub: ${pd.githubUrl}`,
    pd.portfolioUrl && `Portfolio: ${pd.portfolioUrl}`,
    pd.website && `Website: ${pd.website}`,
  ].filter(Boolean) as string[]
  if (linkParts.length) lines.push(linkParts.join(' | '))

  // ── Professional Summary ─────────────────────────────────────────────────
  if (resume.professionalSummary?.trim()) {
    lines.push('')
    lines.push('PROFESSIONAL SUMMARY')
    lines.push(resume.professionalSummary.trim())
  }

  // ── Work Experience ──────────────────────────────────────────────────────
  if (resume.experience?.length) {
    lines.push('')
    lines.push('WORK EXPERIENCE')
    for (const exp of resume.experience) {
      const start = formatDateLabel(exp.startDate)
      const end = formatDateLabel(exp.endDate)
      const dateRange = [start, end].filter(Boolean).join(' - ')
      const heading = [
        exp.jobTitle,
        exp.companyName ? `— ${exp.companyName}` : '',
        dateRange ? `(${dateRange})` : '',
      ]
        .filter(Boolean)
        .join(' ')
      lines.push(heading)

      if (exp.description?.trim()) {
        // Split on newlines so existing bullet-point text is preserved
        const descLines = exp.description
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
        for (const dl of descLines) {
          lines.push(dl.startsWith('-') ? dl : `- ${dl}`)
        }
      }
    }
  }

  // ── Education ────────────────────────────────────────────────────────────
  if (resume.education?.length) {
    lines.push('')
    lines.push('EDUCATION')
    for (const edu of resume.education) {
      const grad = formatDateLabel(edu.graduationDate)
      const degreeField = [edu.degree, edu.fieldOfStudy]
        .filter(Boolean)
        .join(' in ')
      const heading = [
        degreeField,
        edu.schoolName ? `— ${edu.schoolName}` : '',
        grad ? `(${grad})` : '',
      ]
        .filter(Boolean)
        .join(' ')
      lines.push(heading)

      if (edu.description?.trim()) {
        const descLines = edu.description
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
        for (const dl of descLines) {
          lines.push(dl.startsWith('-') ? dl : `- ${dl}`)
        }
      }
    }
  }

  // ── Skills ───────────────────────────────────────────────────────────────
  if (resume.skills?.length) {
    lines.push('')
    lines.push('SKILLS')
    for (const skill of resume.skills) {
      const label = skill.level ? `${skill.name} (${skill.level})` : skill.name
      lines.push(`- ${label}`)
    }
  }

  // ── Certifications ───────────────────────────────────────────────────────
  if (resume.certifications?.length) {
    lines.push('')
    lines.push('CERTIFICATIONS')
    for (const cert of resume.certifications) {
      const issue = formatDateLabel(cert.issueDate)
      const expiry = cert.expirationDate
        ? formatDateLabel(cert.expirationDate)
        : ''
      const dateRange = expiry ? `${issue} - ${expiry}` : issue
      const parts = [
        cert.certificationName,
        cert.issuingOrganization,
        dateRange ? `(${dateRange})` : '',
      ].filter(Boolean)
      lines.push(`- ${parts.join(', ')}`)
    }
  }

  return lines.join('\n')
}

/**
 * Exports the resume as a plain text file and triggers a browser download.
 *
 * Filename format: `CV_[FullName]_[YYYY-MM-DD].txt`
 *
 * @param resume - The resume data to export
 */
export function exportToText(resume: Resume): void {
  const content = buildTextContent(resume)

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const namePart = [
    resume.personalDetails.fullName,
    resume.personalDetails.lastName,
  ]
    .filter(Boolean)
    .join('_')
    .replace(/\s+/g, '_')

  const filename = `CV_${namePart || 'Resume'}_${todayISO()}.txt`

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
