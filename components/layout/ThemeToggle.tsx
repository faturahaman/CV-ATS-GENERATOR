'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/use-theme'
import { useResumeStore } from '@/store/resume-store'
import { translations } from '@/i18n/translations'

/**
 * Theme toggle button — flips between light and dark. Backed by
 * useSyncExternalStore, so the icon reflects the real theme on first paint
 * without a hydration mismatch.
 */
export function ThemeToggle() {
  const { resolved, toggle } = useTheme()
  const language = useResumeStore((s) => s.language)
  const t = translations[language]

  const isDark = resolved === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      aria-label={t.theme.toggle}
      title={isDark ? t.theme.light : t.theme.dark}
      className="text-muted-foreground hover:text-foreground"
    >
      <span className="relative flex size-4 items-center justify-center">
        <Sun
          className={`absolute size-4 transition-all duration-300 ease-out ${
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
        <Moon
          className={`absolute size-4 transition-all duration-300 ease-out ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`}
        />
      </span>
    </Button>
  )
}
