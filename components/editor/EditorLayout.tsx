'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useResumeStore } from '@/store/resume-store'
import { FormPanel } from '@/components/editor/FormPanel'
import { PreviewPanel } from '@/components/preview/PreviewPanel'
import { useOnline } from '@/hooks/use-online'
import { FileText, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Language } from '@/i18n/translations'
import type { Resume } from '@/types/resume'

// ── Mobile tab types ──────────────────────────────────────────────────────────

type MobileTab = 'form' | 'preview'

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

  const [localResume, setLocalResume] = useState<Resume | null>(() => storeResume ?? null)
  const resumeRef = useRef<Resume | null>(storeResume ?? null)
  const syncedRef = useRef(false)

  // Mobile tab state — start on form
  const [mobileTab, setMobileTab] = useState<MobileTab>('form')

  useEffect(() => {
    if (storeResume && !syncedRef.current) {
      syncedRef.current = true
      resumeRef.current = storeResume
      setLocalResume(storeResume)
    }
  }, [storeResume])

  useEffect(() => {
    resumeRef.current = localResume ?? storeResume ?? null
  }, [localResume, storeResume])

  const handleChange = useCallback(
    (data: Partial<Resume>) => {
      const current = resumeRef.current
      if (!current) return
      const updated: Resume = { ...current, ...data, updatedAt: new Date() }
      setLocalResume(updated)
      resumeRef.current = updated
      updateResume(resumeId, data)
    },
    [resumeId, updateResume]
  )

  const previewResume = useMemo<Resume | null>(() => {
    if (!localResume || !storeResume) return storeResume ?? null
    return { ...localResume, metadata: storeResume.metadata }
  }, [localResume, storeResume])

  if (!previewResume) return null

  const progress = previewResume.metadata.completionProgress

  return (
    <>
      {/* ── Desktop layout (lg+): side-by-side ── */}
      <div className="hidden lg:flex lg:h-full lg:gap-6">
        <div className="w-[40%] min-w-0">
          <FormPanel resume={previewResume} onChange={handleChange} language={language} />
        </div>
        <div className="w-[60%] min-w-0">
          <PreviewPanel resume={previewResume} language={language} isOnline={isOnline} />
        </div>
      </div>

      {/* ── Mobile layout (< lg): tab-based ── */}
      <div className="flex flex-col lg:hidden" style={{ height: 'calc(100dvh - 6.5rem)' }}>
        {/* Mobile tab bar */}
        <div className="flex shrink-0 rounded-xl border bg-muted/40 p-1 mb-3">
          <MobileTabButton
            active={mobileTab === 'form'}
            onClick={() => setMobileTab('form')}
            icon={<FileText className="h-4 w-4" />}
            label="Edit"
          />
          <MobileTabButton
            active={mobileTab === 'preview'}
            onClick={() => setMobileTab('preview')}
            icon={<Eye className="h-4 w-4" />}
            label="Preview"
            badge={progress > 0 ? `${progress}%` : undefined}
          />
        </div>

        {/* Tab content — fills remaining height */}
        <div className="min-h-0 flex-1 overflow-hidden">
          {mobileTab === 'form' && (
            <div className="h-full overflow-hidden rounded-xl border bg-background">
              <FormPanel resume={previewResume} onChange={handleChange} language={language} />
            </div>
          )}
          {mobileTab === 'preview' && (
            <div className="h-full overflow-y-auto">
              <PreviewPanel resume={previewResume} language={language} isOnline={isOnline} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Mobile tab button ─────────────────────────────────────────────────────────

interface MobileTabButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  badge?: string
}

function MobileTabButton({ active, onClick, icon, label, badge }: MobileTabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all',
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {icon}
      {label}
      {badge && (
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
            active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          )}
        >
          {badge}
        </span>
      )}
    </button>
  )
}
