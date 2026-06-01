'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PersonalDetailsSchema } from '@/lib/validations'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { PersonalDetails } from '@/types/resume'

// Scope the schema to only the fields we render in this MVP
const FormSchema = PersonalDetailsSchema.pick({
  fullName: true,
  email: true,
  phoneNumber: true,
  jobTarget: true,
  country: true,
  linkedinUrl: true,
  githubUrl: true,
  portfolioUrl: true,
})

type FormValues = z.infer<typeof FormSchema>

interface PersonalDetailsFormProps {
  defaultValues: PersonalDetails
  onChange: (values: Partial<PersonalDetails>) => void
}

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
        {required && <span className="ml-0.5 text-destructive" aria-hidden>*</span>}
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

export function PersonalDetailsForm({ defaultValues, onChange }: PersonalDetailsFormProps) {
  const {
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      fullName: defaultValues.fullName ?? '',
      email: defaultValues.email ?? '',
      phoneNumber: defaultValues.phoneNumber ?? '',
      jobTarget: defaultValues.jobTarget ?? '',
      country: defaultValues.country ?? '',
      linkedinUrl: defaultValues.linkedinUrl ?? '',
      githubUrl: defaultValues.githubUrl ?? '',
      portfolioUrl: defaultValues.portfolioUrl ?? '',
    },
    mode: 'onChange',
  })

  // When the store hydrates from localStorage, defaultValues will change from
  // empty strings to the persisted values. Reset the form to pick them up,
  // but only once (tracked by whether fullName was empty on first render).
  const hydratedRef = useRef(false)
  useEffect(() => {
    if (!hydratedRef.current && defaultValues.fullName) {
      hydratedRef.current = true
      reset({
        fullName: defaultValues.fullName ?? '',
        email: defaultValues.email ?? '',
        phoneNumber: defaultValues.phoneNumber ?? '',
        jobTarget: defaultValues.jobTarget ?? '',
        country: defaultValues.country ?? '',
        linkedinUrl: defaultValues.linkedinUrl ?? '',
        githubUrl: defaultValues.githubUrl ?? '',
        portfolioUrl: defaultValues.portfolioUrl ?? '',
      })
    }
  }, [defaultValues, reset])

  // Propagate every change up to the parent with 300ms debounce to avoid
  // triggering a store write + localStorage persist on every keystroke.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const debouncedOnChange = useCallback(
    (values: Partial<PersonalDetails>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onChange(values)
      }, 300)
    },
    [onChange]
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library
    const subscription = watch((values) => {
      debouncedOnChange(values as Partial<PersonalDetails>)
    })
    return () => {
      subscription.unsubscribe()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [watch, debouncedOnChange])

  const inputClass = (hasError: boolean) =>
    cn('h-9', hasError && 'border-destructive focus-visible:ring-destructive/20')

  return (
    <div className="flex flex-col gap-5">
      {/* Required fields */}
      <div className="flex flex-col gap-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Required
        </h3>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <Field
            label="Full Name"
            id="fullName"
            required
            error={errors.fullName?.message}
          >
            <Input
              id="fullName"
              placeholder="John"
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              className={inputClass(!!errors.fullName)}
              {...register('fullName')}
            />
          </Field>

          <Field
            label="Job Target"
            id="jobTarget"
            required
            error={errors.jobTarget?.message}
          >
            <Input
              id="jobTarget"
              placeholder="Software Engineer"
              aria-invalid={!!errors.jobTarget}
              aria-describedby={errors.jobTarget ? 'jobTarget-error' : undefined}
              className={inputClass(!!errors.jobTarget)}
              {...register('jobTarget')}
            />
          </Field>

          <Field
            label="Email"
            id="email"
            required
            error={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={inputClass(!!errors.email)}
              {...register('email')}
            />
          </Field>

          <Field
            label="Phone Number"
            id="phoneNumber"
            required
            error={errors.phoneNumber?.message}
          >
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+62 812 3456 7890"
              aria-invalid={!!errors.phoneNumber}
              aria-describedby={errors.phoneNumber ? 'phoneNumber-error' : undefined}
              className={inputClass(!!errors.phoneNumber)}
              {...register('phoneNumber')}
            />
          </Field>

          <Field
            label="Country"
            id="country"
            required
            error={errors.country?.message}
          >
            <Input
              id="country"
              placeholder="Indonesia"
              aria-invalid={!!errors.country}
              aria-describedby={errors.country ? 'country-error' : undefined}
              className={inputClass(!!errors.country)}
              {...register('country')}
            />
          </Field>
        </div>
      </div>

      {/* Recommended fields */}
      <div className="flex flex-col gap-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Recommended
        </h3>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <Field
            label="LinkedIn URL"
            id="linkedinUrl"
            error={errors.linkedinUrl?.message}
          >
            <Input
              id="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/in/johndoe"
              aria-invalid={!!errors.linkedinUrl}
              aria-describedby={errors.linkedinUrl ? 'linkedinUrl-error' : undefined}
              className={inputClass(!!errors.linkedinUrl)}
              {...register('linkedinUrl')}
            />
          </Field>

          <Field
            label="GitHub URL"
            id="githubUrl"
            error={errors.githubUrl?.message}
          >
            <Input
              id="githubUrl"
              type="url"
              placeholder="https://github.com/johndoe"
              aria-invalid={!!errors.githubUrl}
              aria-describedby={errors.githubUrl ? 'githubUrl-error' : undefined}
              className={inputClass(!!errors.githubUrl)}
              {...register('githubUrl')}
            />
          </Field>

          <Field
            label="Portfolio URL"
            id="portfolioUrl"
            error={errors.portfolioUrl?.message}
          >
            <Input
              id="portfolioUrl"
              type="url"
              placeholder="https://johndoe.dev"
              aria-invalid={!!errors.portfolioUrl}
              aria-describedby={errors.portfolioUrl ? 'portfolioUrl-error' : undefined}
              className={inputClass(!!errors.portfolioUrl)}
              {...register('portfolioUrl')}
            />
          </Field>
        </div>
      </div>
    </div>
  )
}
