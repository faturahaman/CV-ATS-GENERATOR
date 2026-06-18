'use client'

import { memo, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Check, X, Infinity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/lib/utils'
import type { CertificationEntry } from '@/types/resume'

// ── Validation schema ─────────────────────────────────────────────────────────

const CertFormSchema = z
  .object({
    certificationName: z
      .string()
      .min(2, 'Certification name must be at least 2 characters')
      .max(100, 'Certification name must not exceed 100 characters'),
    issuingOrganization: z
      .string()
      .min(2, 'Issuing organization must be at least 2 characters')
      .max(100, 'Issuing organization must not exceed 100 characters'),
    issueDate: z
      .string()
      .min(1, 'Issue date is required')
      .regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM format'),
    expirationDate: z.string(),
  })
  .refine(
    (data) => {
      if (!data.expirationDate) return true
      return data.expirationDate >= data.issueDate
    },
    { message: 'Expiration date must be after issue date', path: ['expirationDate'] }
  )

type CertFormValues = z.infer<typeof CertFormSchema>

// ── Helpers ───────────────────────────────────────────────────────────────────

function toStorageDate(ym: string): string {
  return ym ? `${ym}-01` : ''
}

function toMonthInput(dateStr: string | undefined): string {
  if (!dateStr) return ''
  return dateStr.slice(0, 7)
}

function formatDisplayDate(dateStr: string | undefined): string {
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
  initial?: CertificationEntry
  onSave: (entry: CertificationEntry) => void
  onCancel: () => void
}

function EntryForm({ initial, onSave, onCancel }: EntryFormProps) {
  const [neverExpires, setNeverExpires] = useState<boolean>(
    initial?.neverExpires ?? false
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CertFormValues>({
    resolver: zodResolver(CertFormSchema),
    defaultValues: {
      certificationName: initial?.certificationName ?? '',
      issuingOrganization: initial?.issuingOrganization ?? '',
      issueDate: toMonthInput(initial?.issueDate),
      expirationDate: toMonthInput(initial?.expirationDate),
    },
    mode: 'onChange',
  })

  const handleNeverExpiresChange = (checked: boolean) => {
    setNeverExpires(checked)
    if (checked) {
      setValue('expirationDate', '', { shouldValidate: false })
    }
  }

  const onSubmit = (values: CertFormValues) => {
    onSave({
      id: initial?.id ?? generateUUID(),
      certificationName: values.certificationName,
      issuingOrganization: values.issuingOrganization,
      issueDate: toStorageDate(values.issueDate),
      expirationDate:
        neverExpires || !values.expirationDate
          ? undefined
          : toStorageDate(values.expirationDate),
      neverExpires,
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
          label="Certification Name"
          id="cert-name"
          required
          error={errors.certificationName?.message}
        >
          <Input
            id="cert-name"
            placeholder="AWS Certified Developer"
            className={inputCls(!!errors.certificationName)}
            aria-invalid={!!errors.certificationName}
            aria-describedby={errors.certificationName ? 'cert-name-error' : undefined}
            {...register('certificationName')}
          />
        </Field>

        <Field
          label="Issuing Organization"
          id="cert-org"
          required
          error={errors.issuingOrganization?.message}
        >
          <Input
            id="cert-org"
            placeholder="Amazon Web Services"
            className={inputCls(!!errors.issuingOrganization)}
            aria-invalid={!!errors.issuingOrganization}
            aria-describedby={errors.issuingOrganization ? 'cert-org-error' : undefined}
            {...register('issuingOrganization')}
          />
        </Field>

        <Field
          label="Issue Date"
          id="cert-issueDate"
          required
          error={errors.issueDate?.message}
        >
          <Input
            id="cert-issueDate"
            type="month"
            className={inputCls(!!errors.issueDate)}
            aria-invalid={!!errors.issueDate}
            aria-describedby={errors.issueDate ? 'cert-issueDate-error' : undefined}
            {...register('issueDate')}
          />
        </Field>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="cert-expirationDate" className="text-sm font-medium leading-none">
              Expiration Date
            </label>
            <label
              htmlFor="cert-neverExpires"
              className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground select-none"
            >
              <div
                role="checkbox"
                aria-checked={neverExpires}
                id="cert-neverExpires"
                tabIndex={0}
                onClick={() => handleNeverExpiresChange(!neverExpires)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault()
                    handleNeverExpiresChange(!neverExpires)
                  }
                }}
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                  neverExpires
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input bg-background'
                )}
              >
                {neverExpires && <Check className="h-2.5 w-2.5" />}
              </div>
              <Infinity className="h-3 w-3" />
              No Expiration
            </label>
          </div>
          <Input
            id="cert-expirationDate"
            type="month"
            disabled={neverExpires}
            className={cn(
              inputCls(!!errors.expirationDate),
              neverExpires && 'cursor-not-allowed opacity-40'
            )}
            aria-invalid={!!errors.expirationDate}
            aria-describedby={errors.expirationDate ? 'cert-expirationDate-error' : undefined}
            {...register('expirationDate')}
          />
          {errors.expirationDate && (
            <p id="cert-expirationDate-error" role="alert" className="text-xs text-destructive">
              {errors.expirationDate.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-3.5 w-3.5" />
          Cancel
        </Button>
        <Button type="submit" size="sm">
          <Check className="h-3.5 w-3.5" />
          {initial ? 'Save Changes' : 'Add Certification'}
        </Button>
      </div>
    </form>
  )
}

// ── Entry card ────────────────────────────────────────────────────────────────

interface EntryCardProps {
  entry: CertificationEntry
  onEdit: () => void
  onDelete: () => void
}

function EntryCard({ entry, onEdit, onDelete }: EntryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const dateRange = entry.neverExpires
    ? `${formatDisplayDate(entry.issueDate)} – No Expiration`
    : entry.expirationDate
    ? `${formatDisplayDate(entry.issueDate)} – ${formatDisplayDate(entry.expirationDate)}`
    : formatDisplayDate(entry.issueDate)

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
            {entry.certificationName}
          </span>
          <span className="text-xs text-muted-foreground">
            {entry.issuingOrganization} · {dateRange}
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onEdit}
            aria-label={`Edit ${entry.certificationName}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            aria-label={`Delete ${entry.certificationName}`}
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

      {expanded && (
        <div className="border-t px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Issued: {formatDisplayDate(entry.issueDate)}
            {entry.neverExpires
              ? ' · No Expiration'
              : entry.expirationDate
              ? ` · Expires: ${formatDisplayDate(entry.expirationDate)}`
              : ' · No expiration'}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Main CertificationsForm ───────────────────────────────────────────────────

interface CertificationsFormProps {
  entries: CertificationEntry[]
  onChange: (entries: CertificationEntry[]) => void
}

export const CertificationsForm = memo(function CertificationsForm({
  entries,
  onChange,
}: CertificationsFormProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleSave = useCallback(
    (entry: CertificationEntry) => {
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
          Add Certification
        </Button>
      )}
    </div>
  )
})
