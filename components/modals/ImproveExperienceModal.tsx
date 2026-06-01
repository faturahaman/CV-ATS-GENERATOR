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
import { improveExperience } from '@/lib/ai-client'

// ── Reducer ───────────────────────────────────────────────────────────────────

type Step = 'idle' | 'loading' | 'result' | 'error'

interface State {
  step: Step
  improvedDescription: string
  apiError: string | null
}

type Action =
  | { type: 'START' }
  | { type: 'SUCCESS'; payload: string }
  | { type: 'FAILURE'; payload: string }

function reducer(_: State, action: Action): State {
  switch (action.type) {
    case 'START':
      return { step: 'loading', improvedDescription: '', apiError: null }
    case 'SUCCESS':
      return { step: 'result', improvedDescription: action.payload, apiError: null }
    case 'FAILURE':
      return { step: 'error', improvedDescription: '', apiError: action.payload }
  }
}

// Start in idle — no API call until user explicitly clicks Improve
const initialState: State = { step: 'idle', improvedDescription: '', apiError: null }

// ── Props ─────────────────────────────────────────────────────────────────────

interface ImproveExperienceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  originalDescription: string
  onAccept: (improved: string) => void
  language?: 'EN' | 'ID'
}

// ── Inner content — remounted fresh each time the modal opens ─────────────────

interface InnerProps {
  originalDescription: string
  language: 'EN' | 'ID'
  onAccept: (improved: string) => void
  onClose: () => void
}

function ImproveExperienceContent({
  originalDescription,
  language,
  onAccept,
  onClose,
}: InnerProps) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // API call — only fired when user explicitly clicks a button
  const callImprove = useCallback(async () => {
    dispatch({ type: 'START' })
    try {
      const result = await improveExperience(originalDescription, language)
      dispatch({ type: 'SUCCESS', payload: result })
    } catch (err) {
      dispatch({
        type: 'FAILURE',
        payload:
          err instanceof Error
            ? err.message
            : 'Failed to improve experience. Please try again.',
      })
    }
  }, [originalDescription, language])

  const handleAccept = useCallback(() => {
    onAccept(state.improvedDescription)
    onClose()
  }, [state.improvedDescription, onAccept, onClose])

  const isLoading = state.step === 'loading'

  return (
    <div className="flex flex-col gap-4">
      {/* ── Idle: show current description + Improve button ── */}
      {state.step === 'idle' && (
        <>
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Current Description
            </p>
            <div
              className={cn(
                'max-h-40 overflow-y-auto rounded-md border bg-muted/20 px-3 py-2.5',
                'whitespace-pre-line text-sm leading-relaxed text-muted-foreground'
              )}
            >
              {originalDescription}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Click Improve to send your description to AI for enhancement.
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
            Improving your description...
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
              Current
            </p>
            <div
              className={cn(
                'max-h-32 overflow-y-auto rounded-md border bg-muted/20 px-3 py-2.5',
                'whitespace-pre-line text-sm leading-relaxed text-muted-foreground'
              )}
              aria-label="Current description"
            >
              {originalDescription}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Improved
            </p>
            <div
              className={cn(
                'max-h-32 overflow-y-auto rounded-md border border-primary/20 bg-primary/5',
                'whitespace-pre-line px-3 py-2.5 text-sm leading-relaxed'
              )}
              aria-label="Improved description"
            >
              {state.improvedDescription}
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

export function ImproveExperienceModal({
  open,
  onOpenChange,
  originalDescription,
  onAccept,
  language = 'EN',
}: ImproveExperienceModalProps) {
  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            Improve Experience with AI
          </DialogTitle>
        </DialogHeader>

        {/* Remount inner component on each open for clean state */}
        {open && (
          <ImproveExperienceContent
            originalDescription={originalDescription}
            language={language}
            onAccept={onAccept}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
