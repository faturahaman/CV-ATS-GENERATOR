'use client'

import { useCallback, useState } from 'react'
import { Loader2, Sparkles, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { generateSummary } from '@/lib/ai-client'

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = 'form' | 'result'

interface GenerateSummaryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called when the user accepts the generated summary */
  onAccept: (summary: string) => void
  /** Language passed to the AI API */
  language?: 'EN' | 'ID'
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

interface FieldProps {
  label: string
  id: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}

function Field({ label, id, required, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium leading-none">
        {label}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function GenerateSummaryModal({
  open,
  onOpenChange,
  onAccept,
  language = 'EN',
}: GenerateSummaryModalProps) {
  // ── Form state ─────────────────────────────────────────────────────────────
  const [jobTitle, setJobTitle] = useState('')
  const [skillsRaw, setSkillsRaw] = useState('')
  const [jobTitleError, setJobTitleError] = useState<string | null>(null)

  // ── Async state ────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedSummary, setGeneratedSummary] = useState('')
  const [apiError, setApiError] = useState<string | null>(null)

  // ── Helpers ────────────────────────────────────────────────────────────────

  const parseSkills = (raw: string): string[] =>
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

  const resetForm = useCallback(() => {
    setJobTitle('')
    setSkillsRaw('')
    setJobTitleError(null)
    setStep('form')
    setGeneratedSummary('')
    setApiError(null)
    setIsLoading(false)
  }, [])

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) resetForm()
      onOpenChange(next)
    },
    [onOpenChange, resetForm]
  )

  // ── Generate ───────────────────────────────────────────────────────────────

  const callGenerate = useCallback(async () => {
    setIsLoading(true)
    setApiError(null)
    try {
      const skills = parseSkills(skillsRaw)
      const result = await generateSummary(jobTitle.trim(), skills, language)
      setGeneratedSummary(result)
      setStep('result')
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : 'Failed to generate summary. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [jobTitle, skillsRaw, language])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      // Validate
      if (!jobTitle.trim()) {
        setJobTitleError('Job title is required')
        return
      }
      setJobTitleError(null)
      callGenerate()
    },
    [jobTitle, callGenerate]
  )

  const handleRegenerate = useCallback(() => {
    setStep('form')
    setGeneratedSummary('')
    setApiError(null)
  }, [])

  const handleAccept = useCallback(() => {
    onAccept(generatedSummary)
    handleOpenChange(false)
  }, [generatedSummary, onAccept, handleOpenChange])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Generate Summary with AI
          </DialogTitle>
        </DialogHeader>

        {/* ── Step 1: Input form ── */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Field
              label="Job Title"
              id="gen-jobTitle"
              required
              error={jobTitleError ?? undefined}
            >
              <Input
                id="gen-jobTitle"
                placeholder="Frontend Developer"
                value={jobTitle}
                onChange={(e) => {
                  setJobTitle(e.target.value)
                  if (jobTitleError) setJobTitleError(null)
                }}
                aria-invalid={!!jobTitleError}
                aria-describedby={jobTitleError ? 'gen-jobTitle-error' : undefined}
                disabled={isLoading}
              />
            </Field>

            <Field
              label="Key Skills"
              id="gen-skills"
              hint="Comma separated, e.g. React, Next.js, TypeScript, Tailwind CSS"
            >
              <Input
                id="gen-skills"
                placeholder="React, Next.js, TypeScript, Tailwind CSS"
                value={skillsRaw}
                onChange={(e) => setSkillsRaw(e.target.value)}
                disabled={isLoading}
              />
            </Field>

            {/* API error shown in form step (e.g. network error before result) */}
            {apiError && (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {apiError}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Generate
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* ── Step 2: Result review ── */}
        {step === 'result' && (
          <div className="flex flex-col gap-4">
            <div
              className={cn(
                'rounded-md border bg-muted/30 px-3 py-3 text-sm leading-relaxed',
                'max-h-48 overflow-y-auto'
              )}
              aria-label="Generated summary"
            >
              {generatedSummary}
            </div>

            {/* API error shown in result step (e.g. regenerate failed) */}
            {apiError && (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {apiError}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Regenerate
                  </>
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleAccept}
                disabled={isLoading}
              >
                Accept
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
