/**
 * DOCX Export
 *
 * Generates an ATS-friendly DOCX resume using the `docx` library and
 * triggers a browser download. Layout matches CVPreview exactly:
 * - Name: centered, uppercase, bold, 20pt
 * - Job Target: centered, 11pt
 * - Contact: centered, 9.5pt
 * - Section headers: uppercase, bold, 11pt, bottom border
 * - Experience: job title bold + date right-aligned, company italic below
 * - Education: degree bold + grad date right-aligned, school italic below
 * - Skills: grouped 4 per row, bullet list
 * - Certifications: bullet list
 *
 * Filename format: `CV_[FullName]_[YYYY-MM-DD].docx`
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  PageOrientation,
  TabStopType,
  convertInchesToTwip,
} from 'docx'
import type { Resume } from '@/types/resume'

// ── Constants ─────────────────────────────────────────────────────────────────

const FONT = 'Calibri'

// Font sizes in half-points (docx unit: 1pt = 2 half-points)
const PT = (n: number) => Math.round(n * 2)

const SIZES = {
  name: PT(20),
  jobTarget: PT(11),
  contact: PT(9.5),
  sectionHeader: PT(11),
  body: PT(10.5),
  bodySmall: PT(10),
  small: PT(9.5),
}

// Content width in twips for right-aligned tab stop (A4 - 2 * 0.79in margins)
const CONTENT_WIDTH_TWIP = convertInchesToTwip(8.27 - 0.79 * 2)

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateLabel(value: string): string {
  if (!value) return ''
  if (value.toLowerCase() === 'present') return 'Present'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
}

function todayISO(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function splitDescriptionLines(text: string): string[] {
  if (!text?.trim()) return []
  return text
    .split('\n')
    .map((l) => l.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
}

// ── Paragraph builders ────────────────────────────────────────────────────────

/** Empty paragraph for vertical spacing */
function spacer(size = PT(4)): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: '', size, font: FONT })],
    spacing: { before: 0, after: 0 },
  })
}

/**
 * Section header: uppercase, bold, 11pt, bottom border.
 * Matches CVPreview SectionHeader exactly.
 */
function sectionHeading(title: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: SIZES.sectionHeader,
        font: FONT,
        color: '1A1A1A',
      }),
    ],
    alignment: AlignmentType.LEFT,
    border: {
      bottom: {
        color: '1A1A1A',
        space: 1,
        style: BorderStyle.SINGLE,
        size: 12, // ~1.5pt thick, matches 2px border in preview
      },
    },
    spacing: { before: 200, after: 80 },
  })
}

/**
 * Two-column row: bold left text + normal right text (right-aligned via tab stop).
 * Matches the flex justifyContent: space-between layout in CVPreview.
 */
function twoColumnRow(
  leftText: string,
  rightText: string,
  leftSize: number,
  rightSize: number,
  leftBold = true
): Paragraph {
  const runs: TextRun[] = [
    new TextRun({
      text: leftText,
      bold: leftBold,
      size: leftSize,
      font: FONT,
      color: '1A1A1A',
    }),
  ]
  if (rightText) {
    runs.push(
      new TextRun({ text: '\t', size: rightSize, font: FONT }),
      new TextRun({
        text: rightText,
        size: rightSize,
        font: FONT,
        color: '1A1A1A',
      })
    )
  }
  return new Paragraph({
    children: runs,
    tabStops: [
      {
        type: TabStopType.RIGHT,
        position: CONTENT_WIDTH_TWIP,
      },
    ],
    spacing: { before: 80, after: 0 },
  })
}

/** Italic sub-line (company name, school name). */
function italicLine(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        italics: true,
        size: SIZES.bodySmall,
        font: FONT,
        color: '1A1A1A',
      }),
    ],
    spacing: { before: 0, after: 40 },
  })
}

/** Body paragraph (wraps naturally). */
function bodyParagraph(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: SIZES.bodySmall, font: FONT, color: '1A1A1A' })],
    spacing: { before: 0, after: 40 },
  })
}

/** Bullet point — disc bullet character for visual match with CVPreview. */
function bulletParagraph(text: string): Paragraph {
  const clean = text.replace(/^[-•*]\s*/, '').trim()
  return new Paragraph({
    children: [
      new TextRun({ text: `\u2022 ${clean}`, size: SIZES.bodySmall, font: FONT, color: '1A1A1A' }),
    ],
    indent: { left: convertInchesToTwip(0.2) },
    spacing: { before: 0, after: 20 },
  })
}

/** Light separator between experience entries. */
function lightSeparator(): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: '', size: PT(4), font: FONT })],
    border: {
      bottom: {
        color: 'D0D0D0',
        space: 1,
        style: BorderStyle.SINGLE,
        size: 2,
      },
    },
    spacing: { before: 60, after: 60 },
  })
}

