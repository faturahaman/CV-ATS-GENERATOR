'use client'

import { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SupportModal } from '@/components/modals/SupportModal'
import type { Resume } from '@/types/resume'

interface ExportPanelProps {
  resume: Resume
}

export function ExportPanel({ resume }: ExportPanelProps) {
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportingDocx, setExportingDocx] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supportOpen, setSupportOpen] = useState(false)

  const hasContent =
    resume.personalDetails.fullName?.trim() ||
    resume.experience.length > 0 ||
    resume.education.length > 0 ||
    resume.skills.length > 0

  const handleExportPDF = async () => {
    setExportingPdf(true)
    setError(null)
    try {
      const { exportToPDF } = await import('@/lib/export-pdf')
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
      setSupportOpen(true)
    } catch (err) {
      console.error('PDF export failed:', err)
      setError('Failed to generate PDF. Please try again.')
    } finally {
      setExportingPdf(false)
    }
  }

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

  const isExporting = exportingPdf || exportingDocx

  return (
    <>
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">
          Download your resume as an ATS-friendly PDF or DOCX. Files are named{' '}
          <span className="font-mono">CV_[Name]_[Date]</span>.
        </p>

        <div className="flex flex-col gap-2">
          {/* PDF */}
          <Button
            type="button"
            onClick={handleExportPDF}
            disabled={isExporting || !hasContent}
            className="w-full"
            aria-label="Export resume as PDF"
          >
            <Download className="h-4 w-4" />
            {exportingPdf ? 'Generating PDF…' : 'Export as PDF'}
          </Button>

          {/* DOCX */}
          <Button
            type="button"
            variant="outline"
            onClick={handleExportDocx}
            disabled={isExporting || !hasContent}
            className="w-full"
            aria-label="Export resume as DOCX"
          >
            <FileText className="h-4 w-4" />
            {exportingDocx ? 'Generating DOCX…' : 'Export as DOCX'}
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

      <SupportModal open={supportOpen} onOpenChange={setSupportOpen} />
    </>
  )
}
