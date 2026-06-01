'use client'

import { memo, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/lib/utils'
import type { EducationEntry } from '@/types/resume'

// ── Validation schema ─────────────────────────────────────────────────────────

const EducationFormSchema = z.object({
  schoolName: z
    .string()
    .min(2, 'School name must be at least 2 characters')
    .max(100, 'School name must not exceed 100 characters'),
  degree: z
    .string()
    .min(2, 'Degree must be at least 2 characters')
    .max(100, 'Degree must not exceed 100 characters'),
  fieldOfStudy: z
    .string()
    .min(2, 'Field of study must be at least 2 characters')
    .max(100, 'Field of study must not exceed 100 characters'),
  graduationDate: z
    .string()
    .min(1, 'Graduation date is required')
    .regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM format'),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters'),
})

type EducationFormValues = z.infer<typeof EducationFormSchema>

// ── Helpers ───────────────────────────────────────────────────────────────────

function toStorageDate(ym: string): string {
  return ym ? `${ym}-01` : ''
}

function toMonthInput(dateStr: string): string {
  if (!dateStr) return ''
  return dateStr.slice(0, 7)
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
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

// ── Entry form ────────────────────────────────────────────────────────────────

interface EntryFormProps {
  initial?: EducationEntry
  onSave: (entry: EducationEntry) => void
  onCancel: () => void
}

function EntryForm({ initial, onSave, onCancel }: EntryFormProps) {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<EducationFormValues>({
    resolver: zodResolver(EducationFormSchema),
    defaultValues: {
      schoolName: initial?.schoolName ?? '',
      degree: initial?.degree ?? '',
      fieldOfStudy: initial?.fieldOfStudy ?? '',
      graduationDate: toMonthInput(initial?.graduationDate ?? ''),
      description: initial?.description ?? '',
    },
    mode: 'onChange',
  })

  const onSubmit = (values: EducationFormValues) => {
    onSave({
      id: initial?.id ?? generateUUID(),
      schoolName: values.schoolName,
      degree: values.degree,
      fieldOfStudy: values.fieldOfStudy,
      graduationDate: toStorageDate(values.graduationDate),
      description: values.description || undefined,
    })
  }

  const inputCls = (hasError: boolean) =>
    cn('h-9', hasError && 'border-destructive focus-visible:ring-destructive/20')

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="School / University"
          id="edu-schoolName"
          required
          error={errors.schoolName?.message}
        >
          <Input
            id="edu-schoolName"
            placeholder="Universitas Indonesia"
            className={inputCls(!!errors.schoolName)}
            aria-invalid={!!errors.schoolName}
            aria-describedby={errors.schoolName ? 'edu-schoolName-error' : undefined}
            {...register('schoolName')}
          />
        </Field>

        <Field
          label="Degree"
          id="edu-degree"
          required
          error={errors.degree?.message}
        >
          <Input
            id="edu-degree"
            placeholder="Bachelor of Science"
            className={inputCls(!!errors.degree)}
            aria-invalid={!!errors.degree}
            aria-describedby={errors.degree ? 'edu-degree-error' : undefined}
            {...register('degree')}
          />
        </Field>

        <Field
          label="Field of Study"
          id="edu-fieldOfStudy"
          required
          error={errors.fieldOfStudy?.message}
        >
          <Input
            id="edu-fieldOfStudy"
            placeholder="Computer Science"
            className={inputCls(!!errors.fieldOfStudy)}
            aria-invalid={!!errors.fieldOfStudy}
            aria-describedby={errors.fieldOfStudy ? 'edu-fieldOfStudy-error' : undefined}
            {...register('fieldOfStudy')}
          />
        </Field>

        <Field
          label="Graduation Date"
          id="edu-graduationDate"
          required
          error={errors.graduationDate?.message}
        >
          <Input
            id="edu-graduationDate"
            type="month"
            className={inputCls(!!errors.graduationDate)}
            aria-invalid={!!errors.graduationDate}
            aria-describedby={errors.graduationDate ? 'edu-graduationDate-error' : undefined}
            {...register('graduationDate')}
          />
        </Field>
      </div>

      <Field
        label="Description"
        id="edu-description"
        error={errors.description?.message}
      >
        <div className="relative">
          <textarea
            id="edu-description"
            rows={3}
            placeholder="GPA 3.8/4.0, Dean's List, relevant coursework..."
            className={cn(
              'w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm',
              'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
              errors.description && 'border-destructive focus-visible:ring-destructive/20'
            )}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'edu-description-error' : undefined}
            {...register('description')}
          />
          <span className="absolute bottom-2 right-2 text-xs text-muted-foreground tabular-nums">
            {/* eslint-disable-next-line react-hooks/incompatible-library */}
            {watch('description')?.length ?? 0}/500
          </span>
        </div>
      </Field>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-3.5 w-3.5" />
          Cancel
        </Button>
        <Button type="submit" size="sm">
          <Check className="h-3.5 w-3.5" />
          {initial ? 'Save Changes' : 'Add Education'}
        </Button>
      </div>
    </form>
  )
}

// ── Entry card ────────────────────────────────────────────────────────────────

interface EntryCardProps {
  entry: EducationEntry
  onEdit: () => void
  onDelete: () => void
}

function EntryCard({ entry, onEdit, onDelete }: EntryCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-lg border bg-background">
      <div className="flex items-start justify-between gap-2 px-4 py-3">
        <button
          type="button"
          className="flex flex-1 flex-col gap-0.5 text-left"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          <span className="text-sm font-semibold leading-tight">
            {entry.degree}
            {entry.fieldOfStudy ? `, ${entry.fieldOfStudy}` : ''}
          </span>
          <span className="text-xs text-muted-foreground">
            {entry.schoolName} · {formatDisplayDate(entry.graduationDate)}
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onEdit}
            aria-label={`Edit ${entry.degree}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            aria-label={`Delete ${entry.degree}`}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {expanded && entry.description && (
        <div className="border-t px-4 py-3">
          <p className="whitespace-pre-line text-xs text-muted-foreground">
            {entry.description}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Main EducationForm ────────────────────────────────────────────────────────

interface EducationFormProps {
  entries: EducationEntry[]
  onChange: (entries: EducationEntry[]) => void
}

export const EducationForm = memo(function EducationForm({
  entries,
  onChange,
}: EducationFormProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleSave = useCallback(
    (entry: EducationEntry) => {
      if (editingId === 'new') {
        onChange([...entries, entry])
      } else {
        onChange(entries.map((e) => (e.id === entry.id ? entry : e)))
      }
      setEditingId(null)
    },
    [editingId, entries, onChange]
  )

  const handleDelete = useCallback(
    (id: string) => {
      onChange(entries.filter((e) => e.id !== id))
    },
    [entries, onChange]
  )

  const handleCancel = useCallback(() => setEditingId(null), [])

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry) =>
        editingId === entry.id ? (
          <EntryForm
            key={entry.id}
            initial={entry}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <EntryCard
            key={entry.id}
            entry={entry}
            onEdit={() => setEditingId(entry.id)}
            onDelete={() => handleDelete(entry.id)}
          />
        )
      )}

      {editingId === 'new' && (
        <EntryForm onSave={handleSave} onCancel={handleCancel} />
      )}

      {editingId === null && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setEditingId('new')}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Education
        </Button>
      )}
    </div>
  )
})
