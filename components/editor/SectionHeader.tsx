'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  isExpanded: boolean
  onToggle: () => void
  icon?: React.ReactNode
}

/**
 * Collapsible section header used inside FormPanel.
 * Clicking anywhere on the header toggles the expanded/collapsed state.
 */
export function SectionHeader({
  title,
  isExpanded,
  onToggle,
  icon,
}: SectionHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isExpanded}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-md px-1 py-2',
        'text-left transition-colors hover:bg-muted/50 focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'
      )}
    >
      <span className="flex items-center gap-2">
        {icon && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground">
            {icon}
          </span>
        )}
        <span className="text-sm font-semibold">{title}</span>
      </span>

      <span className="shrink-0 text-muted-foreground" aria-hidden>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </span>
    </button>
  )
}
