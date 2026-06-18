'use client'

import { useRouter } from 'next/navigation'
import { useResumeStore } from '@/store/resume-store'
import { ResumeListView } from '@/components/resume-list/ResumeListView'
import { Header } from '@/components/layout/Header'
import { translations } from '@/i18n/translations'
import { ShieldCheck } from 'lucide-react'

const siteUrl = 'https://cv-maker.riffatur.site'

// JSON-LD: WebSite + WebApplication + Organization
const jsonLd = [
  // 1. WebSite — enables Sitelinks & brand recognition
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CV Maker ATS Gratis',
    alternateName: ['CV Maker Gratis', 'Pembuat CV ATS', 'ATS CV Maker'],
    url: siteUrl,
    description:
      'CV Maker ATS Gratis untuk membuat CV profesional yang ramah ATS. Buat CV online gratis dengan template modern, AI Resume Builder, dan download PDF secara instan.',
    inLanguage: ['id', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  },
  // 2. WebApplication — SaaS tool details
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CV Maker ATS Gratis',
    url: siteUrl,
    description:
      'CV Maker ATS Gratis untuk membuat CV profesional yang ramah ATS. Buat CV online gratis dengan template modern, AI Resume Builder, dan download PDF secara instan.',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Resume Builder',
    operatingSystem: 'Web, iOS, Android',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock',
      description: 'Gratis selamanya — tidak perlu daftar atau kartu kredit.',
    },
    featureList: [
      'ATS Score Checker otomatis',
      'AI-powered CV & resume generation',
      'Export CV ke PDF dan DOCX',
      'Template CV ATS friendly',
      'Gratis tanpa daftar akun',
      'Mendukung Bahasa Indonesia dan Inggris',
      'AI improve experience & summary',
      'Suggest skills otomatis',
    ],
    screenshot: `${siteUrl}/cover.png`,
    inLanguage: ['id', 'en'],
    author: {
      '@type': 'Person',
      name: 'Riffatur',
      url: 'https://riffatur.site',
    },
  },
  // 3. Organization — builds brand authority
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Riffatur',
    url: 'https://riffatur.site',
    logo: `${siteUrl}/logos.png`,
    sameAs: ['https://riffatur.site'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['Indonesian', 'English'],
    },
  },
]

export default function HomePage() {
  const router = useRouter()
  const deleteResume = useResumeStore((s) => s.deleteResume)
  const duplicateResume = useResumeStore((s) => s.duplicateResume)
  const language = useResumeStore((s) => s.language)
  const t = translations[language]

  const handleEdit = (id: string) => {
    router.push(`/resumes/${id}`)
  }

  const handleDuplicate = (id: string) => {
    duplicateResume(id)
  }

  const handleDelete = (id: string) => {
    deleteResume(id)
  }

  return (
    <>
      {/* JSON-LD structured data — 3 schemas for Google */}
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <Header />

      {/* SEO text block — readable by crawlers, hidden from UI */}
      <section className="sr-only" aria-hidden="false">
        <h1>CV Maker ATS Gratis — Pembuat CV Online Profesional</h1>
        <p>
          CV Maker ATS Gratis untuk membuat CV profesional yang ramah ATS. Buat CV online gratis
          dengan template modern, AI Resume Builder, dan download PDF secara instan. Cocok untuk
          fresh graduate, mahasiswa magang, dan profesional.
        </p>
        <ul>
          <li>CV maker gratis tanpa daftar akun</li>
          <li>ATS CV maker dengan cek skor ATS otomatis</li>
          <li>Pembuat CV ATS gratis berbahasa Indonesia</li>
          <li>Export CV ke PDF dan Word (DOCX)</li>
          <li>Template CV ATS friendly untuk fresh graduate</li>
          <li>AI resume builder untuk summary dan pengalaman kerja</li>
          <li>Resume builder gratis untuk lamaran kerja</li>
          <li>Generator CV gratis dan resume ats online</li>
        </ul>
      </section>

      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <ResumeListView
          onCreateNew={() => { }}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      </main>

      <footer className="border-t border-border/60 py-6">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 flex flex-col items-center gap-2 text-center">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <span>{t.privacy.message}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}{' '}
            <a
              href="https://riffatur.site"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              riffatur.site
            </a>
            . All rights reserved.
          </p>
        </div>
      </footer>
    </>
  )
}
