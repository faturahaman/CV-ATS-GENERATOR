'use client'

import { memo, useState } from 'react'
import { Eye, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CVPreview } from '@/components/preview/CVPreview'
import { ATSScoreDisplay } from '@/components/ats/ATSScoreDisplay'
import type { Resume } from '@/types/resume'
import type { Language } from '@/i18n/translations'

interface PreviewPanelProps {
  resume: Resume
  language?: Language
  isOnline?: boolean
}

type Tab = 'preview' | 'ats'

export const PreviewPanel = memo(function PreviewPanel({
  resume,
  language = 'EN',
  isOnline = true,
}: PreviewPanelProps) {
  const [tab, setTab] = useState<Tab>('preview')
  const progress = resume.metadata.completionProgress
  const atsScore = resume.metadata.atsScore

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Completion progress bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Completion</span>
          <span className="tabular-nums font-medium">{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              progress >= 80
                ? 'bg-green-500'
                : progress >= 50
                  ? 'bg-blue-500'
                  : progress >= 25
                    ? 'bg-yellow-500'
                    : 'bg-muted-foreground/30'
            }`}
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Resume ${progress}% complete`}
          />
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex shrink-0 rounded-xl border bg-muted/40 p-1">
        <TabButton
          active={tab === 'preview'}
          onClick={() => setTab('preview')}
          icon={<Eye className="h-3.5 w-3.5" />}
          label="Preview"
        />
        <TabButton
          active={tab === 'ats'}
          onClick={() => setTab('ats')}
          icon={<BarChart2 className="h-3.5 w-3.5" />}
          label="ATS Score"
          badge={atsScore != null ? String(atsScore) : undefined}
        />
      </div>

      {/* Tab content */}
      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === 'preview' && (
          <div className="h-full overflow-auto rounded-xl border bg-white shadow-sm">
            <CVPreview resume={resume} />
          </div>
        )}
        {tab === 'ats' && (
          <div className="h-full overflow-y-auto rounded-xl border bg-background p-4 shadow-sm animate-in fade-in-0 duration-200 ease-out">
            <ATSScoreDisplay
              resume={resume}
              language={language}
              isOnline={isOnline}
            />
          </div>
        )}
      </div>
    </div>
  )
})

// ── Tab button ────────────────────────────────────────────────────────────────

interface TabButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  badge?: string
}

function TabButton({ active, onClick, icon, label, badge }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all duration-200 ease-out',
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

