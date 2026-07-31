'use client'

import { useState } from 'react'
import { Download, FileText, Loader2, CheckCircle2 } from 'lucide-react'
import { SupportModal } from '@/components/modals/SupportModal'
import { useResumeStore } from '@/store/resume-store'
import { translations } from '@/i18n/translations'
import { cn } from '@/lib/utils'
import type { Resume } from '@/types/resume'

interface ExportPanelProps {
  resume: Resume
}

type ExportFormat = 'pdf' | 'docx'

export function ExportPanel({ resume }: ExportPanelProps) {
  const language = useResumeStore((s) => s.language)
  const t = translations[language]

  const [busy, setBusy] = useState<ExportFormat | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [supportOpen, setSupportOpen] = useState(false)

  const hasContent =
    resume.personalDetails.fullName?.trim() ||
    resume.experience.length > 0 ||
    resume.education.length > 0 ||
    resume.skills.length > 0

  const handleExport = async (format: ExportFormat) => {
    if (busy) return
    setBusy(format)
    setError(null)
    try {
      if (format === 'pdf') {
        const { exportToPDF } = await import('@/lib/export-pdf')
        exportToPDF(resume)
      } else {
        const { exportToDocx } = await import('@/lib/export-docx')
        await exportToDocx(resume)
      }
      // Small delay so the button's spinner is perceptible on fast machines,
      // then surface the support modal as a gentle nudge.
      setSupportOpen(true)
    } catch (err) {
      console.error(`${format.toUpperCase()} export failed:`, err)
      setError(format === 'pdf' ? t.errors.failedPdf : t.errors.failedDocx)
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground leading-relaxed">{t.export.intro}</p>

        <div className="flex flex-col gap-2.5">
          {/* PDF — primary, recommended */}
          <ExportCard
            icon={<Download className="h-4 w-4" />}
            title={t.export.exportAsPdf}
            description={t.export.pdfDescription}
            recommended={t.export.recommended}
            loading={busy === 'pdf'}
            loadingLabel={t.export.generatingPdf}
            disabled={!hasContent || busy !== null}
            variant="primary"
            onClick={() => handleExport('pdf')}
          />

          {/* DOCX — secondary */}
          <ExportCard
            icon={<FileText className="h-4 w-4" />}
            title={t.export.exportAsDocx}
            description={t.export.docxDescription}
            loading={busy === 'docx'}
            loadingLabel={t.export.generatingDocx}
            disabled={!hasContent || busy !== null}
            variant="outline"
            onClick={() => handleExport('docx')}
          />
        </div>

        {!hasContent && (
          <p className="text-xs text-muted-foreground">{t.export.addContentFirst}</p>
        )}

        {error && (
          <p
            role="alert"
            className="text-xs text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-200"
          >
            {error}
          </p>
        )}
      </div>

      <SupportModal open={supportOpen} onOpenChange={setSupportOpen} />
    </>
  )
}

// ── Export card — a big tappable button with title + description ────────────────

interface ExportCardProps {
  icon: React.ReactNode
  title: string
  description: string
  recommended?: string
  loading: boolean
  loadingLabel: string
  disabled: boolean
  variant: 'primary' | 'outline'
  onClick: () => void
}

function ExportCard({
  icon,
  title,
  description,
  recommended,
  loading,
  loadingLabel,
  disabled,
  variant,
  onClick,
}: ExportCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={title}
      aria-busy={loading}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl border px-4 py-3 text-left',
        'transition-all duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50',
        'active:translate-y-px',
        variant === 'primary'
          ? 'border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30'
          : 'border-border bg-background hover:bg-muted/50 hover:border-border'
      )}
    >
      {/* Icon disc */}
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 ease-out group-hover:scale-105',
          variant === 'primary'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      </span>

      {/* Text */}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {loading ? loadingLabel : title}
          </span>
          {recommended && !loading && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              <CheckCircle2 className="h-2.5 w-2.5" />
              {recommended}
            </span>
          )}
        </span>
        <span className="text-xs text-muted-foreground leading-snug">{description}</span>
      </span>
    </button>
  )
}
