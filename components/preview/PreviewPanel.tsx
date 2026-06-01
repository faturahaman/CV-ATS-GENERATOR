'use client'

import { memo } from 'react'
import { CVPreview } from '@/components/preview/CVPreview'
import type { Resume } from '@/types/resume'

interface PreviewPanelProps {
  resume: Resume
}

export const PreviewPanel = memo(function PreviewPanel({ resume }: PreviewPanelProps) {
  const progress = resume.metadata.completionProgress

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Progress bar */}
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

      {/* CV preview — scrollable */}
      <div className="flex-1 overflow-auto rounded-xl border bg-white shadow-sm">
        <CVPreview resume={resume} />
      </div>
    </div>
  )
})
