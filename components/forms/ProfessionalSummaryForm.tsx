'use client'

import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

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
}

export const ProfessionalSummaryForm = memo(function ProfessionalSummaryForm({
  value,
  onChange,
}: ProfessionalSummaryFormProps) {
  const [localValue, setLocalValue] = useState(value)
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

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

  const charCount = localValue.length
  const isOverMin = charCount >= MIN_LENGTH
  const isEmpty = charCount === 0

  // Counter colour: red when over limit (shouldn't happen due to hard cap),
  // amber when below minimum but not empty, muted otherwise
  const counterCls = cn(
    'text-xs tabular-nums',
    !isEmpty && !isOverMin ? 'text-amber-500' : 'text-muted-foreground'
  )

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <textarea
          id="professional-summary"
          rows={6}
          value={localValue}
          onChange={handleChange}
          placeholder="Experienced Frontend Developer with strong knowledge of React, Next.js and TypeScript..."
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
  )
})
