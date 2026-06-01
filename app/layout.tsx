import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'ATS CV Generator',
  description: 'Create ATS-friendly resumes with AI-powered content generation.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        {/* Site header */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="text-primary">ATS</span>
              <span>CV Generator</span>
            </Link>
          </div>
        </header>

        {children}
      </body>
    </html>
  )
}
