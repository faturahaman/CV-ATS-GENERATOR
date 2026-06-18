'use client'

import { useRouter } from 'next/navigation'
import { useResumeStore } from '@/store/resume-store'
import { ResumeListView } from '@/components/resume-list/ResumeListView'
import { Header } from '@/components/layout/Header'
import { translations } from '@/i18n/translations'
import { ShieldCheck } from 'lucide-react'


export default function HomePage() {
  const router = useRouter()
  const deleteResume = useResumeStore((s) => s.deleteResume)
  const duplicateResume = useResumeStore((s) => s.duplicateResume)
  const language = useResumeStore((s) => s.language)
  const t = translations[language]

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
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <ResumeListView
          onCreateNew={() => { }}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      </main>
      <footer className="border-t border-border/60 py-6">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 flex flex-col items-center gap-2 text-center">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span>
              <span>
                <ShieldCheck className="h-4 w-4" />
              </span>
            </span>
            <span>
              {t.privacy.message}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}{' '}
            <a
              href="https://rifatur.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              rifatur.io
            </a>
            . All rights reserved.
          </p>
        </div>
      </footer>
    </>
  )
}
