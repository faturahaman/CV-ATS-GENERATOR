/**
 * PDF Export
 *
 * Generates an ATS-friendly PDF resume using jsPDF and triggers a browser
 * download. Layout matches CVPreview exactly:
 * - Name: centered, uppercase, bold, 20pt
 * - Job Target: centered, 11pt
 * - Contact: centered, 9.5pt
 * - Section headers: uppercase, bold, 11pt, with bottom rule
 * - Experience: job title bold + date right-aligned, company italic below
 * - Education: degree bold + grad date right-aligned, school italic below
 * - Skills: grouped 4 per row, bullet list
 * - Certifications: bullet list
 *
 * Filename format: `CV_[FullName]_[YYYY-MM-DD].pdf`
 */

import jsPDF from 'jspdf'
import type { Resume } from '@/types/resume'

// ── Constants ────────────────────────────────────────────────────────────────

const PAGE_WIDTH = 210    // A4 mm
const PAGE_HEIGHT = 297   // A4 mm
const MARGIN_X = 20       // left/right margin mm
const MARGIN_Y = 20       // top/bottom margin mm
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2

const FONT = 'helvetica'

// Font sizes in pt — mirrors CVPreview
const SIZE = {
  name: 20,
  jobTarget: 11,
  contact: 9.5,
  sectionHeader: 11,
  body: 10.5,
  bodySmall: 10,
  small: 9.5,
} as const

// Line heights in mm
const LH = {
  name: 9,
  jobTarget: 6.5,
  contact: 5.5,
  sectionHeader: 6,
  body: 6,
  bodySmall: 5.5,
  small: 5.5,
} as const

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── PDF Writer helper ─────────────────────────────────────────────────────────

class PDFWriter {
  private doc: jsPDF
  private y: number

  constructor(doc: jsPDF) {
    this.doc = doc
    this.y = MARGIN_Y
  }

  /** Ensure there is at least `needed` mm before the bottom margin. */
  private ensureSpace(needed: number): void {
    if (this.y + needed > PAGE_HEIGHT - MARGIN_Y) {
      this.doc.addPage()
      this.y = MARGIN_Y
    }
  }

  /** Write a single line of text at x position. */
  private textAt(
    text: string,
    x: number,
    size: number,
    lineH: number,
    style: 'normal' | 'bold' | 'italic' | 'bolditalic' = 'normal',
    color: [number, number, number] = [26, 26, 26],
    align: 'left' | 'center' | 'right' = 'left'
  ): void {
    this.ensureSpace(lineH + 1)
    this.doc.setFont(FONT, style)
    this.doc.setFontSize(size)
    this.doc.setTextColor(...color)
    this.doc.text(text, x, this.y, { align })
    this.y += lineH
  }

  /** Centered line. */
  centered(
    text: string,
    size: number,
    lineH: number,
    style: 'normal' | 'bold' | 'italic' = 'normal',
    color: [number, number, number] = [26, 26, 26]
  ): void {
    this.textAt(text, PAGE_WIDTH / 2, size, lineH, style, color, 'center')
  }

  /** Left-aligned line. */
  line(
    text: string,
    size: number,
    lineH: number,
    style: 'normal' | 'bold' | 'italic' = 'normal',
    color: [number, number, number] = [26, 26, 26]
  ): void {
    this.textAt(text, MARGIN_X, size, lineH, style, color, 'left')
  }

  /** Right-aligned line at the right margin. */
  rightLine(
    text: string,
    size: number,
    lineH: number,
    style: 'normal' | 'bold' | 'italic' = 'normal',
    color: [number, number, number] = [26, 26, 26]
  ): void {
    this.textAt(text, MARGIN_X + CONTENT_WIDTH, size, lineH, style, color, 'right')
  }