// ── Main export function ──────────────────────────────────────────────────────

/**
 * Exports the resume as an ATS-friendly DOCX file and triggers a browser
 * download. Layout is pixel-perfect match to CVPreview component.
 *
 * @param resume - The resume data to export
 */
export async function exportToDocx(resume: Resume): Promise<void> {
  const { personalDetails: pd } = resume
  const paragraphs: Paragraph[] = []

  // ── Header: Full Name (centered, uppercase, bold, 20pt) ──────────────────
  const fullName = [pd.fullName, pd.lastName].filter(Boolean).join(' ')
  if (fullName) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: fullName.toUpperCase(),
            bold: true,
            size: SIZES.name,
            font: FONT,
            color: '1A1A1A',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 40 },
      })
    )
  }

  // ── Job Target (centered, normal, 11pt) ──────────────────────────────────
  if (pd.jobTarget?.trim()) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: pd.jobTarget.trim(),
            size: SIZES.jobTarget,
            font: FONT,
            color: '1A1A1A',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 40 },
      })
    )
  }

  // ── Contact + Links (centered, 9.5pt) ────────────────────────────────────
  const contactParts = [pd.email, pd.phoneNumber, pd.cityState, pd.country].filter(Boolean)
  const linkParts = [
    pd.linkedinUrl,
    pd.githubUrl && `github.com/${pd.githubUrl.replace(/.*github\.com\//i, '')}`,
    pd.portfolioUrl,
  ].filter(Boolean) as string[]
  const contactLine = [...contactParts, ...linkParts].join(' | ')
  if (contactLine) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactLine,
            size: SIZES.contact,
            font: FONT,
            color: '1A1A1A',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 40 },
      })
    )
  }

  // ── Divider after header (thick top border on next paragraph) ────────────
  if (fullName || contactLine) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: '', size: PT(2), font: FONT })],
        border: {
          bottom: {
            color: '1A1A1A',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 12,
          },
        },
        spacing: { before: 40, after: 0 },
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
    for (let i = 0; i < resume.experience.length; i++) {
      const exp = resume.experience[i]
      const start = formatDateLabel(exp.startDate)
      const end = formatDateLabel(exp.endDate)
      const dateRange = [start, end].filter(Boolean).join(' \u2013 ')
      const lines = splitDescriptionLines(exp.description)

      if (i > 0) {
        paragraphs.push(lightSeparator())
      }

      // Job title (bold, left) + date range (right) — same line via tab stop
      paragraphs.push(
        twoColumnRow(exp.jobTitle || '', dateRange, SIZES.body, SIZES.small)
      )

      // Company name — italic, below
      if (exp.companyName) {
        paragraphs.push(italicLine(exp.companyName))
      }

      // Bullet points
      for (const line of lines) {
        paragraphs.push(bulletParagraph(line))
      }
    }
  }

  // ── Education ────────────────────────────────────────────────────────────
  if (resume.education?.length) {
    paragraphs.push(sectionHeading('Education'))
    for (const edu of resume.education) {
      const grad = formatDateLabel(edu.graduationDate)
      const degreeField = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(', ')
      const lines = splitDescriptionLines(edu.description ?? '')

      // Degree (bold, left) + graduation date (right) — same line via tab stop
      paragraphs.push(
        twoColumnRow(
          degreeField || '',
          grad ? `Graduated: ${grad}` : '',
          SIZES.body,
          SIZES.small
        )
      )

      // School name — italic, below
      if (edu.schoolName) {
        paragraphs.push(italicLine(edu.schoolName))
      }

      // Description bullets
      for (const line of lines) {
        paragraphs.push(bulletParagraph(line))
      }
      paragraphs.push(spacer())
    }
  }

  // ── Skills ───────────────────────────────────────────────────────────────
  if (resume.skills?.length) {
    paragraphs.push(sectionHeading('Skills'))
    // Group 4 per row, bullet list — matches CVPreview SkillsSection
    const CHUNK = 4
    for (let i = 0; i < resume.skills.length; i += CHUNK) {
      const row = resume.skills.slice(i, i + CHUNK)
      const rowText = row.map((s) => s.name).join(', ')
      paragraphs.push(bulletParagraph(rowText))
    }
  }

  // ── Certifications ───────────────────────────────────────────────────────
  if (resume.certifications?.length) {
    paragraphs.push(sectionHeading('Certifications'))
    for (const cert of resume.certifications) {
      const certLine = [
        cert.certificationName,
        cert.issuingOrganization ? `\u2014 ${cert.issuingOrganization}` : '',
      ]
        .filter(Boolean)
        .join(' ')
      paragraphs.push(bulletParagraph(certLine))
    }
  }

  // ── Build document ───────────────────────────────────────────────────────
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SIZES.bodySmall, color: '1A1A1A' },
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
