'use client'

import { useCallback, useState } from 'react'
import { Loader2, Sparkles, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { generateExperience } from '@/lib/ai-client'

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = 'form' | 'result'

interface GenerateExperienceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called when the user accepts the generated bullet points */
  onAccept: (bulletPoints: string) => void
  /** Job title already entered in the experience form */
  defaultJobTitle?: string
  /** Company name already entered in the experience form */
  defaultCompanyName?: string
  /** Language passed to the AI API */
  language?: 'EN' | 'ID'
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

interface FieldProps {
  label: string
  id: string
  hint?: string
  children: React.ReactNode
}

function Field({ label, id, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium leading-none">
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function GenerateExperienceModal({
  open,
  onOpenChange,
  onAccept,
  defaultJobTitle = '',
  defaultCompanyName = '',
  language = 'EN',
}: GenerateExperienceModalProps) {
  // Only ask for the extra context not already in the form
  const [industry, setIndustry] = useState('')
  const [technologies, setTechnologies] = useState('')

  // Async state
  const [step, setStep] = useState<Step>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedBullets, setGeneratedBullets] = useState('')
  const [apiError, setApiError] = useState<string | null>(null)

  // ── Helpers ────────────────────────────────────────────────────────────────

  const buildJobContext = useCallback((): string => {
    const parts: string[] = []
    if (defaultJobTitle.trim()) parts.push(`Job Title: ${defaultJobTitle.trim()}`)
    if (defaultCompanyName.trim()) parts.push(`Company: ${defaultCompanyName.trim()}`)
    if (industry.trim()) parts.push(`Industry: ${industry.trim()}`)
    if (technologies.trim()) parts.push(`Technologies: ${technologies.trim()}`)
    return parts.join(', ')
  }, [defaultJobTitle, defaultCompanyName, industry, technologies])

  const resetForm = useCallback(() => {
    setIndustry('')
    setTechnologies('')
    setStep('form')
    setGeneratedBullets('')
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
      const jobContext = buildJobContext()
      const result = await generateExperience(jobContext, language)
      setGeneratedBullets(result)
      setStep('result')
    } catch (err) {
      setApiError(
        err instanceof Error
          ? err.message
          : 'Failed to generate experience. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [buildJobContext, language])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      callGenerate()
    },
    [callGenerate]
  )

  const handleRegenerate = useCallback(() => {
    setStep('form')
    setGeneratedBullets('')
    setApiError(null)
  }, [])

  const handleAccept = useCallback(() => {
    onAccept(generatedBullets)
    handleOpenChange(false)
  }, [generatedBullets, onAccept, handleOpenChange])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Generate Experience with AI
          </DialogTitle>

          {/* Show the context already taken from the form */}
          {(defaultJobTitle || defaultCompanyName) && (
            <DialogDescription>
              Generating for{' '}
              <span className="font-medium text-foreground">
                {[defaultJobTitle, defaultCompanyName].filter(Boolean).join(' @ ')}
              </span>
              . Add optional details below to improve the result.
            </DialogDescription>
          )}
        </DialogHeader>

        {/* ── Step 1: Extra context form ── */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Field label="Industry" id="genexp-industry">
              <Input
                id="genexp-industry"
                placeholder="E-commerce, Fintech, Government..."
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                disabled={isLoading}
              />
            </Field>

            <Field
              label="Technologies Used"
              id="genexp-tech"
              hint="Comma separated, e.g. React, Next.js, TypeScript"
            >
              <Input
                id="genexp-tech"
                placeholder="React, Next.js, TypeScript"
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
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
            <ul
              className="max-h-56 overflow-y-auto rounded-md border bg-muted/30 px-5 py-3 flex flex-col gap-1.5 list-disc"
              aria-label="Generated experience bullet points"
            >
              {generatedBullets
                .split('\n')
                .map((line) => line.replace(/^[\s•\-*]+/, '').trim())
                .filter(Boolean)
                .map((line, idx) => (
                  <li key={idx} className="text-sm leading-relaxed">
                    {line}
                  </li>
                ))}
            </ul>

            <p className="text-xs text-muted-foreground">
              Accepting will append these bullet points to the existing description.
            </p>

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
