'use client'

import { useCallback, useReducer } from 'react'
import { Loader2, Wand2, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { improveSummary } from '@/lib/ai-client'

// ── Reducer ───────────────────────────────────────────────────────────────────

type Step = 'idle' | 'loading' | 'result' | 'error'

interface State {
  step: Step
  improvedSummary: string
  apiError: string | null
}

type Action =
  | { type: 'START' }
  | { type: 'SUCCESS'; payload: string }
  | { type: 'FAILURE'; payload: string }

function reducer(_: State, action: Action): State {
  switch (action.type) {
    case 'START':
      return { step: 'loading', improvedSummary: '', apiError: null }
    case 'SUCCESS':
      return { step: 'result', improvedSummary: action.payload, apiError: null }
    case 'FAILURE':
      return { step: 'error', improvedSummary: '', apiError: action.payload }
  }
}

// Start in idle — no API call until user explicitly clicks Improve
const initialState: State = { step: 'idle', improvedSummary: '', apiError: null }

// ── Props ─────────────────────────────────────────────────────────────────────

interface ImproveSummaryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  originalSummary: string
  onAccept: (improved: string) => void
  language?: 'EN' | 'ID'
}

// ── Inner content — remounted fresh each time the modal opens ─────────────────

interface InnerProps {
  originalSummary: string
  language: 'EN' | 'ID'
  onAccept: (improved: string) => void
  onClose: () => void
}

function ImproveSummaryContent({
  originalSummary,
  language,
  onAccept,
  onClose,
}: InnerProps) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // API call — only fired when user explicitly clicks a button
  const callImprove = useCallback(async () => {
    dispatch({ type: 'START' })
    try {
      const result = await improveSummary(originalSummary, language)
      dispatch({ type: 'SUCCESS', payload: result })
    } catch (err) {
      dispatch({
        type: 'FAILURE',
        payload:
          err instanceof Error
            ? err.message
            : 'Failed to improve summary. Please try again.',
      })
    }
  }, [originalSummary, language])

  const handleAccept = useCallback(() => {
    onAccept(state.improvedSummary)
    onClose()
  }, [state.improvedSummary, onAccept, onClose])

  const isLoading = state.step === 'loading'

  return (
    <div className="flex flex-col gap-4">
      {/* ── Idle: show original + Improve button ── */}
      {state.step === 'idle' && (
        <>
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Current Summary
            </p>
            <div
              className={cn(
                'max-h-40 overflow-y-auto rounded-md border bg-muted/20 px-3 py-2.5',
                'text-sm leading-relaxed text-muted-foreground'
              )}
            >
              {originalSummary}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Click Improve to send your summary to AI for enhancement.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={callImprove}>
              <Wand2 className="h-3.5 w-3.5" />
              Improve
            </Button>
          </DialogFooter>
        </>
      )}

      {/* ── Loading ── */}
      {isLoading && (
        <>
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Improving your summary...
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" disabled>
              Cancel
            </Button>
          </DialogFooter>
        </>
      )}

      {/* ── Result ── */}
      {state.step === 'result' && (
        <>
          <div className="flex flex-col gap-1.5 animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-out">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Original
            </p>
            <div
              className={cn(
                'max-h-32 overflow-y-auto rounded-md border bg-muted/20 px-3 py-2.5',
                'text-sm leading-relaxed text-muted-foreground'
              )}
              aria-label="Original summary"
            >
              {originalSummary}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Improved
            </p>
            <div
              className={cn(
                'max-h-32 overflow-y-auto rounded-md border border-primary/20 bg-primary/5',
                'px-3 py-2.5 text-sm leading-relaxed'
              )}
              aria-label="Improved summary"
            >
              {state.improvedSummary}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Reject
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={callImprove}>
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </Button>
            <Button type="button" size="sm" onClick={handleAccept}>
              Accept
            </Button>
          </DialogFooter>
        </>
      )}

      {/* ── Error ── */}
      {state.step === 'error' && (
        <>
          <p
            role="alert"
            className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            {state.apiError}
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={callImprove}>
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </Button>
          </DialogFooter>
        </>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ImproveSummaryModal({
  open,
  onOpenChange,
  originalSummary,
  onAccept,
  language = 'EN',
}: ImproveSummaryModalProps) {
  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            Improve Summary with AI
          </DialogTitle>
        </DialogHeader>

        {/* Remount inner component on each open for clean state */}
        {open && (
          <ImproveSummaryContent
            originalSummary={originalSummary}
            language={language}
            onAccept={onAccept}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