  /**
   * Two items on the same line: left-aligned bold text + right-aligned normal text.
   * Returns the y BEFORE advancing so caller can overlay the right text.
   */
  twoColumn(
    leftText: string,
    rightText: string,
    size: number,
    lineH: number,
    leftStyle: 'normal' | 'bold' = 'bold',
    rightStyle: 'normal' | 'bold' = 'normal',
    color: [number, number, number] = [26, 26, 26]
  ): void {
    this.ensureSpace(lineH + 1)
    // Left
    this.doc.setFont(FONT, leftStyle)
    this.doc.setFontSize(size)
    this.doc.setTextColor(...color)
    this.doc.text(leftText, MARGIN_X, this.y)
    // Right
    if (rightText) {
      this.doc.setFont(FONT, rightStyle)
      this.doc.text(rightText, MARGIN_X + CONTENT_WIDTH, this.y, { align: 'right' })
    }
    this.y += lineH
  }

  /** Write wrapped text (multi-line). */
  wrappedText(
    text: string,
    size: number,
    lineH: number,
    style: 'normal' | 'bold' | 'italic' = 'normal',
    color: [number, number, number] = [26, 26, 26],
    indent = 0
  ): void {
    this.doc.setFont(FONT, style)
    this.doc.setFontSize(size)
    this.doc.setTextColor(...color)
    const lines = this.doc.splitTextToSize(text, CONTENT_WIDTH - indent)
    for (const l of lines) {
      this.ensureSpace(lineH + 1)
      this.doc.text(l, MARGIN_X + indent, this.y)
      this.y += lineH
    }
  }

  /** Draw a horizontal rule. */
  rule(thickness = 0.5, color: [number, number, number] = [26, 26, 26]): void {
    this.ensureSpace(3)
    this.doc.setDrawColor(...color)
    this.doc.setLineWidth(thickness)
    this.doc.line(MARGIN_X, this.y, MARGIN_X + CONTENT_WIDTH, this.y)
    this.y += 3
  }

  /** Light separator rule between entries. */
  lightRule(): void {
    this.ensureSpace(5)
    this.doc.setDrawColor(208, 208, 208)
    this.doc.setLineWidth(0.2)
    this.doc.line(MARGIN_X, this.y, MARGIN_X + CONTENT_WIDTH, this.y)
    this.y += 5
  }

  /** Add vertical space. */
  gap(mm: number): void {
    this.y += mm
  }

  /**
   * Section header: uppercase bold text + thick bottom rule.
   * Matches CVPreview SectionHeader exactly.
   */
  sectionHeader(title: string): void {
    this.gap(3)
    this.ensureSpace(LH.sectionHeader + 6)
    this.doc.setFont(FONT, 'bold')
    this.doc.setFontSize(SIZE.sectionHeader)
    this.doc.setTextColor(26, 26, 26)
    this.doc.text(title.toUpperCase(), MARGIN_X, this.y)
    this.y += LH.sectionHeader + 1
    // Bottom border — 2px equivalent
    this.doc.setDrawColor(26, 26, 26)
    this.doc.setLineWidth(0.5)
    this.doc.line(MARGIN_X, this.y, MARGIN_X + CONTENT_WIDTH, this.y)
    this.y += 4  // gap after rule before first entry
  }

  getDoc(): jsPDF {
    return this.doc
  }
}

// ── Main export function ──────────────────────────────────────────────────────

/**
 * Exports the resume as an ATS-friendly PDF and triggers a browser download.
 * Layout is pixel-perfect match to CVPreview component.
 *
 * @param resume - The resume data to export
 */
