'use client'

import { memo } from 'react'
import type {
  Resume,
  ExperienceEntry,
  EducationEntry,
  SkillEntry,
  CertificationEntry,
} from '@/types/resume'

interface CVPreviewProps {
  resume: Resume
}

// ── Shared inline styles ──────────────────────────────────────────────────────

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: '11pt',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1.5px solid #1a1a1a',
  paddingBottom: '2px',
  marginBottom: '8px',
  marginTop: '16px',
}

const bulletStyle: React.CSSProperties = {
  margin: '0 0 2px 0',
  paddingLeft: '0',
  listStyleType: 'disc',
  listStylePosition: 'inside',
}

// ── Helper: format YYYY-MM-DD → "Mon YYYY" ───────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  if (dateStr.toLowerCase() === 'present') return 'Present'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

// ── Helper: split description into bullet lines ───────────────────────────────

function descriptionLines(text: string): string[] {
  if (!text?.trim()) return []
  return text
    .split(/\n|•|-(?=\s)/)
    .map((l) => l.trim())
    .filter(Boolean)
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <h2 style={sectionHeaderStyle}>{title}</h2>
}

function ExperienceSection({ entries }: { entries: ExperienceEntry[] }) {
  if (!entries.length) return null
  return (
    <section aria-label="Work Experience">
      <SectionHeader title="Work Experience" />
      {entries.map((entry) => {
        const lines = descriptionLines(entry.description)
        return (
          <div key={entry.id} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ fontSize: '10.5pt' }}>{entry.jobTitle}</strong>
              <span style={{ fontSize: '9.5pt', color: '#555', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                {formatDate(entry.startDate)} – {formatDate(entry.endDate)}
              </span>
            </div>
            <div style={{ fontSize: '10pt', color: '#444', marginBottom: '4px' }}>
              {entry.companyName}
            </div>
            {lines.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: '16px' }}>
                {lines.map((line, i) => (
                  <li key={i} style={bulletStyle}>
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </section>
  )
}

function EducationSection({ entries }: { entries: EducationEntry[] }) {
  if (!entries.length) return null
  return (
    <section aria-label="Education">
      <SectionHeader title="Education" />
      {entries.map((entry) => {
        const lines = descriptionLines(entry.description ?? '')
        return (
          <div key={entry.id} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ fontSize: '10.5pt' }}>
                {entry.degree}{entry.fieldOfStudy ? `, ${entry.fieldOfStudy}` : ''}
              </strong>
              <span style={{ fontSize: '9.5pt', color: '#555', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                {formatDate(entry.graduationDate)}
              </span>
            </div>
            <div style={{ fontSize: '10pt', color: '#444', marginBottom: '4px' }}>
              {entry.schoolName}
            </div>
            {lines.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: '16px' }}>
                {lines.map((line, i) => (
                  <li key={i} style={bulletStyle}>
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </section>
  )
}

function SkillsSection({ skills }: { skills: SkillEntry[] }) {
  if (!skills.length) return null
  return (
    <section aria-label="Skills">
      <SectionHeader title="Skills" />
      <p style={{ margin: 0, fontSize: '10pt', lineHeight: '1.6' }}>
        {skills.map((s) => s.name).join(', ')}
      </p>
    </section>
  )
}

function CertificationsSection({ certs }: { certs: CertificationEntry[] }) {
  if (!certs.length) return null
  return (
    <section aria-label="Certifications">
      <SectionHeader title="Certifications" />
      {certs.map((cert) => (
        <div key={cert.id} style={{ marginBottom: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <strong style={{ fontSize: '10.5pt' }}>{cert.certificationName}</strong>
            <span style={{ fontSize: '9.5pt', color: '#555', whiteSpace: 'nowrap', marginLeft: '8px' }}>
              {formatDate(cert.issueDate)}
              {cert.expirationDate ? ` – ${formatDate(cert.expirationDate)}` : ''}
            </span>
          </div>
          <div style={{ fontSize: '10pt', color: '#444' }}>{cert.issuingOrganization}</div>
        </div>
      ))}
    </section>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * ATS-friendly CV preview.
 *
 * Rules enforced:
 * - Single column layout
 * - No images or icons
 * - Plain text only — no decorative symbols
 * - Standard sans-serif typography via inline styles so the output
 *   is independent of the app's Tailwind theme
 * - Updates immediately when the resume prop changes (debouncing is
 *   handled by the parent via useMemo / useCallback)
 */
export const CVPreview = memo(function CVPreview({ resume }: CVPreviewProps) {
  const { personalDetails: pd } = resume

  const hasName = pd.fullName?.trim()
  const hasContact = pd.email || pd.phoneNumber || pd.country || pd.cityState
  const hasLinks = pd.linkedinUrl || pd.githubUrl || pd.portfolioUrl
  const hasSummary = resume.professionalSummary?.trim()
  const hasExperience = resume.experience.length > 0
  const hasEducation = resume.education.length > 0
  const hasSkills = resume.skills.length > 0
  const hasCertifications = resume.certifications.length > 0

  const isEmpty =
    !hasName &&
    !hasContact &&
    !hasLinks &&
    !hasSummary &&
    !hasExperience &&
    !hasEducation &&
    !hasSkills &&
    !hasCertifications

  return (
    <div
      // Intentionally using inline styles so the preview looks the same
      // regardless of the surrounding Tailwind theme.
      style={{
        fontFamily: 'Arial, Calibri, "Times New Roman", sans-serif',
        fontSize: '11pt',
        lineHeight: '1.5',
        color: '#1a1a1a',
        backgroundColor: '#ffffff',
        padding: '40px 48px',
        maxWidth: '680px',
        margin: '0 auto',
        minHeight: '400px',
      }}
      aria-label="CV preview"
      role="region"
    >
      {/* ── Empty state ── */}
      {isEmpty && (
        <p
          style={{
            color: '#aaa',
            fontSize: '10pt',
            textAlign: 'center',
            marginTop: '80px',
          }}
        >
          Start filling in your details to see the preview.
        </p>
      )}

      {/* ── Header: Full Name + Job Target ── */}
      {hasName && (
        <div style={{ marginBottom: '4px' }}>
          <h1
            style={{
              fontSize: '20pt',
              fontWeight: 700,
              margin: 0,
              letterSpacing: '-0.3px',
            }}
          >
            {pd.fullName}
            {pd.lastName ? ` ${pd.lastName}` : ''}
          </h1>

          {pd.jobTarget && (
            <p
              style={{
                fontSize: '11pt',
                fontWeight: 500,
                margin: '2px 0 0',
                color: '#444',
              }}
            >
              {pd.jobTarget}
            </p>
          )}
        </div>
      )}

      {/* ── Contact line ── */}
      {hasContact && (
        <div
          style={{
            marginTop: '8px',
            fontSize: '9.5pt',
            color: '#555',
            borderBottom: '1px solid #ccc',
            paddingBottom: '6px',
            marginBottom: hasLinks ? '4px' : '12px',
          }}
        >
          {[pd.email, pd.phoneNumber, pd.cityState, pd.country]
            .filter(Boolean)
            .join('  |  ')}
        </div>
      )}

      {/* ── Links ── */}
      {hasLinks && (
        <div
          style={{
            fontSize: '9.5pt',
            color: '#555',
            marginBottom: '12px',
            borderBottom: '1px solid #ccc',
            paddingBottom: '6px',
          }}
        >
          {[
            pd.linkedinUrl && `LinkedIn: ${pd.linkedinUrl}`,
            pd.githubUrl && `GitHub: ${pd.githubUrl}`,
            pd.portfolioUrl && `Portfolio: ${pd.portfolioUrl}`,
          ]
            .filter(Boolean)
            .join('  |  ')}
        </div>
      )}

      {/* ── Professional Summary ── */}
      {hasSummary && (
        <section aria-label="Professional Summary">
          <SectionHeader title="Professional Summary" />
          <p style={{ margin: 0, fontSize: '10.5pt', lineHeight: '1.6' }}>
            {resume.professionalSummary}
          </p>
        </section>
      )}

      {/* ── Work Experience ── */}
      <ExperienceSection entries={resume.experience} />

      {/* ── Education ── */}
      <EducationSection entries={resume.education} />

      {/* ── Skills ── */}
      <SkillsSection skills={resume.skills} />

      {/* ── Certifications ── */}
      <CertificationsSection certs={resume.certifications} />
    </div>
  )
})
