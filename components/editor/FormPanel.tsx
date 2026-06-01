'use client'

import { memo, useCallback, useState } from 'react'
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  Download,
} from 'lucide-react'
import { SectionHeader } from '@/components/editor/SectionHeader'
import { PersonalDetailsForm } from '@/components/forms/PersonalDetailsForm'
import { ExperienceForm } from '@/components/forms/ExperienceForm'
import { EducationForm } from '@/components/forms/EducationForm'
import { SkillsForm } from '@/components/forms/SkillsForm'
import { CertificationsForm } from '@/components/forms/CertificationsForm'
import { ProfessionalSummaryForm } from '@/components/forms/ProfessionalSummaryForm'
import { ExportPanel } from '@/components/export/ExportPanel'
import { translations } from '@/i18n/translations'
import type { Language } from '@/i18n/translations'
import type {
  PersonalDetails,
  ExperienceEntry,
  EducationEntry,
  SkillEntry,
  CertificationEntry,
  Resume,
} from '@/types/resume'

// Section IDs used for navigation anchors
type SectionId =
  | 'personal'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'export'

interface FormPanelProps {
  resume: Resume
  onChange: (data: Partial<Resume>) => void
  language: Language
}

export const FormPanel = memo(function FormPanel({
  resume,
  onChange,
  language,
}: FormPanelProps) {
  const t = translations[language]

  // Track which sections are expanded (all open by default)
  const [expanded, setExpanded] = useState<Record<SectionId, boolean>>({
    personal: true,
    summary: true,
    experience: true,
    education: true,
    skills: true,
    certifications: true,
    export: true,
  })

  const toggle = useCallback((id: SectionId) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const scrollToSection = useCallback((id: SectionId) => {
    const el = document.getElementById(`section-${id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setExpanded((prev) => ({ ...prev, [id]: true }))
  }, [])

  // ── Section change handlers ──────────────────────────────────────────────

  const handlePersonalDetailsChange = useCallback(
    (values: Partial<PersonalDetails>) => {
      onChange({
        personalDetails: {
          ...resume.personalDetails,
          ...values,
        },
      })
    },
    [onChange, resume.personalDetails]
  )

  const handleExperienceChange = useCallback(
    (entries: ExperienceEntry[]) => {
      onChange({ experience: entries })
    },
    [onChange]
  )

  const handleEducationChange = useCallback(
    (entries: EducationEntry[]) => {
      onChange({ education: entries })
    },
    [onChange]
  )

  const handleSkillsChange = useCallback(
    (skills: SkillEntry[]) => {
      onChange({ skills })
    },
    [onChange]
  )

  const handleCertificationsChange = useCallback(
    (entries: CertificationEntry[]) => {
      onChange({ certifications: entries })
    },
    [onChange]
  )

  const handleSummaryChange = useCallback(
    (summary: string) => {
      onChange({ professionalSummary: summary })
    },
    [onChange]
  )

  // ── Section tab config ───────────────────────────────────────────────────

  const sectionTabs: { id: SectionId; label: string; icon: React.ReactNode }[] =
    [
      {
        id: 'personal',
        label: t.sections.personalDetails,
        icon: <User className="h-3.5 w-3.5" />,
      },
      {
        id: 'summary',
        label: t.sections.professionalSummary,
        icon: <FileText className="h-3.5 w-3.5" />,
      },
      {
        id: 'experience',
        label: t.sections.experience,
        icon: <Briefcase className="h-3.5 w-3.5" />,
      },
      {
        id: 'education',
        label: t.sections.education,
        icon: <GraduationCap className="h-3.5 w-3.5" />,
      },
      {
        id: 'skills',
        label: t.sections.skills,
        icon: <Wrench className="h-3.5 w-3.5" />,
      },
      {
        id: 'certifications',
        label: t.sections.certifications,
        icon: <Award className="h-3.5 w-3.5" />,
      },
      {
        id: 'export',
        label: t.sections.export,
        icon: <Download className="h-3.5 w-3.5" />,
      },
    ]

  return (
    <div className="flex h-full flex-col">
      {/* Sticky section navigation tabs — horizontally scrollable on mobile */}
      <nav
        aria-label="Form sections"
        className="sticky top-0 z-10 flex gap-1 overflow-x-auto border-b bg-background px-2 py-2 scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
      >
        {sectionTabs.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => scrollToSection(id)}
            className="flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title={label}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Scrollable form content */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        <div className="flex flex-col gap-2">

          {/* Personal Details */}
          <section id="section-personal" aria-labelledby="heading-personal">
            <SectionHeader
              title={t.sections.personalDetails}
              isExpanded={expanded.personal}
              onToggle={() => toggle('personal')}
              icon={<User className="h-4 w-4" />}
            />
            {expanded.personal && (
              <div className="mt-3 px-1">
                <PersonalDetailsForm
                  defaultValues={resume.personalDetails}
                  onChange={handlePersonalDetailsChange}
                />
              </div>
            )}
          </section>

          {/* Professional Summary */}
          <section id="section-summary" aria-labelledby="heading-summary">
            <SectionHeader
              title={t.sections.professionalSummary}
              isExpanded={expanded.summary}
              onToggle={() => toggle('summary')}
              icon={<FileText className="h-4 w-4" />}
            />
            {expanded.summary && (
              <div className="mt-3 px-1">
                <ProfessionalSummaryForm
                  value={resume.professionalSummary ?? ''}
                  onChange={handleSummaryChange}
                  language={language}
                />
              </div>
            )}
          </section>

          {/* Experience */}
          <section id="section-experience" aria-labelledby="heading-experience">
            <SectionHeader
              title={t.sections.experience}
              isExpanded={expanded.experience}
              onToggle={() => toggle('experience')}
              icon={<Briefcase className="h-4 w-4" />}
            />
            {expanded.experience && (
              <div className="mt-3 px-1">
                <ExperienceForm
                  entries={resume.experience}
                  onChange={handleExperienceChange}
                />
              </div>
            )}
          </section>

          {/* Education */}
          <section id="section-education" aria-labelledby="heading-education">
            <SectionHeader
              title={t.sections.education}
              isExpanded={expanded.education}
              onToggle={() => toggle('education')}
              icon={<GraduationCap className="h-4 w-4" />}
            />
            {expanded.education && (
              <div className="mt-3 px-1">
                <EducationForm
                  entries={resume.education}
                  onChange={handleEducationChange}
                />
              </div>
            )}
          </section>

          {/* Skills */}
          <section id="section-skills" aria-labelledby="heading-skills">
            <SectionHeader
              title={t.sections.skills}
              isExpanded={expanded.skills}
              onToggle={() => toggle('skills')}
              icon={<Wrench className="h-4 w-4" />}
            />
            {expanded.skills && (
              <div className="mt-3 px-1">
                <SkillsForm
                  skills={resume.skills}
                  onChange={handleSkillsChange}
                  language={language}
                />
              </div>
            )}
          </section>

          {/* Certifications */}
          <section
            id="section-certifications"
            aria-labelledby="heading-certifications"
          >
            <SectionHeader
              title={t.sections.certifications}
              isExpanded={expanded.certifications}
              onToggle={() => toggle('certifications')}
              icon={<Award className="h-4 w-4" />}
            />
            {expanded.certifications && (
              <div className="mt-3 px-1">
                <CertificationsForm
                  entries={resume.certifications}
                  onChange={handleCertificationsChange}
                />
              </div>
            )}
          </section>

          {/* Export */}
          <section id="section-export" aria-labelledby="heading-export">
            <SectionHeader
              title={t.sections.export}
              isExpanded={expanded.export}
              onToggle={() => toggle('export')}
              icon={<Download className="h-4 w-4" />}
            />
            {expanded.export && (
              <div className="mt-3 px-1">
                <ExportPanel resume={resume} />
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  )
})
