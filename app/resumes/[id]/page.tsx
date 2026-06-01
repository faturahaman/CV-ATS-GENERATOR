'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useResumeStore } from '@/store/resume-store'
import { EditorLayout } from '@/components/editor/EditorLayout'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function ResumeEditorPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === 'string' ? params.id : ''

  const resume = useResumeStore((s) => s.resumes.find((r) => r.id === id))
  const setCurrentResume = useResumeStore((s) => s.setCurrentResume)

  // Track whether Zustand has finished rehydrating from localStorage.
  // We give it one render cycle before deciding the resume is missing.
  const [hydrated, setHydrated] = useState(false)
  const hydratedRef = useRef(false)

  useEffect(() => {
    if (!hydratedRef.current) {
      hydratedRef.current = true
      // Allow one tick for the persist middleware to rehydrate
      const t = setTimeout(() => setHydrated(true), 0)
      return () => clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    if (!id) return
    if (!hydrated) return   // wait for rehydration before redirecting
    if (!resume) {
      router.replace('/')
      return
    }
    setCurrentResume(id)
    return () => {
      setCurrentResume(null)
    }
  }, [id, resume, router, setCurrentResume, hydrated])

  // Show nothing while hydrating or if resume is not yet available
  if (!resume) return null

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      {/* Editor header */}
      <div className="sticky top-14 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-12 w-full max-w-screen-xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft />
              Resumes
            </Link>
          </Button>

          <div className="h-4 w-px bg-border" aria-hidden />

          <h1 className="truncate text-sm font-medium">{resume.title}</h1>
        </div>
      </div>

      {/* Editor body */}
      <div className="mx-auto w-full max-w-screen-xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <EditorLayout resumeId={id} />
      </div>
    </main>
  )
}
