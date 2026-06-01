'use client'

import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Sparkles, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { GenerateSummaryModal } from '@/components/modals/GenerateSummaryModal'
import { ImproveSummaryModal } from '@/components/modals/ImproveSummaryModal'

// ── Constants ─────────────────────────────────────────────────────────────────

const MIN_LENGTH = 50
const MAX_LENGTH = 500

// ── Validation ────────────────────────────────────────────────────────────────

function validate(value: string): string | null {
  const len = value.trim().length
  if (len === 0) return null // empty is allowed (section hides in preview)
  if (len < MIN_LENGTH) return `Minimum ${MIN_LENGTH} characters required (${len}/${MIN_LENGTH})`
  if (len > MAX_LENGTH) return `Maximum ${MAX_LENGTH} characters allowed`
  return null
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ProfessionalSummaryFormProps {
  value: string
  onChange: (value: string) => void
  /** Language forwarded to the AI modal */
  language?: 'EN' | 'ID'
}

export const ProfessionalSummaryForm = memo(function ProfessionalSummaryForm({
  value,
  onChange,
  language = 'EN',
}: ProfessionalSummaryFormProps) {
  const [localValue, setLocalValue] = useState(value)
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [improveModalOpen, setImproveModalOpen] = useState(false)

  // Keep local state in sync when the parent value changes externally
  // (e.g. loading a different resume)
  const prevValueRef = useRef(value)
  useEffect(() => {
    if (prevValueRef.current !== value && !isDirty) {
      setLocalValue(value)
    }
    prevValueRef.current = value
  }, [value, isDirty])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value
      // Enforce hard cap — don't allow typing beyond MAX_LENGTH
      if (next.length > MAX_LENGTH) return
      setLocalValue(next)
      setIsDirty(true)
      setError(validate(next))
      onChange(next)
    },
    [onChange]
  )

  // Called when the user accepts a generated summary from the modal
  const handleAccept = useCallback(
    (generated: string) => {
      // Truncate to MAX_LENGTH just in case the AI returns something long
      const capped = generated.slice(0, MAX_LENGTH)
      setLocalValue(capped)
      setIsDirty(true)
      setError(validate(capped))
      onChange(capped)
    },
    [onChange]
  )

  const charCount = localValue.length
  const isOverMin = charCount >= MIN_LENGTH
  const isEmpty = charCount === 0

  // Counter colour: amber when below minimum but not empty, muted otherwise
  const counterCls = cn(
    'text-xs tabular-nums',
    !isEmpty && !isOverMin ? 'text-amber-500' : 'text-muted-foreground'
  )

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Toolbar row: Generate with AI + Improve with AI buttons */}
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="gap-1.5 text-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate with AI
          </Button>
          {!isEmpty && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setImproveModalOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Wand2 className="h-3.5 w-3.5" />
              Improve with AI
            </Button>
          )}
        </div>

        <div className="relative">
          <textarea
            id="professional-summary"
            rows={6}
            value={localValue}
            onChange={handleChange}
            placeholder="Experienced professional with a strong background in... Skilled in... with a proven track record of..."
            maxLength={MAX_LENGTH}
            className={cn(
              'w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm',
              'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
              'pb-6', // room for the counter
              error && 'border-destructive focus-visible:ring-destructive/20'
            )}
            aria-label="Professional summary"
            aria-describedby={error ? 'summary-error' : 'summary-counter'}
            aria-invalid={!!error}
          />
          {/* Character counter — bottom-right inside the textarea */}
          <span
            id="summary-counter"
            className={cn('absolute bottom-2 right-3', counterCls)}
            aria-live="polite"
            aria-atomic="true"
          >
            {charCount} / {MAX_LENGTH}
          </span>
        </div>

        {/* Validation message */}
        {error && (
          <p id="summary-error" role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}

        {/* Hint when empty */}
        {!error && isEmpty && (
          <p className="text-xs text-muted-foreground">
            Write a brief overview of your professional background. Minimum {MIN_LENGTH} characters.
          </p>
        )}
      </div>

      {/* AI Generate Summary Modal */}
      <GenerateSummaryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAccept={handleAccept}
        language={language}
      />

      {/* AI Improve Summary Modal */}
      <ImproveSummaryModal
        open={improveModalOpen}
        onOpenChange={setImproveModalOpen}
        originalSummary={localValue}
        onAccept={handleAccept}
        language={language}
      />
    </>
  )
})
