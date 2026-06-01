'use client'

import { useRouter } from 'next/navigation'
import { useResumeStore } from '@/store/resume-store'
import { ResumeListView } from '@/components/resume-list/ResumeListView'

export default function HomePage() {
  const router = useRouter()
  const deleteResume = useResumeStore((s) => s.deleteResume)
  const duplicateResume = useResumeStore((s) => s.duplicateResume)

  const handleEdit = (id: string) => {
    router.push(`/resumes/${id}`)
  }

  const handleDuplicate = (id: string) => {
    duplicateResume(id)
  }

  const handleDelete = (id: string) => {
    deleteResume(id)
  }

  const handleCreateNew = () => {
    // Navigation to the new resume is handled inside ResumeListView via onEdit
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <ResumeListView
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />
    </main>
  )
}
