'use client'

import { useState } from 'react'
import { useResumeStore } from '@/store/resume-store'
import { ResumeCard } from '@/components/resume-list/ResumeCard'
import { CreateResumeModal } from '@/components/modals/CreateResumeModal'
import { Button } from '@/components/ui/button'
import { Plus, FileText } from 'lucide-react'
import { translations } from '@/i18n/translations'

interface ResumeListViewProps {
  onCreateNew: () => void
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}

export function ResumeListView({
  onCreateNew,
  onEdit,
  onDuplicate,
  onDelete,
}: ResumeListViewProps) {
  const [createOpen, setCreateOpen] = useState(false)

  const resumes = useResumeStore((s) => s.resumes)
  const createResume = useResumeStore((s) => s.createResume)
  const language = useResumeStore((s) => s.language)
  const t = translations[language]

  const handleCreate = (title: string) => {
    const id = createResume(title)
    setCreateOpen(false)
    onCreateNew()
    // Navigate to the new resume editor
    onEdit(id)
  }

  const handleOpenCreate = () => {
    setCreateOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.resumeList.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {resumes.length === 0
              ? t.resumeList.empty
              : `${resumes.length} resume${resumes.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="shrink-0">
          <Plus />
          {t.resumeList.createNew}
        </Button>
      </div>

      {/* Empty state */}
      {resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <FileText className="size-7 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-medium">{t.resumeList.empty}</p>
            <p className="text-sm text-muted-foreground">
              {t.resumeList.createNew}
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus />
            {t.resumeList.createNew}
          </Button>
        </div>
      ) : (
        /* Resume grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onEdit={() => onEdit(resume.id)}
              onDuplicate={() => onDuplicate(resume.id)}
              onDelete={() => onDelete(resume.id)}
            />
          ))}
        </div>
      )}

      <CreateResumeModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreate}
      />
    </div>
  )
}
