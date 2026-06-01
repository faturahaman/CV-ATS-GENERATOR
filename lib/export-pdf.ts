/**
 * PDF Export
 *
 * Generates an ATS-friendly PDF resume using jsPDF and triggers a browser
 * download. The layout is single-column with Helvetica (a standard ATS-safe
 * font), no images, and no decorative symbols.
 *
 * Filename format: `CV_[FullName]_[YYYY-MM-DD].pdf`
 */

import jsPDF from 'jspdf'
import type { Resume } from '@/types/resume'

// ── Constants ────────────────────────────────────────────────────────────────

const PAGE_WIDTH = 210   // A4 mm
const PAGE_HEIGHT = 297  // A4 mm
const MARGIN_X = 20      // left/right margin mm
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2

const FONT = 'helvetica'

const SIZE = {
  name: 18,
  jobTarget: 12,
  contact: 9,
  sectionHeader: 11,
  body: 10,
  small: 9,
} as const

const LINE_HEIGHT = {
  name: 8,
  jobTarget: 6,
  contact: 5,
  sectionHeader: 6,
  body: 5.5,
  small: 5,
} as const

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── PDF Writer helper ─────────────────────────────────────────────────────────

class PDFWriter {
  private doc: jsPDF
  private y: number
  private readonly marginX: number
  private readonly pageHeight: number
  private readonly contentWidth: number

  constructor(doc: jsPDF) {
    this.doc = doc
    this.y = MARGIN_X
    this.marginX = MARGIN_X
    this.pageHeight = PAGE_HEIGHT
    this.contentWidth = CONTENT_WIDTH
  }

  /** Ensure there is at least `needed` mm before the bottom margin. */
  private ensureSpace(needed: number): void {
    if (this.y + needed > this.pageHeight - MARGIN_X) {
      this.doc.addPage()
      this.y = MARGIN_X
    }
  }

  /** Write a single line of text. */
  line(
    text: string,
    size: number,
    lineH: number,
    style: 'normal' | 'bold' = 'normal',
    color: [number, number, number] = [26, 26, 26]
  ): void {
    this.ensureSpace(lineH + 2)
    this.doc.setFont(FONT, style)
    this.doc.setFontSize(size)
    this.doc.setTextColor(...color)
    this.doc.text(text, this.marginX, this.y)
    this.y += lineH
  }

  /** Write wrapped text (multi-line). Returns new y. */
  wrappedText(
    text: string,
    size: number,
    lineH: number,
    style: 'normal' | 'bold' = 'normal',
    color: [number, number, number] = [26, 26, 26],
    indent = 0
  ): void {
    this.doc.setFont(FONT, style)
    this.doc.setFontSize(size)
    this.doc.setTextColor(...color)
    const lines = this.doc.splitTextToSize(text, this.contentWidth - indent)
    for (const l of lines) {
      this.ensureSpace(lineH + 1)
      this.doc.text(l, this.marginX + indent, this.y)
      this.y += lineH
    }
  }

  /** Draw a horizontal rule. */
  rule(color: [number, number, number] = [180, 180, 180]): void {
    this.ensureSpace(3)
    this.doc.setDrawColor(...color)
    this.doc.setLineWidth(0.3)
    this.doc.line(this.marginX, this.y, this.marginX + this.contentWidth, this.y)
    this.y += 3
  }

  /** Add vertical space. */
  gap(mm: number): void {
    this.y += mm
  }

  /** Draw a section header with an underline rule. */
  sectionHeader(title: string): void {
    this.gap(4)
    this.line(title.toUpperCase(), SIZE.sectionHeader, LINE_HEIGHT.sectionHeader, 'bold', [26, 26, 26])
    this.rule([180, 180, 180])
  }

  getDoc(): jsPDF {
    return this.doc
  }
}

// ── Main export function ──────────────────────────────────────────────────────

/**
 * Exports the resume as an ATS-friendly PDF and triggers a browser download.
 *
 * @param resume - The resume data to export
 */
