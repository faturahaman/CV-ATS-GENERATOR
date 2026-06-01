'use client'

import { useState } from 'react'
import { Download, FileText, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { SupportModal } from '@/components/modals/SupportModal'
import type { Resume } from '@/types/resume'

interface ExportPanelProps {
  resume: Resume
}

export function ExportPanel({ resume }: ExportPanelProps) {
  const [exportingDocx, setExportingDocx] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supportOpen, setSupportOpen] = useState(false)
  const [pdfNoticeOpen, setPdfNoticeOpen] = useState(false)

  const hasContent =
    resume.personalDetails.fullName?.trim() ||
    resume.experience.length > 0 ||
    resume.education.length > 0 ||
    resume.skills.length > 0

  const handleExportDocx = async () => {
    setExportingDocx(true)
    setError(null)
    try {
      const { exportToDocx } = await import('@/lib/export-docx')
      await exportToDocx(resume)
      setSupportOpen(true)
    } catch (err) {
      console.error('DOCX export failed:', err)
      setError('Failed to generate DOCX. Please try again.')
    } finally {
      setExportingDocx(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">
          Download your resume as an ATS-friendly DOCX. Files are named{' '}
          <span className="font-mono">CV_[Name]_[Date]</span>.
        </p>

        <div className="flex flex-col gap-2">
          {/* DOCX */}
          <Button
            type="button"
            onClick={handleExportDocx}
            disabled={exportingDocx || !hasContent}
            className="w-full"
            aria-label="Export resume as DOCX"
          >
            <FileText className="h-4 w-4" />
            {exportingDocx ? 'Generating DOCX…' : 'Export as DOCX'}
          </Button>

          {/* PDF — coming soon */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setPdfNoticeOpen(true)}
            disabled={!hasContent}
            className="w-full"
            aria-label="Export resume as PDF"
          >
            <Download className="h-4 w-4" />
            Export as PDF
          </Button>
        </div>

        {!hasContent && (
          <p className="text-xs text-muted-foreground">
            Add your name or at least one section before exporting.
          </p>
        )}

        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>

      {/* PDF coming soon notice */}
      <Dialog open={pdfNoticeOpen} onOpenChange={setPdfNoticeOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              PDF Export Coming Soon
            </DialogTitle>
            <DialogDescription>
              We're still working on making the PDF export look perfect. For now, please use the DOCX export — the layout and formatting are already polished and ATS-friendly.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPdfNoticeOpen(false)}
            >
              Got it
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setPdfNoticeOpen(false)
                handleExportDocx()
              }}
              disabled={exportingDocx}
            >
              <FileText className="h-4 w-4" />
              Export as DOCX instead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SupportModal open={supportOpen} onOpenChange={setSupportOpen} />
    </>
  )
}
