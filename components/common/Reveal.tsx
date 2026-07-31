'use client'

import { useReveal } from '@/hooks/use-reveal'
import { cn } from '@/lib/utils'

interface RevealProps {
  children: React.ReactNode
  className?: string
  /** Stagger delay in ms — cascades a group of Reveals into view. */
  delay?: number
  as?: 'div' | 'section' | 'li' | 'article'
}

/**
 * Scroll-reveal wrapper. Fades + slides its children into view once, when they
 * enter the viewport. Honors prefers-reduced-motion via the underlying hook and
 * `.reveal` styles in globals.css.
 */
export function Reveal({ children, className, delay = 0, as = 'div' }: RevealProps) {
  const ref = useReveal<HTMLElement>()
  const Comp = as as React.ElementType
  return (
    <Comp
      ref={ref}
      className={cn('reveal', className)}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Comp>
  )
}