export function exportToPDF(resume: Resume): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const w = new PDFWriter(doc)

  const { personalDetails: pd } = resume

  // ── Personal Details header ───────────────────────────────────────────────
  const fullName = [pd.fullName, pd.lastName].filter(Boolean).join(' ')
  if (fullName) {
    w.line(fullName, SIZE.name, LINE_HEIGHT.name, 'bold')
  }

  if (pd.jobTarget) {
    w.line(pd.jobTarget, SIZE.jobTarget, LINE_HEIGHT.jobTarget, 'normal', [80, 80, 80])
  }

  const contactParts = [pd.email, pd.phoneNumber, pd.country].filter(Boolean)
  if (contactParts.length) {
    w.line(contactParts.join('  |  '), SIZE.contact, LINE_HEIGHT.contact, 'normal', [100, 100, 100])
  }

  const linkParts = [
    pd.linkedinUrl && `LinkedIn: ${pd.linkedinUrl}`,
    pd.githubUrl && `GitHub: ${pd.githubUrl}`,
    pd.portfolioUrl && `Portfolio: ${pd.portfolioUrl}`,
    pd.website && `Website: ${pd.website}`,
  ].filter(Boolean) as string[]
  if (linkParts.length) {
    w.wrappedText(linkParts.join('  |  '), SIZE.small, LINE_HEIGHT.small, 'normal', [100, 100, 100])
  }

  w.rule()

  // ── Professional Summary ──────────────────────────────────────────────────
  if (resume.professionalSummary?.trim()) {
    w.sectionHeader('Professional Summary')
    w.wrappedText(resume.professionalSummary.trim(), SIZE.body, LINE_HEIGHT.body)
  }

  // ── Work Experience ───────────────────────────────────────────────────────
  if (resume.experience?.length) {
    w.sectionHeader('Work Experience')
    for (const exp of resume.experience) {
      const start = formatDateLabel(exp.startDate)
      const end = formatDateLabel(exp.endDate)
      const dateRange = [start, end].filter(Boolean).join(' - ')

      // Job title (bold) + date range (right-aligned on same line)
      const titleText = [exp.jobTitle, exp.companyName].filter(Boolean).join(' — ')
      w.gap(2)
      w.line(titleText, SIZE.body, LINE_HEIGHT.body, 'bold')
      if (dateRange) {
        w.line(dateRange, SIZE.small, LINE_HEIGHT.small, 'normal', [100, 100, 100])
      }

      if (exp.description?.trim()) {
        const descLines = exp.description
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
        for (const dl of descLines) {
          const bullet = dl.startsWith('-') ? dl : `- ${dl}`
          w.wrappedText(bullet, SIZE.body, LINE_HEIGHT.body, 'normal', [26, 26, 26], 3)
        }
      }
    }
  }

  // ── Education ─────────────────────────────────────────────────────────────
  if (resume.education?.length) {
    w.sectionHeader('Education')
    for (const edu of resume.education) {
      const grad = formatDateLabel(edu.graduationDate)
      const degreeField = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(' in ')
      const heading = [degreeField, edu.schoolName ? `— ${edu.schoolName}` : '']
        .filter(Boolean)
        .join(' ')

      w.gap(2)
      w.line(heading, SIZE.body, LINE_HEIGHT.body, 'bold')
      if (grad) {
        w.line(grad, SIZE.small, LINE_HEIGHT.small, 'normal', [100, 100, 100])
      }

      if (edu.description?.trim()) {
        const descLines = edu.description
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
        for (const dl of descLines) {
          const bullet = dl.startsWith('-') ? dl : `- ${dl}`
          w.wrappedText(bullet, SIZE.body, LINE_HEIGHT.body, 'normal', [26, 26, 26], 3)
        }
      }
    }
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  if (resume.skills?.length) {
    w.sectionHeader('Skills')
    const skillText = resume.skills
      .map((s) => (s.level ? `${s.name} (${s.level})` : s.name))
      .join(', ')
    w.wrappedText(skillText, SIZE.body, LINE_HEIGHT.body)
  }

  // ── Certifications ────────────────────────────────────────────────────────
  if (resume.certifications?.length) {
    w.sectionHeader('Certifications')
    for (const cert of resume.certifications) {
      const issue = formatDateLabel(cert.issueDate)
      const expiry = cert.expirationDate ? formatDateLabel(cert.expirationDate) : ''
      const dateRange = expiry ? `${issue} - ${expiry}` : issue
      const parts = [cert.certificationName, cert.issuingOrganization, dateRange ? `(${dateRange})` : '']
        .filter(Boolean)
      w.gap(1)
      w.wrappedText(`- ${parts.join(', ')}`, SIZE.body, LINE_HEIGHT.body)
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
