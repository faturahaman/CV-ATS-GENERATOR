'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useResumeStore } from '@/store/resume-store'
import { FormPanel } from '@/components/editor/FormPanel'
import { PreviewPanel } from '@/components/preview/PreviewPanel'
import { useOnline } from '@/hooks/use-online'
import type { Language } from '@/i18n/translations'
import type { Resume } from '@/types/resume'

interface EditorLayoutProps {
  resumeId: string
}

export function EditorLayout({ resumeId }: EditorLayoutProps) {
  const updateResume = useResumeStore((s) => s.updateResume)
  const language = useResumeStore((s) => s.language) as Language
  const isOnline = useOnline()
  const storeResume = useResumeStore((s) =>
    s.resumes.find((r) => r.id === resumeId)
  )

  // Initialise local state lazily — if the store already has the resume
  // (e.g. navigating back to an open editor), use it immediately.
  // If the store hasn't hydrated yet, start with null and let the ref
  // track the latest value so handleChange never reads stale data.
  const [localResume, setLocalResume] = useState<Resume | null>(() => storeResume ?? null)

  // Keep a ref to the latest resume so handleChange never closes over a stale value.
  const resumeRef = useRef<Resume | null>(storeResume ?? null)

  // When the Zustand persist middleware finishes rehydrating from localStorage,
  // storeResume will change from undefined → Resume. Sync that into local state
  // exactly once (when localResume is still null).
  // We use a ref guard instead of putting localResume in the dep array to avoid
  // the "setState in effect" lint rule triggering on every render.
  const syncedRef = useRef(false)
  useEffect(() => {
    if (storeResume && !syncedRef.current) {
      syncedRef.current = true
      resumeRef.current = storeResume
      setLocalResume(storeResume)
    }
  }, [storeResume])

  // Keep ref in sync whenever local state updates
  useEffect(() => {
    resumeRef.current = localResume ?? storeResume ?? null
  }, [localResume, storeResume])

  const handleChange = useCallback(
    (data: Partial<Resume>) => {
      const current = resumeRef.current
      if (!current) return

      const updated: Resume = {
        ...current,
        ...data,
        updatedAt: new Date(),
      }

      // Update local state immediately for instant preview
      setLocalResume(updated)
      resumeRef.current = updated

      // Persist to Zustand store (triggers localStorage via persist middleware)
      updateResume(resumeId, data)
    },
    [resumeId, updateResume]
  )

  // Merge store metadata (completionProgress) back into local resume so the
  // progress bar stays accurate after the store recalculates it.
  const previewResume = useMemo<Resume | null>(() => {
    if (!localResume || !storeResume) return storeResume ?? null
    return {
      ...localResume,
      metadata: storeResume.metadata,
    }
  }, [localResume, storeResume])

  if (!previewResume) return null

  return (
    <div className="flex h-full flex-col gap-4 lg:flex-row lg:gap-6">
      {/* Form panel — 40% on desktop, full width on mobile */}
      <div className="w-full lg:w-[40%] lg:min-w-0">
        <FormPanel
          resume={previewResume}
          onChange={handleChange}
          language={language}
        />
      </div>

      {/* Preview panel — 60% on desktop, full width on mobile */}
      <div className="w-full lg:w-[60%] lg:min-w-0">
        <PreviewPanel resume={previewResume} language={language} isOnline={isOnline} />
      </div>
    </div>
  )
}
