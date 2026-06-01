'use client'

import { useState, memo } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal'
import { Edit, Copy, Trash2, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useResumeStore } from '@/store/resume-store'
import { translations } from '@/i18n/translations'
import type { Resume } from '@/types/resume'

interface ResumeCardProps {
  resume: Resume
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}

export const ResumeCard = memo(function ResumeCard({
  resume,
  onEdit,
  onDuplicate,
  onDelete,
}: ResumeCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const language = useResumeStore((s) => s.language)
  const t = translations[language]

  const progress = resume.metadata.completionProgress
  const atsScore = resume.metadata.atsScore
  const updatedAt = formatDate(resume.updatedAt)

  const atsScoreColor =
    atsScore >= 80
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      : atsScore >= 50
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        : atsScore > 0
          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          : 'bg-muted text-muted-foreground'

  const progressColor =
    progress >= 80
      ? 'bg-green-500'
      : progress >= 50
        ? 'bg-primary'
        : progress >= 25
          ? 'bg-yellow-500'
          : 'bg-muted-foreground/30'

  const handleDeleteConfirm = () => {
    onDelete()
    setDeleteOpen(false)
  }

  return (
    <>
      <article className="group flex items-start justify-between gap-6 py-7 hover:bg-muted/30 -mx-4 px-4 rounded-lg transition-all duration-200 ease-out">
        {/* Left: icon + text */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* File icon thumbnail */}
          <div className="shrink-0 flex size-11 items-center justify-center rounded-lg bg-muted border border-border/60 mt-0.5">
            <FileText className="size-5 text-muted-foreground" />
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            {/* Title */}
            <button
              type="button"
              onClick={onEdit}
              className="text-left"
              aria-label={`Edit ${resume.title}`}
            >
              <h2
                className="text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors duration-200 ease-out line-clamp-1"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                {resume.title}
              </h2>
            </button>

            {/* Job target */}
            {resume.personalDetails.jobTarget && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {resume.personalDetails.jobTarget}
              </p>
            )}

            {/* Metadata strip */}
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              {/* Progress bar */}
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor}`}
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${progress}% complete`}
                  />
                </div>
                <span className="text-xs text-muted-foreground tabular-nums font-medium">
                  {progress}%
                </span>
              </div>

              {updatedAt && (
                <>
                  <span className="text-muted-foreground/40 text-xs">·</span>
                  <span className="text-xs text-muted-foreground">
                    Updated {updatedAt}
                  </span>
                </>
              )}

              {atsScore > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${atsScoreColor}`}
                  aria-label={`ATS Score: ${atsScore}`}
                >
                  ATS {atsScore}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: action buttons — always visible */}
        <div className="flex shrink-0 items-center gap-1 pt-0.5">
          <Button
            size="sm"
            onClick={onEdit}
            className="rounded-full px-4 text-xs font-medium h-8"
            aria-label={`${t.resumeList.edit} ${resume.title}`}
          >
            <Edit className="size-3 mr-1.5" />
            {t.resumeList.edit}
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onDuplicate}
            aria-label={`${t.resumeList.duplicate} ${resume.title}`}
            title={t.resumeList.duplicate}
            className="text-muted-foreground hover:text-foreground h-8 w-8"
          >
            <Copy className="size-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDeleteOpen(true)}
            aria-label={`${t.resumeList.delete} ${resume.title}`}
            title={t.resumeList.delete}
            className="text-muted-foreground hover:text-destructive h-8 w-8"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </article>

      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        resumeTitle={resume.title}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
})
