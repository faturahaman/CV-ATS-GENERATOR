'use client'

import { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
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

export function ResumeCard({
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

  const progressColor =
    progress >= 80
      ? 'bg-green-500'
      : progress >= 50
        ? 'bg-blue-500'
        : progress >= 25
          ? 'bg-yellow-500'
          : 'bg-muted-foreground/30'

  const atsScoreColor =
    atsScore >= 80
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      : atsScore >= 50
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        : atsScore > 0
          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          : 'bg-muted text-muted-foreground'

  const handleDeleteConfirm = () => {
    onDelete()
    setDeleteOpen(false)
  }

  return (
    <>
      <Card className="flex flex-col transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <CardTitle className="truncate">{resume.title}</CardTitle>
            </div>

            {/* ATS Score badge */}
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${atsScoreColor}`}
              aria-label={`${t.resumeList.atsScore}: ${atsScore > 0 ? atsScore : '—'}`}
            >
              {atsScore > 0 ? `${atsScore}` : '—'}
            </span>
          </div>

          {resume.personalDetails.jobTarget && (
            <CardDescription className="truncate">
              {resume.personalDetails.jobTarget}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {/* Completion progress */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t.resumeList.completion}</span>
              <span className="font-medium tabular-nums">{progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${progressColor}`}
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${progress}% complete`}
              />
            </div>
          </div>

          {updatedAt && (
            <p className="text-xs text-muted-foreground">
              Updated {updatedAt}
            </p>
          )}
        </CardContent>

        <CardFooter className="mt-auto gap-2">
          {/* Edit button */}
          <Button
            className="flex-1"
            size="sm"
            onClick={onEdit}
            aria-label={`${t.resumeList.edit} ${resume.title}`}
          >
            <Edit />
            {t.resumeList.edit}
          </Button>

          {/* Duplicate button */}
          <Button
            variant="outline"
            size="icon-sm"
            onClick={onDuplicate}
            aria-label={`${t.resumeList.duplicate} ${resume.title}`}
            title={t.resumeList.duplicate}
          >
            <Copy />
          </Button>

          {/* Delete button */}
          <Button
            variant="destructive"
            size="icon-sm"
            onClick={() => setDeleteOpen(true)}
            aria-label={`${t.resumeList.delete} ${resume.title}`}
            title={t.resumeList.delete}
          >
            <Trash2 />
          </Button>
        </CardFooter>
      </Card>

      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        resumeTitle={resume.title}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
}
