import type { Metadata, Viewport } from 'next'
import './globals.css'

const siteUrl = 'https://cv-maker.riffatur.site'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'CV Maker ATS Gratis',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  title: {
    default: 'CV Maker ATS Gratis | Pembuat CV Online Profesional',
    template: '%s | CV Maker ATS Gratis',
  },
  description:
    'CV Maker ATS Gratis untuk membuat CV profesional yang ramah ATS. Buat CV online gratis dengan template modern, AI Resume Builder, dan download PDF secara instan.',
  keywords: [
    'cv maker gratis',
    'pembuat cv ats gratis',
    'cv ats gratis',
    'cv maker indonesia',
    'buat cv online gratis',
    'cv ats online',
    'template cv ats gratis',
    'resume builder gratis',
    'resume maker gratis',
    'ats resume builder',
    'cv profesional gratis',
    'pembuat resume gratis',
    'website pembuat cv gratis',
    'cv lamaran kerja gratis',
    'template cv fresh graduate',
    'ai cv maker',
    'free cv maker',
    'online cv maker',
    'resume generator',
    'curriculum vitae maker',
    'buat cv ats gratis',
    'template cv ats indonesia',
    'cv ats untuk fresh graduate',
    'cv ats untuk magang',
    'cv untuk melamar kerja',
    'template cv profesional',
    'template resume ats',
    'resume ats gratis',
    'resume ats online',
    'cv creator gratis',
    'cv builder gratis',
    'pembuat cv profesional',
    'website buat cv gratis',
    'buat curriculum vitae online',
    'cv modern gratis',
    'cv sederhana',
    'cv elegan',
    'cv kreatif',
    'resume maker indonesia',
    'resume builder indonesia',
    'ats friendly cv',
    'ats friendly resume',
    'resume creator gratis',
    'generator cv gratis',
    'generator resume gratis',
  ],
  authors: [{ name: 'Riffatur', url: 'https://riffatur.site' }],
  creator: 'Riffatur',
  publisher: 'riffatur.site',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'id-ID': siteUrl,
      'en-US': siteUrl,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    alternateLocale: 'en_US',
    url: siteUrl,
    siteName: 'CV Maker ATS Gratis',
    title: 'CV Maker ATS Gratis | Pembuat CV Online Profesional',
    description:
      'CV Maker ATS Gratis untuk membuat CV profesional yang ramah ATS. Buat CV online gratis dengan template modern, AI Resume Builder, dan download PDF secara instan.',
    images: [
      {
        url: '/cover.png',
        width: 1200,
        height: 630,
        alt: 'CV Maker ATS Gratis - Pembuat CV Online Profesional',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CV Maker ATS Gratis | Pembuat CV Online Profesional',
    description:
      'CV Maker ATS Gratis untuk membuat CV profesional yang ramah ATS. Buat CV online gratis dengan template modern, AI Resume Builder, dan download PDF secara instan.',
    images: ['/cover.png'],
    creator: '@riffatur',
  },
  verification: {
    google: 'oHTD47KWSdu6re2wT5-CXMLi0-14Rb8dnudsPMhwTD8',
  },
  category: 'productivity',
  icons: {
    icon: [
      { url: '/logos.svg', type: 'image/svg+xml' },
      { url: '/logos.png', type: 'image/png', sizes: '192x192' },
    ],
    shortcut: '/logos.png',
    apple: '/logos.png',
  },
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
