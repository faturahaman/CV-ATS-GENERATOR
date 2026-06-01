'use client'

import { memo, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Check, X, Sparkles, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/lib/utils'
import { GenerateExperienceModal } from '@/components/modals/GenerateExperienceModal'
import { ImproveExperienceModal } from '@/components/modals/ImproveExperienceModal'
import type { ExperienceEntry } from '@/types/resume'

// ── Validation schema (no AI, no id required in form) ────────────────────────

const ExperienceFormSchema = z
  .object({
    companyName: z
      .string()
      .min(2, 'Company name must be at least 2 characters')
      .max(100, 'Company name must not exceed 100 characters'),
    jobTitle: z
      .string()
      .min(2, 'Job title must be at least 2 characters')
      .max(100, 'Job title must not exceed 100 characters'),
    startDate: z
      .string()
      .min(1, 'Start date is required')
      .regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM format'),
    isCurrentPosition: z.boolean(),
    endDate: z.string(),
    description: z
      .string()
      .max(1000, 'Description must not exceed 1000 characters'),
  })
  .refine(
    (data) => {
      if (data.isCurrentPosition) return true
      if (!data.endDate) return false
      return data.endDate >= data.startDate
    },
    { message: 'End date must be after start date', path: ['endDate'] }
  )

type ExperienceFormValues = z.infer<typeof ExperienceFormSchema>

// ── Helper ────────────────────────────────────────────────────────────────────

/** Convert YYYY-MM to YYYY-MM-DD (first of month) for storage */
function toStorageDate(ym: string): string {
  return ym ? `${ym}-01` : ''
}

/** Convert YYYY-MM-DD to YYYY-MM for the month input */
function toMonthInput(dateStr: string): string {
  if (!dateStr || dateStr === 'Present') return ''
  return dateStr.slice(0, 7) // "YYYY-MM"
}

/** Format YYYY-MM-DD → "Mon YYYY" for display */
function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return ''
  if (dateStr === 'Present') return 'Present'
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

// ── Entry form (add / edit) ───────────────────────────────────────────────────

interface EntryFormProps {
  initial?: ExperienceEntry
  onSave: (entry: ExperienceEntry) => void
  onCancel: () => void
  language?: 'EN' | 'ID'
}

function EntryForm({ initial, onSave, onCancel, language = 'EN' }: EntryFormProps) {
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(ExperienceFormSchema),
    defaultValues: {
      companyName: initial?.companyName ?? '',
      jobTitle: initial?.jobTitle ?? '',
      startDate: toMonthInput(initial?.startDate ?? ''),
      isCurrentPosition: initial?.endDate === 'Present',
      endDate: initial?.endDate === 'Present' ? '' : toMonthInput(initial?.endDate ?? ''),
      description: initial?.description ?? '',
    },
    mode: 'onChange',
  })

  const [generateModalOpen, setGenerateModalOpen] = useState(false)
  const [improveModalOpen, setImproveModalOpen] = useState(false)

  const isCurrentPosition = watch('isCurrentPosition')

  const onSubmit = (values: ExperienceFormValues) => {
    onSave({
      id: initial?.id ?? generateUUID(),
      companyName: values.companyName,
      jobTitle: values.jobTitle,
      startDate: toStorageDate(values.startDate),
      endDate: values.isCurrentPosition ? 'Present' : toStorageDate(values.endDate),
      description: values.description,
    })
  }

  // Append generated bullet points to the existing description
  const handleAcceptGenerated = useCallback(
    (bullets: string) => {
      // eslint-disable-next-line react-hooks/incompatible-library
      const current = watch('description') ?? ''
      const separator = current.trim() ? '\n' : ''
      const next = (current + separator + bullets).slice(0, 1000)
      setValue('description', next, { shouldValidate: true, shouldDirty: true })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setValue]
  )

  // Replace description with the improved version
  const handleAcceptImproved = useCallback(
    (improved: string) => {
      const capped = improved.slice(0, 1000)
      setValue('description', capped, { shouldValidate: true, shouldDirty: true })
    },
    [setValue]
  )

  const inputCls = (hasError: boolean) =>
    cn('h-9', hasError && 'border-destructive focus-visible:ring-destructive/20')

  return (
    <>
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Company Name"
          id="exp-companyName"
          required
          error={errors.companyName?.message}
        >
          <Input
            id="exp-companyName"
            placeholder="PT Example"
            className={inputCls(!!errors.companyName)}
            aria-invalid={!!errors.companyName}
            aria-describedby={errors.companyName ? 'exp-companyName-error' : undefined}
            {...register('companyName')}
          />
        </Field>

        <Field
          label="Job Title"
          id="exp-jobTitle"
          required
          error={errors.jobTitle?.message}
        >
          <Input
            id="exp-jobTitle"
            placeholder="Frontend Developer"
            className={inputCls(!!errors.jobTitle)}
            aria-invalid={!!errors.jobTitle}
            aria-describedby={errors.jobTitle ? 'exp-jobTitle-error' : undefined}
            {...register('jobTitle')}
          />
        </Field>

        <Field
          label="Start Date"
          id="exp-startDate"
          required
          error={errors.startDate?.message}
        >
          <Input
            id="exp-startDate"
            type="month"
            className={inputCls(!!errors.startDate)}
            aria-invalid={!!errors.startDate}
            aria-describedby={errors.startDate ? 'exp-startDate-error' : undefined}
            {...register('startDate')}
          />
        </Field>

        <div className="flex flex-col gap-1.5">
          <Field
            label="End Date"
            id="exp-endDate"
            required={!isCurrentPosition}
            error={errors.endDate?.message}
          >
            <Input
              id="exp-endDate"
              type="month"
              disabled={isCurrentPosition}
              className={cn(
                inputCls(!!errors.endDate),
                isCurrentPosition && 'opacity-50'
              )}
              aria-invalid={!!errors.endDate}
              aria-describedby={errors.endDate ? 'exp-endDate-error' : undefined}
              {...register('endDate')}
            />
          </Field>
          {/* Current position toggle */}
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-input accent-primary"
              {...register('isCurrentPosition')}
              onChange={(e) => {
                setValue('isCurrentPosition', e.target.checked)
                if (e.target.checked) setValue('endDate', '')
              }}
            />
            Currently working here
          </label>
        </div>
      </div>

      <Field
        label="Description"
        id="exp-description"
        error={errors.description?.message}
      >
        <div className="flex flex-col gap-1.5">
          {/* AI toolbar: Generate + Improve with AI */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setGenerateModalOpen(true)}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generate with AI
            </Button>
            {watch('description')?.trim() && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setImproveModalOpen(true)}
              >
                <Wand2 className="h-3.5 w-3.5" />
                Improve with AI
              </Button>
            )}
          </div>
          <div className="relative">
            <textarea
              id="exp-description"
              rows={4}
              placeholder="• Achieved X by doing Y, resulting in Z&#10;• Led a team of N people..."
              className={cn(
                'w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm',
                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                errors.description && 'border-destructive focus-visible:ring-destructive/20'
              )}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'exp-description-error' : undefined}
              {...register('description')}
            />
            <span className="absolute bottom-2 right-2 text-xs text-muted-foreground tabular-nums">
              {watch('description')?.length ?? 0}/1000
            </span>
          </div>
        </div>
      </Field>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-3.5 w-3.5" />
          Cancel
        </Button>
        <Button type="submit" size="sm">
          <Check className="h-3.5 w-3.5" />
          {initial ? 'Save Changes' : 'Add Experience'}
        </Button>
      </div>
    </form>

    {/* AI modals rendered OUTSIDE the <form> to prevent event bubbling */}
    <GenerateExperienceModal
      open={generateModalOpen}
      onOpenChange={setGenerateModalOpen}
      onAccept={handleAcceptGenerated}
      defaultJobTitle={watch('jobTitle')}
      defaultCompanyName={watch('companyName')}
      language={language}
    />

    <ImproveExperienceModal
      open={improveModalOpen}
      onOpenChange={setImproveModalOpen}
      originalDescription={watch('description') ?? ''}
      onAccept={handleAcceptImproved}
      language={language}
    />
    </>
  )
}

