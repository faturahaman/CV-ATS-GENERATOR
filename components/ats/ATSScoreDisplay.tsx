'use client'

/**
 * ATSScoreDisplay Component
 *
 * Displays the ATS (Applicant Tracking System) score for a resume.
 * Features:
 * - Large numeric score indicator with color coding
 * - "Check ATS Score" button (calls calculateATSScore from useAI hook)
 * - Score breakdown for 7 categories with progress bars
 * - Top issues list and quick wins list
 * - Loading spinner while calculating
 * - "Not checked yet" initial state
 * - Disabled button when offline
 */

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useAI } from '@/hooks/use-ai'
import { translations } from '@/i18n/translations'
import type { Resume } from '@/types/resume'
import type { Language } from '@/i18n/translations'
import type { ATSScoreResponse } from '@/hooks/use-ai'
import { Loader2, AlertCircle, Zap, BarChart2 } from 'lucide-react'

interface ATSScoreDisplayProps {
  resume: Resume
  language: Language
  isOnline: boolean
}

/**
 * Returns Tailwind color classes based on the score value.
 * - Red  : score < 40
 * - Yellow: 40 <= score <= 70
 * - Green : score > 70
 */
function getScoreColor(score: number): {
  text: string
  bg: string
  ring: string
  bar: string
} {
  if (score < 40) {
    return {
      text: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/30',
      ring: 'ring-red-200 dark:ring-red-800',
      bar: 'bg-red-500',
    }
  }
  if (score <= 70) {
    return {
      text: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
      ring: 'ring-yellow-200 dark:ring-yellow-800',
      bar: 'bg-yellow-500',
    }
  }
  return {
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/30',
    ring: 'ring-green-200 dark:ring-green-800',
    bar: 'bg-green-500',
  }
}

/**
 * A single labeled progress bar row for the score breakdown.
 */
function CategoryBar({
  label,
  score,
}: {
  label: string
  score: number
}) {
  const colors = getScoreColor(score)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className={`font-semibold ${colors.text}`}>{score}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </div>
    </div>
  )
}

export function ATSScoreDisplay({
  resume,
  language,
  isOnline,
}: ATSScoreDisplayProps) {
  const t = translations[language]
  const { calculateATSScore, isLoading, error } = useAI()
  const [scoreData, setScoreData] = useState<ATSScoreResponse | null>(null)

  const handleCheckScore = useCallback(async () => {
    try {
      const result = await calculateATSScore(resume, language)
      if (result) {
        setScoreData(result)
      }
    } catch {
      // Error is already captured in the useAI hook's error state
    }
  }, [calculateATSScore, resume, language])

  const scoreColors = scoreData ? getScoreColor(scoreData.score) : null

  const categoryKeys = [
    'contactInfo',
    'summary',
    'experience',
    'education',
    'skills',
    'certifications',
    'formatting',
  ] as const

  return (
    <div className="flex flex-col gap-4">
      {/* Header + Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{t.atsScore.title}</h2>
        <Button
          size="sm"
          onClick={handleCheckScore}
          disabled={!isOnline || isLoading}
          aria-label={t.atsScore.checkScore}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              {t.ai.generating}
            </>
          ) : (
            t.atsScore.checkScore
          )}
        </Button>
      </div>

      {/* Offline notice */}
      {!isOnline && (
        <p className="text-xs text-muted-foreground">
          {t.status.offlineAiDisabled}
        </p>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Not checked yet */}
      {!isLoading && !scoreData && !error && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-8 text-center text-muted-foreground">
          <BarChart2 className="size-8 opacity-40" />
          <p className="text-sm">{t.atsScore.notChecked}</p>
        </div>
      )}

      {/* Loading spinner */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="size-8 animate-spin" />
          <p className="text-sm">{t.ai.generating}</p>
        </div>
      )}

      {/* Score results */}
      {scoreData && !isLoading && (
        <div className="flex flex-col gap-5">
          {/* Overall score circle */}
          <div
            className={`flex flex-col items-center justify-center gap-1 rounded-xl p-6 ring-1 ${scoreColors!.bg} ${scoreColors!.ring}`}
          >
            <span
              className={`text-5xl font-bold tabular-nums ${scoreColors!.text}`}
              aria-label={`ATS score: ${scoreData.score} out of 100`}
            >
              {scoreData.score}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              / 100
            </span>
          </div>

          {/* Score breakdown */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">{t.atsScore.scoreBreakdown}</h3>
            <div className="flex flex-col gap-2.5">
              {categoryKeys.map((key) => (
                <CategoryBar
                  key={key}
                  label={t.atsScore[key]}
                  score={scoreData.breakdown[key]}
                />
              ))}
            </div>
          </div>

          {/* Top Issues */}
          {scoreData.topIssues.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                <AlertCircle className="size-4 text-destructive" />
                {t.atsScore.topIssues}
              </h3>
              <ul className="flex flex-col gap-1.5">
                {scoreData.topIssues.map((issue, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 rounded-md bg-destructive/5 px-3 py-2 text-xs text-foreground"
                  >
                    <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-destructive" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Wins */}
          {scoreData.quickWins.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                <Zap className="size-4 text-yellow-500" />
                {t.atsScore.quickWins}
              </h3>
              <ul className="flex flex-col gap-1.5">
                {scoreData.quickWins.map((win, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 rounded-md bg-green-500/5 px-3 py-2 text-xs text-foreground"
                  >
                    <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-green-500" />
                    {win}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ATSScoreDisplay
