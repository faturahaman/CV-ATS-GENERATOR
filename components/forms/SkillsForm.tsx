'use client'

import { memo, useCallback, useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/lib/utils'
import type { SkillEntry } from '@/types/resume'

interface SkillsFormProps {
  skills: SkillEntry[]
  onChange: (skills: SkillEntry[]) => void
}

export const SkillsForm = memo(function SkillsForm({
  skills,
  onChange,
}: SkillsFormProps) {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const addSkill = useCallback(() => {
    const trimmed = inputValue.trim()

    if (trimmed.length < 2) {
      setError('Skill name must be at least 2 characters')
      return
    }
    if (trimmed.length > 100) {
      setError('Skill name must not exceed 100 characters')
      return
    }
    // Prevent duplicates (case-insensitive)
    if (skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('This skill has already been added')
      return
    }

    onChange([...skills, { id: generateUUID(), name: trimmed }])
    setInputValue('')
    setError(null)
    inputRef.current?.focus()
  }, [inputValue, skills, onChange])

  const removeSkill = useCallback(
    (id: string) => {
      onChange(skills.filter((s) => s.id !== id))
    },
    [skills, onChange]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Skill tags */}
      {skills.length > 0 && (
        <div
          className="flex flex-wrap gap-2"
          role="list"
          aria-label="Added skills"
        >
          {skills.map((skill) => (
            <span
              key={skill.id}
              role="listitem"
              className="flex items-center gap-1 rounded-full border bg-muted px-3 py-1 text-xs font-medium"
            >
              {skill.name}
              <button
                type="button"
                onClick={() => removeSkill(skill.id)}
                aria-label={`Remove ${skill.name}`}
                className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add skill input */}
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            id="skill-input"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              if (error) setError(null)
            }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. React, TypeScript, Node.js"
            className={cn('h-9 flex-1', error && 'border-destructive focus-visible:ring-destructive/20')}
            aria-label="Skill name"
            aria-invalid={!!error}
            aria-describedby={error ? 'skill-input-error' : undefined}
          />
          <Button
            type="button"
            size="sm"
            onClick={addSkill}
            aria-label="Add skill"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
        {error && (
          <p id="skill-input-error" role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Press Enter or click Add to add a skill
        </p>
      </div>
    </div>
  )
})