// ── Entry card (collapsed view) ───────────────────────────────────────────────

interface EntryCardProps {
  entry: ExperienceEntry
  onEdit: () => void
  onDelete: () => void
}

function EntryCard({ entry, onEdit, onDelete }: EntryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const dateRange = `${formatDisplayDate(entry.startDate)} – ${formatDisplayDate(entry.endDate)}`

  return (
    <div className="rounded-lg border bg-background">
      <div className="flex items-start justify-between gap-2 px-4 py-3">
        <button
          type="button"
          className="flex flex-1 flex-col gap-0.5 text-left"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          <span className="text-sm font-semibold leading-tight">{entry.jobTitle}</span>
          <span className="text-xs text-muted-foreground">
            {entry.companyName} · {dateRange}
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onEdit}
            aria-label={`Edit ${entry.jobTitle}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            aria-label={`Delete ${entry.jobTitle}`}
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

// ── Main ExperienceForm ───────────────────────────────────────────────────────

interface ExperienceFormProps {
  entries: ExperienceEntry[]
  onChange: (entries: ExperienceEntry[]) => void
}

export const ExperienceForm = memo(function ExperienceForm({
  entries,
  onChange,
}: ExperienceFormProps) {
  // null = no form open; 'new' = adding; string id = editing that entry
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleSave = useCallback(
    (entry: ExperienceEntry) => {
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

  const handleEdit = useCallback((id: string) => {
    setEditingId(id)
  }, [])

  const handleCancel = useCallback(() => {
    setEditingId(null)
  }, [])

  return (
    <div className="flex flex-col gap-3">
      {/* Entry list */}
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
            onEdit={() => handleEdit(entry.id)}
            onDelete={() => handleDelete(entry.id)}
          />
        )
      )}

      {/* Add new form */}
      {editingId === 'new' && (
        <EntryForm onSave={handleSave} onCancel={handleCancel} />
      )}

      {/* Add button — hidden while a form is open */}
      {editingId === null && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setEditingId('new')}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Experience
        </Button>
      )}
    </div>
  )
})
