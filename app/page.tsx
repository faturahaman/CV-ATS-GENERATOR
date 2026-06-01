'use client'

import { useRouter } from 'next/navigation'
import { useResumeStore } from '@/store/resume-store'
import { ResumeListView } from '@/components/resume-list/ResumeListView'
import { Header } from '@/components/layout/Header'

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

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <ResumeListView
          onCreateNew={() => {}}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      </main>
    </>
  )
}
