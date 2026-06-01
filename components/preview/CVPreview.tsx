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

// ── Typography constants ──────────────────────────────────────────────────────

const FONT = 'Arial, Calibri, sans-serif'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  if (dateStr.toLowerCase() === 'present') return 'Present'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  } catch {
    return dateStr
  }
}

/** Split description text into individual bullet lines */
function descriptionLines(text: string): string[] {
  if (!text?.trim()) return []
  return text
    .split('\n')
    .map((l) => l.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
}

// ── Section header — uppercase, bold, full-width bottom border ────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <h2
      style={{
        fontFamily: FONT,
        fontSize: '11pt',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
        margin: '16px 0 6px 0',
        paddingBottom: '4px',
        borderBottom: '2px solid #1a1a1a',
        color: '#1a1a1a',
      }}
    >
      {title}
    </h2>
  )
}

// ── Experience section ────────────────────────────────────────────────────────

function ExperienceSection({ entries }: { entries: ExperienceEntry[] }) {
  if (!entries.length) return null
  return (
    <section aria-label="Work Experience">
      <SectionHeader title="Work Experience" />
      {entries.map((entry, idx) => {
        const lines = descriptionLines(entry.description)
        const dateRange = [formatDate(entry.startDate), formatDate(entry.endDate)]
          .filter(Boolean)
          .join(' \u2013 ')
        return (
          <div
            key={entry.id}
            style={{
              marginBottom: idx < entries.length - 1 ? '12px' : '0',
              paddingBottom: idx < entries.length - 1 ? '12px' : '0',
              borderBottom: idx < entries.length - 1 ? '1px solid #d0d0d0' : 'none',
            }}
          >
            {/* Job title (bold) + date range (right-aligned) */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: '8px',
              }}
            >
              <strong
                style={{
                  fontFamily: FONT,
                  fontSize: '10.5pt',
                  fontWeight: 700,
                  color: '#1a1a1a',
                }}
              >
                {entry.jobTitle}
              </strong>
              {dateRange && (
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: '9.5pt',
                    color: '#1a1a1a',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {dateRange}
                </span>
              )}
            </div>

            {/* Company name — italic */}
            {entry.companyName && (
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: '10pt',
                  fontStyle: 'italic',
                  color: '#1a1a1a',
                  marginBottom: lines.length > 0 ? '4px' : '0',
                }}
              >
                {entry.companyName}
              </div>
            )}

            {/* Bullet points */}
            {lines.length > 0 && (
              <ul
                style={{
                  margin: '2px 0 0 0',
                  paddingLeft: '18px',
                  listStyleType: 'disc',
                }}
              >
                {lines.map((line, i) => (
                  <li
                    key={i}
                    style={{
                      fontFamily: FONT,
                      fontSize: '10pt',
                      lineHeight: '1.5',
                      color: '#1a1a1a',
                      marginBottom: '2px',
                    }}
                  >
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

// ── Education section ─────────────────────────────────────────────────────────

function EducationSection({ entries }: { entries: EducationEntry[] }) {
  if (!entries.length) return null
  return (
    <section aria-label="Education">
      <SectionHeader title="Education" />
      {entries.map((entry) => {
        const degreeField = [entry.degree, entry.fieldOfStudy].filter(Boolean).join(', ')
        const lines = descriptionLines(entry.description ?? '')
        return (
          <div key={entry.id} style={{ marginBottom: '8px' }}>
            {/* Degree + graduation date right-aligned */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: '8px',
              }}
            >
              <strong
                style={{
                  fontFamily: FONT,
                  fontSize: '10.5pt',
                  fontWeight: 700,
                  color: '#1a1a1a',
                }}
              >
                {degreeField}
              </strong>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: '9.5pt',
                  color: '#1a1a1a',
                  textAlign: 'right',
                  flexShrink: 0,
                }}
              >
                {entry.description?.match(/\d+\.\d+/) && (
                  <div>Grade: {entry.description.match(/\d+\.\d+/)?.[0]}</div>
                )}
                {entry.graduationDate && (
                  <div>Graduated: {formatDate(entry.graduationDate)}</div>
                )}
              </div>
            </div>

            {/* School name — italic */}
            {entry.schoolName && (
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: '10pt',
                  fontStyle: 'italic',
                  color: '#1a1a1a',
                }}
              >
                {entry.schoolName}
              </div>
            )}

            {/* Description bullets (if any, excluding grade pattern) */}
            {lines.length > 0 && (
              <ul style={{ margin: '2px 0 0 0', paddingLeft: '18px', listStyleType: 'disc' }}>
                {lines.map((line, i) => (
                  <li
                    key={i}
                    style={{
                      fontFamily: FONT,
                      fontSize: '10pt',
                      lineHeight: '1.5',
                      color: '#1a1a1a',
                      marginBottom: '2px',
                    }}
                  >
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

// ── Skills section — bullet list ──────────────────────────────────────────────

function SkillsSection({ skills }: { skills: SkillEntry[] }) {
  if (!skills.length) return null

  // Group skills into rows of ~4 for a compact bullet list appearance
  const CHUNK = 4
  const rows: SkillEntry[][] = []
  for (let i = 0; i < skills.length; i += CHUNK) {
    rows.push(skills.slice(i, i + CHUNK))
  }

  return (
    <section aria-label="Skills">
      <SectionHeader title="Skills" />
      <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', listStyleType: 'disc' }}>
        {rows.map((row, i) => (
          <li
            key={i}
            style={{
              fontFamily: FONT,
              fontSize: '10pt',
              lineHeight: '1.5',
              color: '#1a1a1a',
              marginBottom: '2px',
            }}
          >
            {row.map((s) => s.name).join(', ')}
          </li>
        ))}
      </ul>
    </section>
  )
}

// ── Certifications section — bullet list ──────────────────────────────────────

function CertificationsSection({ certs }: { certs: CertificationEntry[] }) {
  if (!certs.length) return null
  return (
    <section aria-label="Certifications">
      <SectionHeader title="Certifications" />
      <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', listStyleType: 'disc' }}>
        {certs.map((cert) => (
          <li
            key={cert.id}
            style={{
              fontFamily: FONT,
              fontSize: '10pt',
              lineHeight: '1.5',
              color: '#1a1a1a',
              marginBottom: '2px',
            }}
          >
            {cert.certificationName}
            {cert.issuingOrganization ? ` — ${cert.issuingOrganization}` : ''}
          </li>
        ))}
      </ul>
    </section>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export const CVPreview = memo(function CVPreview({ resume }: CVPreviewProps) {
  const { personalDetails: pd } = resume

  const fullName = [pd.fullName, pd.lastName].filter(Boolean).join(' ')
  const hasName = fullName.trim().length > 0
  const contactParts = [pd.email, pd.phoneNumber, pd.cityState, pd.country].filter(Boolean)
  const linkParts = [
    pd.linkedinUrl,
    pd.githubUrl && `github.com/${pd.githubUrl.replace(/.*github\.com\//i, '')}`,
    pd.portfolioUrl,
  ].filter(Boolean) as string[]
  const contactLine = [...contactParts, ...linkParts].join(' | ')

  const hasSummary = resume.professionalSummary?.trim()
  const hasExperience = resume.experience.length > 0
  const hasEducation = resume.education.length > 0
  const hasSkills = resume.skills.length > 0
  const hasCertifications = resume.certifications.length > 0

  const isEmpty =
    !hasName &&
    !contactLine &&
    !hasSummary &&
    !hasExperience &&
    !hasEducation &&
    !hasSkills &&
    !hasCertifications

  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: '10.5pt',
        lineHeight: '1.5',
        color: '#1a1a1a',
        backgroundColor: '#ffffff',
        padding: '36px 48px 48px',
        maxWidth: '700px',
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
            fontFamily: FONT,
          }}
        >
          Start filling in your details to see the preview.
        </p>
      )}

      {/* ── Header: Full Name (centered, bold, large) ── */}
      {hasName && (
        <h1
          style={{
            fontFamily: FONT,
            fontSize: '20pt',
            fontWeight: 700,
            textAlign: 'center',
            margin: '0 0 4px 0',
            letterSpacing: '0.5px',
            color: '#1a1a1a',
            textTransform: 'uppercase',
          }}
        >
          {fullName}
        </h1>
      )}

      {/* ── Job Target (centered, normal weight) ── */}
      {pd.jobTarget && (
        <p
          style={{
            fontFamily: FONT,
            fontSize: '11pt',
            fontWeight: 400,
            textAlign: 'center',
            margin: '0 0 4px 0',
            color: '#1a1a1a',
          }}
        >
          {pd.jobTarget}
        </p>
      )}

      {/* ── Contact + Links (centered, single line) ── */}
      {contactLine && (
        <p
          style={{
            fontFamily: FONT,
            fontSize: '9.5pt',
            textAlign: 'center',
            margin: '0 0 8px 0',
            color: '#1a1a1a',
          }}
        >
          {contactLine}
        </p>
      )}

      {/* ── Divider after header block ── */}
      {(hasName || contactLine) && (
        <hr style={{ border: 'none', borderTop: '2px solid #1a1a1a', margin: '4px 0 0 0' }} />
      )}

      {/* ── Professional Summary ── */}
      {hasSummary && (
        <section aria-label="Professional Summary">
          <SectionHeader title="Professional Summary" />
          <p
            style={{
              fontFamily: FONT,
              fontSize: '10pt',
              lineHeight: '1.6',
              margin: '4px 0 0 0',
              color: '#1a1a1a',
            }}
          >
            {resume.professionalSummary}
          </p>
        </section>
      )}

      {/* ── Work Experience ── */}
      {hasExperience && <ExperienceSection entries={resume.experience} />}

      {/* ── Education ── */}
      {hasEducation && <EducationSection entries={resume.education} />}

      {/* ── Skills ── */}
      {hasSkills && <SkillsSection skills={resume.skills} />}

      {/* ── Certifications ── */}
      {hasCertifications && <CertificationsSection certs={resume.certifications} />}
    </div>
  )
})
