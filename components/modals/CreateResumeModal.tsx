'use client'

import { useState } from 'react'
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

interface CreateResumeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (title: string) => void
}

export function CreateResumeModal({
  open,
  onOpenChange,
  onCreate,
}: CreateResumeModalProps) {
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      setError('Resume title is required.')
      return
    }
    if (trimmed.length > 100) {
      setError('Title must be 100 characters or less.')
      return
    }
    onCreate(trimmed)
    setTitle('')
    setError('')
    onOpenChange(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTitle('')
      setError('')
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Resume</DialogTitle>
          <DialogDescription>
            Give your resume a title to get started.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="resume-title" className="text-sm font-medium">
              Resume Title
            </label>
            <Input
              id="resume-title"
              placeholder="e.g. Software Engineer – Google"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (error) setError('')
              }}
              autoFocus
              aria-invalid={!!error}
              aria-describedby={error ? 'title-error' : undefined}
            />
            {error && (
              <p id="title-error" className="text-xs text-destructive">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Resume</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
