'use client'

/**
 * useReveal Hook
 *
 * Adds a scroll-triggered reveal animation to an element. Attaches an
 * IntersectionObserver that adds the `is-visible` class (see globals.css
 * `.reveal`) once the element scrolls into view, then disconnects so the
 * animation only plays once.
 *
 * Respects `prefers-reduced-motion`: when the user opts out of motion, the
 * element is revealed immediately without observing.
 *
 * Usage:
 *   const ref = useReveal<HTMLDivElement>()
 *   return <div ref={ref} className="reveal">…</div>
 */

import { useEffect, useRef } from 'react'

export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respect reduced-motion — reveal immediately, skip observing.
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      el.classList.add('is-visible')
      return
    }

    // SSR / unsupported fallback — reveal immediately.
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible')
      return
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      }
    }, options)

    observer.observe(el)
    return () => observer.disconnect()
    // options is intentionally not in deps — it's a static config per call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return ref
}

export default useReveal