export function exportToPDF(resume: Resume): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const w = new PDFWriter(doc)

  const { personalDetails: pd } = resume

  // ── Header: Full Name (centered, uppercase, bold, 20pt) ──────────────────
  const fullName = [pd.fullName, pd.lastName].filter(Boolean).join(' ')
  if (fullName) {
    w.centered(fullName.toUpperCase(), SIZE.name, LH.name, 'bold')
    w.gap(1)
  }

  // ── Job Target (centered, normal, 11pt) ──────────────────────────────────
  if (pd.jobTarget?.trim()) {
    w.centered(pd.jobTarget.trim(), SIZE.jobTarget, LH.jobTarget, 'normal')
    w.gap(1)
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
    w.wrappedText(contactLine, SIZE.contact, LH.contact, 'normal', [26, 26, 26])
    w.gap(1)
  }

  // ── Divider after header ──────────────────────────────────────────────────
  if (fullName || contactLine) {
    w.gap(2)
    w.rule(0.5)
    w.gap(1)
  }

  // ── Professional Summary ──────────────────────────────────────────────────
  if (resume.professionalSummary?.trim()) {
    w.sectionHeader('Professional Summary')
    w.wrappedText(resume.professionalSummary.trim(), SIZE.bodySmall, LH.bodySmall, 'normal', [26, 26, 26])
  }

  // ── Work Experience ───────────────────────────────────────────────────────
  if (resume.experience?.length) {
    w.sectionHeader('Work Experience')
    for (let i = 0; i < resume.experience.length; i++) {
      const exp = resume.experience[i]
      const start = formatDateLabel(exp.startDate)
      const end = formatDateLabel(exp.endDate)
      const dateRange = [start, end].filter(Boolean).join(' \u2013 ')
      const lines = splitDescriptionLines(exp.description)

      if (i > 0) {
        w.lightRule()
      }

      // Job title (bold, left) + date range (normal, right) — same line
      w.twoColumn(
        exp.jobTitle || '',
        dateRange,
        SIZE.body,
        LH.body,
        'bold',
        'normal',
        [26, 26, 26]
      )

      // Company name — italic, below
      if (exp.companyName) {
        w.line(exp.companyName, SIZE.bodySmall, LH.bodySmall, 'italic', [26, 26, 26])
      }

      // Bullet points
      if (lines.length > 0) {
        w.gap(1)
        for (const dl of lines) {
          w.wrappedText(`\u2022 ${dl}`, SIZE.bodySmall, LH.bodySmall, 'normal', [26, 26, 26], 4)
        }
      }
    }
  }

  // ── Education ─────────────────────────────────────────────────────────────
  if (resume.education?.length) {
    w.sectionHeader('Education')
    for (const edu of resume.education) {
      const grad = formatDateLabel(edu.graduationDate)
      const degreeField = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(', ')
      const lines = splitDescriptionLines(edu.description ?? '')

      // Degree (bold, left) + graduation date (normal, right) — same line
      w.twoColumn(
        degreeField || '',
        grad ? `Graduated: ${grad}` : '',
        SIZE.body,
        LH.body,
        'bold',
        'normal',
        [26, 26, 26]
      )

      // School name — italic, below
      if (edu.schoolName) {
        w.line(edu.schoolName, SIZE.bodySmall, LH.bodySmall, 'italic', [26, 26, 26])
      }

      // Description bullets
      if (lines.length > 0) {
        w.gap(1)
        for (const dl of lines) {
          w.wrappedText(`\u2022 ${dl}`, SIZE.bodySmall, LH.bodySmall, 'normal', [26, 26, 26], 4)
        }
      }
      w.gap(2)
    }
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  if (resume.skills?.length) {
    w.sectionHeader('Skills')
    // Group 4 per row, bullet list — matches CVPreview SkillsSection
    const CHUNK = 4
    for (let i = 0; i < resume.skills.length; i += CHUNK) {
      const row = resume.skills.slice(i, i + CHUNK)
      const rowText = row.map((s) => s.name).join(', ')
      w.wrappedText(`\u2022 ${rowText}`, SIZE.bodySmall, LH.bodySmall, 'normal', [26, 26, 26], 4)
    }
  }

  // ── Certifications ────────────────────────────────────────────────────────
  if (resume.certifications?.length) {
    w.sectionHeader('Certifications')
    for (const cert of resume.certifications) {
      const certLine = [
        cert.certificationName,
        cert.issuingOrganization ? `\u2014 ${cert.issuingOrganization}` : '',
      ]
        .filter(Boolean)
        .join(' ')
      w.wrappedText(`\u2022 ${certLine}`, SIZE.bodySmall, LH.bodySmall, 'normal', [26, 26, 26], 4)
    }
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const namePart = [pd.fullName, pd.lastName]
    .filter(Boolean)
    .join('_')
    .replace(/\s+/g, '_')

  const filename = `CV_${namePart || 'Resume'}_${todayISO()}.pdf`
  doc.save(filename)
}
