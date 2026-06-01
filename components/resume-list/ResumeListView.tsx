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
    onEdit(id)
  }

  const handleOpenCreate = () => {
    setCreateOpen(true)
  }

  return (
    <div className="flex flex-col">
      {/* Page header — editorial style */}
      <div className="border-b border-border/60 pb-8 mb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1
              className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-2"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              {t.resumeList.title}
            </h1>
            <p className="text-base text-muted-foreground">
              {resumes.length === 0
                ? t.resumeList.empty
                : `${resumes.length} resume${resumes.length === 1 ? '' : 's'}`}
            </p>
          </div>

          <Button
            onClick={handleOpenCreate}
            className="shrink-0 gap-2 rounded-full px-5 py-2 text-sm font-medium"
          >
            <Plus className="size-4" />
            {t.resumeList.createNew}
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 py-24 text-center animate-in fade-in-0 slide-in-from-bottom-3 duration-400 ease-out">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <FileText className="size-7 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-2 max-w-sm">
            <p
              className="text-xl font-semibold text-foreground"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              No resumes yet
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Create your first ATS-friendly resume and let AI help you craft the perfect content.
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="rounded-full px-6 py-2 text-sm font-medium"
          >
            <Plus className="size-4 mr-1.5" />
            {t.resumeList.createNew}
          </Button>
        </div>
      ) : (
        /* Resume list — Medium-style article list */
        <div className="flex flex-col divide-y divide-border/60">
          {resumes.map((resume, idx) => (
            <div
              key={resume.id}
              className="animate-in fade-in-0 slide-in-from-bottom-2 ease-out"
              style={{ animationDuration: '300ms', animationDelay: `${idx * 40}ms`, animationFillMode: 'both' }}
            >
              <ResumeCard
                resume={resume}
                onEdit={() => onEdit(resume.id)}
                onDuplicate={() => onDuplicate(resume.id)}
                onDelete={() => onDelete(resume.id)}
              />
            </div>
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
