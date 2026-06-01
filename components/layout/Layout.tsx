'use client'

import { Header } from '@/components/layout/Header'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-6 mt-auto">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 flex items-center justify-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}{' '}
          <a
            href="https://rifatur.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            rifatur.io
          </a>
          . All rights reserved.
        </p>
      </div>
    </footer>
  )
}
