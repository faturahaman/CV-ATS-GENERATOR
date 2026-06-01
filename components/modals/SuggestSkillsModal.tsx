'use client'

import { useCallback, useState } from 'react'
import { Loader2, Lightbulb, RefreshCw } from 'lucide-react'
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
import { suggestSkills } from '@/lib/ai-client'

type Step = 'form' | 'result'

interface SuggestSkillsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccept: (selectedSkills: string[]) => void
  /** Job target from personalDetails — pre-fills the job title */
  defaultJobTitle?: string
  language?: 'EN' | 'ID'
}

export function SuggestSkillsModal({
  open,
  onOpenChange,
  onAccept,
  defaultJobTitle = '',
  language = 'EN',
}: SuggestSkillsModalProps) {
  // Only ask for Industry — job title comes from the resume
  const [industry, setIndustry] = useState('')

  const [step, setStep] = useState<Step>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [apiError, setApiError] = useState<string | null>(null)

  const resetForm = useCallback(() => {
    setIndustry('')
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

  const callSuggest = useCallback(async () => {
    setIsLoading(true)
    setApiError(null)
    try {
      const titleWithContext = industry.trim()
        ? `${defaultJobTitle.trim()} (${industry.trim()})`
        : defaultJobTitle.trim()
      const result = await suggestSkills(titleWithContext, language)
      setSuggestions(result)
      setSelected(new Set(result))
      setStep('result')
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : 'Failed to suggest skills. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [defaultJobTitle, industry, language])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      callSuggest()
    },
    [callSuggest]
  )

  const handleRegenerate = useCallback(() => {
    setStep('form')
    setSuggestions([])
    setSelected(new Set())
    setApiError(null)
  }, [])

  const toggleSkill = useCallback((skill: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(skill)) next.delete(skill)
      else next.add(skill)
      return next
    })
  }, [])

  const selectAll = useCallback(() => setSelected(new Set(suggestions)), [suggestions])
  const clearAll = useCallback(() => setSelected(new Set()), [])

  const handleAccept = useCallback(() => {
    onAccept(Array.from(selected))
    handleOpenChange(false)
  }, [selected, onAccept, handleOpenChange])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Suggest Skills with AI
          </DialogTitle>
          {defaultJobTitle && (
            <DialogDescription>
              Suggesting skills for{' '}
              <span className="font-medium text-foreground">{defaultJobTitle}</span>.
              Add an industry for more targeted results.
            </DialogDescription>
          )}
        </DialogHeader>

        {/* ── Step 1: Industry only ── */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="suggest-industry" className="text-sm font-medium leading-none">
                Industry <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Input
                id="suggest-industry"
                placeholder="E-commerce, Fintech, Government..."
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {apiError && (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {apiError}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => handleOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" />Suggesting...</>
                ) : (
                  <><Lightbulb className="h-3.5 w-3.5" />Suggest</>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* ── Step 2: Selectable skill tags ── */}
        {step === 'result' && (
          <div className="flex flex-col gap-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-out">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {selected.size} of {suggestions.length} selected
              </span>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={selectAll} disabled={selected.size === suggestions.length}>
                  Select All
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearAll} disabled={selected.size === 0}>
                  Clear All
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested skills">
              {suggestions.map((skill) => {
                const isSelected = selected.has(skill)
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    aria-pressed={isSelected}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150 ease-out',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground scale-[1.03]'
                        : 'border-border bg-background text-foreground hover:bg-muted hover:scale-[1.03]'
                    )}
                  >
                    {skill}
                  </button>
                )
              })}
            </div>

            {apiError && (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {apiError}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleRegenerate}>
                <RefreshCw className="h-3.5 w-3.5" />Regenerate
              </Button>
              <Button type="button" size="sm" onClick={handleAccept} disabled={selected.size === 0}>
                Accept ({selected.size})
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
