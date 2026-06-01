/**
 * DOCX Export
 *
 * Generates an ATS-friendly DOCX resume using the `docx` library and
 * triggers a browser download.
 *
 * ATS rules enforced:
 * - Single-column layout
 * - Calibri font throughout
 * - No images, no tables, no icons, no decorative symbols
 * - Standard section headings with a bottom border rule
 * - A4 page size with standard margins
 *
 * Filename format: `CV_[FullName]_[YYYY-MM-DD].docx`
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  PageOrientation,
  convertInchesToTwip,
} from 'docx'
import type { Resume } from '@/types/resume'

// ── Constants ─────────────────────────────────────────────────────────────────

const FONT = 'Calibri'

// Font sizes in half-points (docx unit: 1pt = 2 half-points)
const PT = (n: number) => n * 2

const SIZES = {
  name: PT(20),
  jobTarget: PT(12),
  contact: PT(10),
  sectionHeader: PT(12),
  body: PT(11),
  small: PT(10),
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateLabel(value: string): string {
  if (!value) return ''
  if (value === 'Present') return 'Present'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

function todayISO(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Empty paragraph for vertical spacing */
function spacer(): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: '', size: PT(6), font: FONT })],
  })
}

/** Section heading with a bottom border rule */
function sectionHeading(title: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: SIZES.sectionHeader,
        font: FONT,
        color: '1A1A1A',
      }),
    ],
    border: {
      bottom: {
        color: '1A1A1A',
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
    spacing: { before: 160, after: 80 },
  })
}

/** Bold + regular inline pair on one paragraph (e.g. "Job Title — Company") */
function entryHeading(bold: string, normal?: string): Paragraph {
  const runs: TextRun[] = [
    new TextRun({ text: bold, bold: true, size: SIZES.body, font: FONT }),
  ]
  if (normal) {
    runs.push(new TextRun({ text: `  ${normal}`, size: SIZES.body, font: FONT }))
  }
  return new Paragraph({ children: runs, spacing: { before: 80, after: 0 } })
}

/** Muted sub-line (dates, school name, etc.) */
function subLine(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text, size: SIZES.small, font: FONT, color: '555555' }),
    ],
    spacing: { before: 0, after: 40 },
  })
}

/** Body paragraph (wraps naturally) */
function bodyParagraph(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: SIZES.body, font: FONT })],
    spacing: { before: 0, after: 40 },
  })
}

/** Bullet point — plain hyphen prefix for ATS compatibility */
function bulletParagraph(text: string): Paragraph {
  // Strip leading bullet/dash characters that may already be in the text
  const clean = text.replace(/^[-•*]\s*/, '').trim()
  return new Paragraph({
    children: [
      new TextRun({ text: `- ${clean}`, size: SIZES.body, font: FONT }),
    ],
    indent: { left: convertInchesToTwip(0.2) },
    spacing: { before: 0, after: 20 },
  })
}

// ── Main export function ──────────────────────────────────────────────────────

/**
 * Exports the resume as an ATS-friendly DOCX file and triggers a browser
 * download.
 *
 * @param resume - The resume data to export
 */
