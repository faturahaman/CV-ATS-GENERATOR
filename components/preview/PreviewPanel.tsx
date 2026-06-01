'use client'

import { memo } from 'react'
import { CVPreview } from '@/components/preview/CVPreview'
import { ATSScoreDisplay } from '@/components/ats/ATSScoreDisplay'
import type { Resume } from '@/types/resume'
import type { Language } from '@/i18n/translations'

interface PreviewPanelProps {
  resume: Resume
  language?: Language
  isOnline?: boolean
}

export const PreviewPanel = memo(function PreviewPanel({
  resume,
  language = 'EN',
  isOnline = true,
}: PreviewPanelProps) {
  const progress = resume.metadata.completionProgress

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Completion progress bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Completion</span>
          <span className="tabular-nums font-medium">{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
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

      {/* CV preview — scrollable */}
      <div className="flex-1 overflow-auto rounded-xl border bg-white shadow-sm">
        <CVPreview resume={resume} />
      </div>

      {/* ATS Score Checker */}
      <div className="rounded-xl border bg-background p-4 shadow-sm">
        <ATSScoreDisplay
          resume={resume}
          language={language}
          isOnline={isOnline}
        />
      </div>
    </div>
  )
})
