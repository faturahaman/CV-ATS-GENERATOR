'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportToPDF } from '@/lib/export-pdf'
import type { Resume } from '@/types/resume'

interface ExportPanelProps {
  resume: Resume
}

export function ExportPanel({ resume }: ExportPanelProps) {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExportPDF = async () => {
    setExporting(true)
    setError(null)
    try {
      // jsPDF runs synchronously but we wrap in a microtask so the loading
      // state renders before the (potentially blocking) PDF generation starts.
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          try {
            exportToPDF(resume)
            resolve()
          } catch (err) {
            reject(err)
          }
        }, 0)
      })
    } catch (err) {
      console.error('PDF export failed:', err)
      setError('Failed to generate PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const hasContent =
    resume.personalDetails.fullName?.trim() ||
    resume.experience.length > 0 ||
    resume.education.length > 0 ||
    resume.skills.length > 0

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Download your resume as an ATS-friendly PDF. The file will be named{' '}
        <span className="font-mono">
          CV_[Name]_[Date].pdf
        </span>
        .
      </p>

      <Button
        type="button"
        onClick={handleExportPDF}
        disabled={exporting || !hasContent}
        className="w-full"
        aria-label="Export resume as PDF"
      >
        <Download className="h-4 w-4" />
        {exporting ? 'Generating PDF…' : 'Export as PDF'}
      </Button>

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
  )
}
