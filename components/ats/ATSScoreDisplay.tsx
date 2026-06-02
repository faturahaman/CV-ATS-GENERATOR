'use client'

import { useState, useCallback, memo } from 'react'
import { Loader2, AlertCircle, BarChart2, RefreshCw, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAI } from '@/hooks/use-ai'
import { useResumeStore } from '@/store/resume-store'
import { translations } from '@/i18n/translations'
import type { Resume } from '@/types/resume'
import type { Language } from '@/i18n/translations'
import type { ATSScoreResponse } from '@/hooks/use-ai'

// ── Props ─────────────────────────────────────────────────────────────────────

interface ATSScoreDisplayProps {
  resume: Resume
  language: Language
  isOnline: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

/** Score label using warm neutral language */
function getScoreLabel(score: number): string {
  if (score >= 80) return 'Strong'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Needs work'
}

/** Bar fill color — uses theme primary (green) for good, muted tones for lower */
function getBarColor(score: number): string {
  if (score >= 70) return 'bg-primary'
  if (score >= 40) return 'bg-foreground/40'
  return 'bg-foreground/20'
}

/** Overall score text color */
function getScoreTextColor(score: number): string {
  if (score >= 70) return 'text-primary'
  if (score >= 40) return 'text-foreground/70'
  return 'text-muted-foreground'
}

// ── Sub-components ────────────────────────────────────────────────────────────

const CategoryBar = memo(function CategoryBar({ label, score }: { label: string; score: number }) {
  const barColor = getBarColor(score)
  const textColor = score >= 70 ? 'text-primary' : 'text-muted-foreground'

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-foreground/80">{label}</span>
        <span className={`font-semibold tabular-nums ${textColor}`}>{score}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
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
})

// ── Main component ────────────────────────────────────────────────────────────

export const ATSScoreDisplay = memo(function ATSScoreDisplay({ resume, language, isOnline }: ATSScoreDisplayProps) {
  const t = translations[language]
  const { calculateATSScore, isLoading, error, clearError } = useAI()
  const updateResume = useResumeStore((s) => s.updateResume)

  // Hydrate from persisted metadata so breakdown survives refresh/navigation.
  // Falls back to null (shows "not checked yet" state) when no data exists.
  const [scoreData, setScoreData] = useState<ATSScoreResponse | null>(() => {
    const saved = resume.metadata.atsScoreData
    if (saved && saved.score > 0) return saved as ATSScoreResponse
    return null
  })

  const handleCheckScore = useCallback(async () => {
    clearError()
    setScoreData(null)
    try {
      const result = await calculateATSScore(resume, language)
      if (result) {
        setScoreData(result)
        // Persist both the summary score (for badge) AND full data (for breakdown panel)
        updateResume(resume.id, {
          metadata: {
            ...resume.metadata,
            atsScore: result.score,
            atsScoreData: result,
          },
        })
      }
    } catch {
      // error captured in useAI hook
    }
  }, [calculateATSScore, clearError, resume, language, updateResume])

  const grade = scoreData ? getGrade(scoreData.score) : null
  const scoreTextColor = scoreData ? getScoreTextColor(scoreData.score) : ''
  const scoreLabel = scoreData ? getScoreLabel(scoreData.score) : ''

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
      {/* Header + Check button */}
      <div className="flex items-center justify-between gap-2">
        <h2
          className="text-sm font-semibold"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          {t.atsScore.title}
        </h2>
        <Button
          size="sm"
          variant={scoreData ? 'outline' : 'default'}
          onClick={handleCheckScore}
          disabled={!isOnline || isLoading}
          className="rounded-full px-4 text-xs"
          aria-label={t.atsScore.checkScore}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              {t.ai.generating}
            </>
          ) : scoreData ? (
            <>
              <RefreshCw className="h-3 w-3" />
              Recheck
            </>
          ) : (
            t.atsScore.checkScore
          )}
        </Button>
      </div>

      {/* Offline notice */}
      {!isOnline && (
        <p className="text-xs text-muted-foreground">{t.status.offlineAiDisabled}</p>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/50 p-3">
          <div className="flex items-start gap-2 text-xs text-foreground/70">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
            <span>{error}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start rounded-full px-3 text-xs"
            onClick={handleCheckScore}
            disabled={!isOnline}
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </Button>
        </div>
      )}

      {/* Not checked yet */}
      {!isLoading && !scoreData && !error && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-10 text-center">
          <BarChart2 className="h-7 w-7 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{t.atsScore.notChecked}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
          <Loader2 className="h-7 w-7 animate-spin" />
          <p className="text-sm">{t.ai.generating}</p>
        </div>
      )}

      {/* Score results */}
      {scoreData && !isLoading && (
        <div className="flex flex-col gap-5 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out">
          {/* Overall score — editorial style */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                ATS Score
              </span>
              <span
                className="text-xs font-medium"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                {scoreLabel}
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span
                className={`text-5xl font-bold tabular-nums leading-none ${scoreTextColor}`}
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                aria-label={`ATS score: ${scoreData.score} out of 100`}
              >
                {scoreData.score}
              </span>
              <div className="flex flex-col items-start mb-1 gap-0">
                <span className={`text-lg font-bold leading-none ${scoreTextColor}`}>
                  {grade}
                </span>
                <span className="text-xs text-muted-foreground">/100</span>
              </div>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="flex flex-col gap-3">
            <h3
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {t.atsScore.scoreBreakdown}
            </h3>
            <div className="flex flex-col gap-3">
              {categoryKeys.map((key) => (
                <CategoryBar
                  key={key}
                  label={t.atsScore[key]}
                  score={scoreData.breakdown[key] ?? 0}
                />
              ))}
            </div>
          </div>

          {/* Top Issues */}
          {scoreData.topIssues.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <AlertCircle className="h-3.5 w-3.5" />
                {t.atsScore.topIssues}
              </h3>
              <ul className="flex flex-col gap-1.5">
                {scoreData.topIssues.map((issue, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 rounded-md border border-border bg-muted/40 px-3 py-2.5 text-xs text-foreground/80"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Wins */}
          {scoreData.quickWins.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                {t.atsScore.quickWins}
              </h3>
              <ul className="flex flex-col gap-1.5">
                {scoreData.quickWins.map((win, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 rounded-md border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs text-foreground/80"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
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
})

export default ATSScoreDisplay