export async function exportToDocx(resume: Resume): Promise<void> {
  const { personalDetails: pd } = resume
  const paragraphs: Paragraph[] = []

  // ── Header: Full Name ────────────────────────────────────────────────────
  const fullName = [pd.fullName, pd.lastName].filter(Boolean).join(' ')
  if (fullName) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: fullName,
            bold: true,
            size: SIZES.name,
            font: FONT,
            color: '1A1A1A',
          }),
        ],
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 60 },
      })
    )
  }

  // ── Job Target ───────────────────────────────────────────────────────────
  if (pd.jobTarget?.trim()) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: pd.jobTarget.trim(),
            size: SIZES.jobTarget,
            font: FONT,
            color: '444444',
          }),
        ],
        spacing: { before: 0, after: 40 },
      })
    )
  }

  // ── Contact Info ─────────────────────────────────────────────────────────
  const contactParts = [pd.email, pd.phoneNumber, pd.cityState, pd.country].filter(Boolean)
  if (contactParts.length) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactParts.join('  |  '),
            size: SIZES.contact,
            font: FONT,
            color: '555555',
          }),
        ],
        spacing: { before: 0, after: 20 },
      })
    )
  }

  // ── Links ────────────────────────────────────────────────────────────────
  const linkParts = [
    pd.linkedinUrl && `LinkedIn: ${pd.linkedinUrl}`,
    pd.githubUrl && `GitHub: ${pd.githubUrl}`,
    pd.portfolioUrl && `Portfolio: ${pd.portfolioUrl}`,
    pd.website && `Website: ${pd.website}`,
  ].filter(Boolean) as string[]
  if (linkParts.length) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: linkParts.join('  |  '),
            size: SIZES.contact,
            font: FONT,
            color: '555555',
          }),
        ],
        spacing: { before: 0, after: 80 },
      })
    )
  }

  // ── Professional Summary ─────────────────────────────────────────────────
  if (resume.professionalSummary?.trim()) {
    paragraphs.push(sectionHeading('Professional Summary'))
    paragraphs.push(bodyParagraph(resume.professionalSummary.trim()))
  }

  // ── Work Experience ──────────────────────────────────────────────────────
  if (resume.experience?.length) {
    paragraphs.push(sectionHeading('Work Experience'))
    for (const exp of resume.experience) {
      const start = formatDateLabel(exp.startDate)
      const end = formatDateLabel(exp.endDate)
      const dateRange = [start, end].filter(Boolean).join(' - ')

      paragraphs.push(entryHeading(exp.jobTitle, exp.companyName))
      if (dateRange) paragraphs.push(subLine(dateRange))

      if (exp.description?.trim()) {
        const lines = exp.description.split('\n').map((l) => l.trim()).filter(Boolean)
        for (const line of lines) {
          paragraphs.push(bulletParagraph(line))
        }
      }
      paragraphs.push(spacer())
    }
  }

  // ── Education ────────────────────────────────────────────────────────────
  if (resume.education?.length) {
    paragraphs.push(sectionHeading('Education'))
    for (const edu of resume.education) {
      const grad = formatDateLabel(edu.graduationDate)
      const degreeField = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(' in ')

      paragraphs.push(entryHeading(degreeField, edu.schoolName))
      if (grad) paragraphs.push(subLine(grad))

      if (edu.description?.trim()) {
        const lines = edu.description.split('\n').map((l) => l.trim()).filter(Boolean)
        for (const line of lines) {
          paragraphs.push(bulletParagraph(line))
        }
      }
      paragraphs.push(spacer())
    }
  }

  // ── Skills ───────────────────────────────────────────────────────────────
  if (resume.skills?.length) {
    paragraphs.push(sectionHeading('Skills'))
    const skillText = resume.skills
      .map((s) => (s.level ? `${s.name} (${s.level})` : s.name))
      .join(', ')
    paragraphs.push(bodyParagraph(skillText))
  }

  // ── Certifications ───────────────────────────────────────────────────────
  if (resume.certifications?.length) {
    paragraphs.push(sectionHeading('Certifications'))
    for (const cert of resume.certifications) {
      const issue = formatDateLabel(cert.issueDate)
      const expiry = cert.expirationDate ? formatDateLabel(cert.expirationDate) : ''
      const dateRange = expiry ? `${issue} - ${expiry}` : issue
      const parts = [
        cert.certificationName,
        cert.issuingOrganization,
        dateRange ? `(${dateRange})` : '',
      ].filter(Boolean)
      paragraphs.push(bulletParagraph(parts.join(', ')))
    }
  }

  // ── Build document ───────────────────────────────────────────────────────
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SIZES.body, color: '1A1A1A' },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.PORTRAIT,
              width: convertInchesToTwip(8.27),   // A4 width
              height: convertInchesToTwip(11.69),  // A4 height
            },
            margin: {
              top: convertInchesToTwip(0.79),
              bottom: convertInchesToTwip(0.79),
              left: convertInchesToTwip(0.79),
              right: convertInchesToTwip(0.79),
            },
          },
        },
        children: paragraphs,
      },
    ],
  })

  // ── Serialize and download ───────────────────────────────────────────────
  const blob = await Packer.toBlob(doc)

  const namePart = [pd.fullName, pd.lastName]
    .filter(Boolean)
    .join('_')
    .replace(/\s+/g, '_')

  const filename = `CV_${namePart || 'Resume'}_${todayISO()}.docx`

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
