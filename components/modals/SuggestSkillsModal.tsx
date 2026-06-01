'use client'

import { useCallback, useState } from 'react'
import { Loader2, Lightbulb, RefreshCw } from 'lucide-react'
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
import { suggestSkills } from '@/lib/ai-client'

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = 'form' | 'result'

interface SuggestSkillsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /**
   * Called when the user accepts selected skills.
   * The caller is responsible for deduplication against existing skills.
   */
  onAccept: (selectedSkills: string[]) => void
  /** Language passed to the AI API */
  language?: 'EN' | 'ID'
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

interface FieldProps {
  label: string
  id: string
  required?: boolean
  error?: string
  children: React.ReactNode
}

function Field({ label, id, required, error, children }: FieldProps) {
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
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function SuggestSkillsModal({
  open,
  onOpenChange,
  onAccept,
  language = 'EN',
}: SuggestSkillsModalProps) {
  // ── Form state ─────────────────────────────────────────────────────────────
  const [jobTitle, setJobTitle] = useState('')
  const [industry, setIndustry] = useState('')
  const [jobTitleError, setJobTitleError] = useState<string | null>(null)

  // ── Async / result state ───────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [apiError, setApiError] = useState<string | null>(null)

  // ── Helpers ────────────────────────────────────────────────────────────────

  const resetForm = useCallback(() => {
    setJobTitle('')
    setIndustry('')
    setJobTitleError(null)
    setStep('form')
    setIsLoading(false)
    setSuggestions([])
    setSelected(new Set())
    setApiError(null)
  }, [])

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) resetForm()
      onOpenChange(next)
    },
    [onOpenChange, resetForm]
  )

  // ── Generate ───────────────────────────────────────────────────────────────

  const callSuggest = useCallback(async () => {
    setIsLoading(true)
    setApiError(null)
    try {
      // Append industry to job title context if provided
      const titleWithContext = industry.trim()
        ? `${jobTitle.trim()} (${industry.trim()})`
        : jobTitle.trim()
      const result = await suggestSkills(titleWithContext, language)
      setSuggestions(result)
      // Pre-select all suggestions
      setSelected(new Set(result))
      setStep('result')
    } catch (err) {
      setApiError(
        err instanceof Error
          ? err.message
          : 'Failed to suggest skills. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [jobTitle, industry, language])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!jobTitle.trim()) {
        setJobTitleError('Job title is required')
        return
      }
      setJobTitleError(null)
      callSuggest()
    },
    [jobTitle, callSuggest]
  )

  const handleRegenerate = useCallback(() => {
    setStep('form')
    setSuggestions([])
    setSelected(new Set())
    setApiError(null)
  }, [])

  // ── Tag selection ──────────────────────────────────────────────────────────

  const toggleSkill = useCallback((skill: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(skill)) {
        next.delete(skill)
      } else {
        next.add(skill)
      }
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelected(new Set(suggestions))
  }, [suggestions])

  const clearAll = useCallback(() => {
    setSelected(new Set())
  }, [])

  // ── Accept ─────────────────────────────────────────────────────────────────

  const handleAccept = useCallback(() => {
    onAccept(Array.from(selected))
    handleOpenChange(false)
  }, [selected, onAccept, handleOpenChange])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Suggest Skills with AI
          </DialogTitle>
        </DialogHeader>

        {/* ── Step 1: Input form ── */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Field
              label="Job Title"
              id="suggest-jobTitle"
              required
              error={jobTitleError ?? undefined}
            >
              <Input
                id="suggest-jobTitle"
                placeholder="Frontend Developer"
                value={jobTitle}
                onChange={(e) => {
                  setJobTitle(e.target.value)
                  if (jobTitleError) setJobTitleError(null)
                }}
                aria-invalid={!!jobTitleError}
                aria-describedby={jobTitleError ? 'suggest-jobTitle-error' : undefined}
                disabled={isLoading}
              />
            </Field>

            <Field label="Industry" id="suggest-industry">
              <Input
                id="suggest-industry"
                placeholder="E-commerce, Fintech, SaaS..."
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                disabled={isLoading}
              />
            </Field>

            {apiError && (
              <p
                role="alert"
                className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive"
              >
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
                    Suggesting...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-3.5 w-3.5" />
                    Suggest
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* ── Step 2: Result — selectable skill tags ── */}
        {step === 'result' && (
          <div className="flex flex-col gap-4">
            {/* Select All / Clear All controls */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {selected.size} of {suggestions.length} selected
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={selectAll}
                  disabled={selected.size === suggestions.length}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={clearAll}
                  disabled={selected.size === 0}
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* Skill tags */}
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Suggested skills"
            >
              {suggestions.map((skill) => {
                const isSelected = selected.has(skill)
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    aria-pressed={isSelected}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:bg-muted'
                    )}
                  >
                    {skill}
                  </button>
                )
              })}
            </div>

            {apiError && (
              <p
                role="alert"
                className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive"
              >
                {apiError}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleAccept}
                disabled={selected.size === 0}
              >
                Accept ({selected.size})
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
