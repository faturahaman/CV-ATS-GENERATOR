'use client'

import { Coffee, Heart, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface SupportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SupportModal({ open, onOpenChange }: SupportModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Support the Developer</DialogTitle>
        </DialogHeader>
        {/* Header strip */}
        <div className="bg-primary/5 border-b border-border/60 px-6 pt-6 pb-5 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <Heart className="size-4 text-primary fill-primary" />
            <span
              className="text-base font-bold text-foreground"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Built with ❤️ by Riffa
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your resume is being downloaded. Hope it lands you the job!
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4 text-center">
          <p className="text-sm text-foreground/80 leading-relaxed">
            This project is completely free and maintained independently.
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            If it helped you improve your resume or prepare for job applications,
            your support would be greatly appreciated.
          </p>

          {/* Donate button */}
          <a
            href="https://saweria.co/faturahdev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98]"
          >
            <Coffee className="size-4" />
            Support Development
          </a>

          {/* Skip */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 ease-out"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
