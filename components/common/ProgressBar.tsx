'use client'

import { memo } from 'react'
import { translations } from '@/i18n/translations'
import type { Language } from '@/i18n/translations'

interface ProgressBarProps {
  progress: number          // 0–100
  incompleteSections?: string[]
  language: Language
}

export const ProgressBar = memo(function ProgressBar({
  progress,
  incompleteSections = [],
  language,
}: ProgressBarProps) {
  const t = translations[language]

  // Clamp to valid range
  const clamped = Math.min(100, Math.max(0, Math.round(progress)))

  const barColor =
    clamped >= 80
      ? 'bg-green-500'
      : clamped >= 50
        ? 'bg-blue-500'
        : clamped >= 25
          ? 'bg-yellow-500'
          : 'bg-muted-foreground/30'

  return (
    <div className="space-y-1.5">
      {/* Label row */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{t.progress.title}</span>
        <span className="tabular-nums font-semibold text-foreground">
          {clamped}%
        </span>
      </div>

      {/* Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${t.progress.title}: ${clamped}%`}
        />
      </div>

      {/* Completion message */}
      {clamped === 100 && (
        <p className="text-xs font-medium text-green-600">
          {t.progress.complete}
        </p>
      )}

      {/* Incomplete sections list */}
      {clamped < 100 && incompleteSections.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <span>{t.progress.incompleteSections} </span>
          <span>{incompleteSections.join(', ')}</span>
        </div>
      )}
    </div>
  )
})
