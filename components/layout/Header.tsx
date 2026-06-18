'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Globe, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useResumeStore } from '@/store/resume-store'
import { translations } from '@/i18n/translations'

const PRIVACY_DISMISSED_KEY = 'privacy-notice-dismissed'

export function Header() {
  const language = useResumeStore((s) => s.language)
  const setLanguage = useResumeStore((s) => s.setLanguage)
  const t = translations[language]

  const [privacyVisible, setPrivacyVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(PRIVACY_DISMISSED_KEY)
    if (!dismissed) setPrivacyVisible(true)
  }, [])

  const dismissPrivacy = () => {
    localStorage.setItem(PRIVACY_DISMISSED_KEY, '1')
    setPrivacyVisible(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between px-4 sm:px-6">
        {/* Wordmark — Medium-style serif logo */}
        <Link
          href="/"
          className="flex items-center gap-0 select-none"
          aria-label="ATS CV Generator home"
        >
          <span
            className="text-xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            ATS
          </span>
          <span
            className="text-xl font-normal tracking-tight text-primary ml-1"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            CV Generator
          </span>
        </Link>

        {/* Right controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground text-sm font-normal"
          >
            <Link href="/">{t.nav.home}</Link>
          </Button>

          {/* Language selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground text-sm font-normal"
              >
                <Globe className="size-3.5" />
                {language}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]">
              <DropdownMenuItem
                onClick={() => setLanguage('EN')}
                data-active={language === 'EN'}
                className="data-[active=true]:font-medium text-sm"
              >
                {t.language.english}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage('ID')}
                data-active={language === 'ID'}
                className="data-[active=true]:font-medium text-sm"
              >
                {t.language.indonesian}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Privacy notice — dismissible sub-bar */}
      {privacyVisible && (
        <div className="border-t border-border/40 bg-muted/30 px-4 py-1.5 sm:px-6">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="size-3 shrink-0 text-green-600 dark:text-green-500" />
              <span>
                <ShieldCheck className="h-4 w-4" />
              </span> {t.privacy.message}
            </p>
            <button
              type="button"
              onClick={dismissPrivacy}
              aria-label={t.privacy.dismiss}
              className="flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="size-3" />
              {t.privacy.dismiss}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
