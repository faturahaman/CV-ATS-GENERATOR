'use client'

/**
 * useTheme Hook
 *
 * Lightweight theme manager (no next-themes dependency). Supports three
 * modes — 'light', 'dark', 'system' — and toggles the `dark` class on
 * <html>. The resolved theme (what's actually applied) is derived from the
 * preference plus the OS setting.
 *
 * The initial class is set by an inline script in layout.tsx BEFORE React
 * hydrates, preventing a flash of the wrong theme (FOUC). This hook subscribes
 * to localStorage + `prefers-color-scheme` via useSyncExternalStore, which is
 * hydration-safe and avoids setState-in-effect cascades.
 *
 * Persistence: localStorage key `theme`.
 */

import { useCallback, useSyncExternalStore } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'theme'

// Custom event so same-tab writes notify subscribers (storage event only fires cross-tab)
const THEME_EVENT = 'themechange'

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  return (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null) ?? 'system'
}

function applyTheme(mode: ThemeMode): ResolvedTheme {
  const resolved: ResolvedTheme = mode === 'system' ? getSystemTheme() : mode
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
  return resolved
}

// ── External store subscription (localStorage + OS theme) ───────────────────────

function subscribe(callback: () => void): () => void {
  const mql = window.matchMedia('(prefers-color-scheme: dark)')
  mql.addEventListener('change', callback)
  window.addEventListener('storage', callback)
  window.addEventListener(THEME_EVENT, callback)
  return () => {
    mql.removeEventListener('change', callback)
    window.removeEventListener('storage', callback)
    window.removeEventListener(THEME_EVENT, callback)
  }
}

/** Snapshot = "<mode>:<resolved>" so a single string captures both values. */
function getSnapshot(): string {
  const mode = readMode()
  const resolved = mode === 'system' ? getSystemTheme() : mode
  return `${mode}:${resolved}`
}

function getServerSnapshot(): string {
  return 'system:light'
}

export function useTheme() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [mode, resolved] = snapshot.split(':') as [ThemeMode, ResolvedTheme]

  const setMode = useCallback((next: ThemeMode) => {
    localStorage.setItem(THEME_STORAGE_KEY, next)
    applyTheme(next)
    window.dispatchEvent(new Event(THEME_EVENT))
  }, [])

  // Simple toggle between light <-> dark (resolves 'system' to its current value)
  const toggle = useCallback(() => {
    const current = getSnapshot().split(':')[1] as ResolvedTheme
    setMode(current === 'dark' ? 'light' : 'dark')
  }, [setMode])

  return { mode, resolved, setMode, toggle }
}

export default useTheme
