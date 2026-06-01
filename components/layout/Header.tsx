'use client'

import Link from 'next/link'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useResumeStore } from '@/store/resume-store'
import { translations } from '@/i18n/translations'

export function Header() {
  const language = useResumeStore((s) => s.language)
  const setLanguage = useResumeStore((s) => s.setLanguage)

  const t = translations[language]

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / App title */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-primary">ATS</span>
          <span>CV Generator</span>
        </Link>

        {/* Right-side controls */}
        <div className="flex items-center gap-2">
          {/* Home navigation link */}
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">{t.nav.home}</Link>
          </Button>

          {/* Language selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Globe className="size-4" />
                {language}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setLanguage('EN')}
                data-active={language === 'EN'}
                className="data-[active=true]:font-medium"
              >
                {t.language.english}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage('ID')}
                data-active={language === 'ID'}
                className="data-[active=true]:font-medium"
              >
                {t.language.indonesian}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
