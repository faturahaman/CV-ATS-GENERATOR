'use client'

import { useRouter } from 'next/navigation'
import { useResumeStore } from '@/store/resume-store'
import { ResumeListView } from '@/components/resume-list/ResumeListView'
import { Header } from '@/components/layout/Header'
import { Reveal } from '@/components/common/Reveal'
import { translations } from '@/i18n/translations'
import {
  ShieldCheck,
  ChevronDown,
  Sparkles,
  BarChart3,
  FileDown,
  Lock,
} from 'lucide-react'
import { useState } from 'react'

const siteUrl = 'https://cv-maker.riffatur.site'

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const faqsData = {
  EN: [
    {
      q: 'What is an ATS CV?',
      a: 'An ATS CV (Applicant Tracking System) is a resume format designed to be parsed by automated recruitment systems. It prioritizes clean text structure, relevant keywords, and a standard layout so your application reaches a human recruiter instead of being filtered out automatically.',
    },
    {
      q: 'Is this ATS CV Maker really free?',
      a: 'Yes, completely free. No account registration, no credit card required. All features — including the AI Resume Builder, ATS Score Checker, and PDF & DOCX export — are available at no cost.',
    },
    {
      q: 'Can I download my CV as a PDF?',
      a: 'Yes. Once you finish editing, you can export your CV directly to PDF or DOCX (Word) in one click. PDF is ideal for sending to recruiters, while DOCX is handy if you need to make further edits.',
    },
    {
      q: 'Is this CV Maker suitable for fresh graduates?',
      a: 'Absolutely. Our CV template is designed to be ATS-friendly for all experience levels — from fresh graduates and internship applicants to seasoned professionals. The AI will help you write a compelling summary and experience descriptions even if your work history is limited.',
    },
    {
      q: 'Does it support Bahasa Indonesia?',
      a: 'Yes. The tool supports two languages: Bahasa Indonesia and English. You can switch the interface language at any time, and the AI can generate content in either language based on your preference.',
    },
    {
      q: 'Is my CV data safe?',
      a: 'Your data is stored 100% in your own browser (localStorage) — nothing is sent to any server. Your CV is completely private and secure. You can even continue editing while offline.',
    },
    {
      q: 'How do I check my ATS score?',
      a: 'After filling in your CV, open the "ATS Score" tab in the editor. The system will automatically analyze your CV and return a score along with specific recommendations — from contact completeness and summary quality to missing skill keywords.',
    },
  ],
  ID: [
    {
      q: 'Apa itu CV ATS?',
      a: 'CV ATS (Applicant Tracking System) adalah format CV yang dirancang agar bisa dibaca dan diproses oleh sistem rekrutmen otomatis. CV ATS mengutamakan struktur teks yang bersih, keyword yang relevan, dan format standar agar tidak tersaring sebelum sampai ke rekruter.',
    },
    {
      q: 'Apakah CV Maker ATS Gratis ini benar-benar gratis?',
      a: 'Ya, sepenuhnya gratis. Tidak perlu daftar akun, tidak perlu kartu kredit. Semua fitur — termasuk AI Resume Builder, ATS Score Checker, dan export ke PDF & DOCX — bisa kamu gunakan langsung tanpa biaya.',
    },
    {
      q: 'Apakah saya bisa download CV ke PDF?',
      a: 'Ya. Setelah selesai mengisi CV, kamu bisa export langsung ke PDF atau DOCX (Word) dengan satu klik. Format PDF cocok untuk dikirim ke rekruter, sedangkan DOCX cocok jika kamu perlu mengeditnya lebih lanjut.',
    },
    {
      q: 'Apakah CV Maker ini cocok untuk fresh graduate?',
      a: 'Sangat cocok. Template CV kami dirancang khusus agar ramah ATS untuk semua level — termasuk fresh graduate, mahasiswa yang melamar magang, hingga profesional berpengalaman. AI akan membantu kamu menulis summary dan deskripsi pengalaman yang meyakinkan meski pengalaman kerja masih terbatas.',
    },
    {
      q: 'Apakah mendukung Bahasa Indonesia?',
      a: 'Ya. CV Maker ini mendukung dua bahasa: Bahasa Indonesia dan English. Kamu bisa switch bahasa antarmuka kapan saja, dan AI-nya pun bisa menghasilkan konten dalam Bahasa Indonesia maupun Inggris sesuai kebutuhanmu.',
    },
    {
      q: 'Apakah data CV saya aman?',
      a: 'Data kamu tersimpan 100% di browser kamu sendiri (localStorage) — tidak dikirim ke server manapun. CV kamu sepenuhnya privat dan aman, bahkan saat kamu offline pun bisa tetap mengedit.',
    },
    {
      q: 'Bagaimana cara cek skor ATS CV saya?',
      a: 'Setelah mengisi CV, buka tab "ATS Score" di editor. Sistem akan menganalisis CV kamu secara otomatis dan memberikan skor beserta rekomendasi spesifik — mulai dari kelengkapan kontak, kualitas summary, hingga keyword skills yang perlu ditambahkan.',
    },
  ],
}

// ─── JSON-LD schemas ─────────────────────────────────────────────────────────
// FAQPage merges both languages so Google can surface either locale's rich result.
const jsonLd = [
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
      target: `${siteUrl}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },
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
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Riffatur',
    url: 'https://riffatur.site',
    logo: `${siteUrl}/logos.png`,
    sameAs: ['https://riffatur.site'],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [...faqsData.ID, ...faqsData.EN].map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a,
      },
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Cara membuat CV ATS gratis',
    description:
      'Buat CV profesional yang ramah ATS dalam empat langkah: isi data, optimasi dengan AI, cek skor ATS, dan download PDF.',
    totalTime: 'PT10M',
    inLanguage: 'id',
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Isi data CV', text: 'Masukkan data pribadi, pengalaman, pendidikan, dan keahlian.' },
      { '@type': 'HowToStep', position: 2, name: 'Optimasi dengan AI', text: 'Gunakan AI untuk menulis atau memperbaiki ringkasan dan deskripsi pengalaman.' },
      { '@type': 'HowToStep', position: 3, name: 'Cek skor ATS', text: 'Analisis CV kamu dan perbaiki masalah yang paling berpengaruh.' },
      { '@type': 'HowToStep', position: 4, name: 'Download & lamar', text: 'Export ke PDF atau DOCX lalu mulai melamar pekerjaan.' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
    ],
  },
]

// ─── FAQ accordion item — smooth height animation via grid-rows ─────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border/60 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
        aria-expanded={open}
      >
        <span>{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-out ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {/* grid-rows 0fr -> 1fr gives a smooth, content-aware height transition */}
      <div className={`accordion-content ${open ? 'is-open' : ''}`}>
        <div className="accordion-inner">
          <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Feature icons (keyed to translation order) ─────────────────────────────────
const featureIcons = [
  <Sparkles key="0" className="h-5 w-5" />,
  <BarChart3 key="1" className="h-5 w-5" />,
  <FileDown key="2" className="h-5 w-5" />,
  <Lock key="3" className="h-5 w-5" />,
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter()
  const deleteResume = useResumeStore((s) => s.deleteResume)
  const duplicateResume = useResumeStore((s) => s.duplicateResume)
  const language = useResumeStore((s) => s.language)
  const t = translations[language]

  const handleEdit = (id: string) => router.push(`/resumes/${id}`)
  const handleDuplicate = (id: string) => duplicateResume(id)
  const handleDelete = (id: string) => deleteResume(id)

  return (
    <>
      {/* JSON-LD structured data */}
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <Header />

      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">

        {/* ── Visible H1 — seen by users AND crawlers ── */}
        <div className="mb-10 border-b border-border/60 pb-8 animate-fade-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-2">
            {t.home.heroTitle}
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            {t.home.heroSubtitle}
          </p>
        </div>

        {/* ── Resume list (h2 inside) ── */}
        <ResumeListView
          onCreateNew={() => { }}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />

        {/* ── Features ── */}
        <section className="mt-20" aria-labelledby="features-heading">
          <Reveal>
            <h2
              id="features-heading"
              className="text-lg font-semibold text-foreground mb-6"
            >
              {t.home.featuresTitle}
            </h2>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {t.home.features.map((f, i) => (
              <Reveal key={f.title} delay={i * 60}>
                <div className="flex h-full gap-3 rounded-xl border border-border/60 bg-card p-4 transition-all duration-200 ease-out hover:border-border hover:shadow-sm">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {featureIcons[i]}
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="mt-20" aria-labelledby="how-heading">
          <Reveal>
            <h2 id="how-heading" className="text-lg font-semibold text-foreground mb-1">
              {t.home.howTitle}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">{t.home.howSubtitle}</p>
          </Reveal>
          <ol className="flex flex-col gap-3">
            {t.home.steps.map((s, i) => (
              <Reveal key={s.title} as="li" delay={i * 60}>
                <div className="flex gap-4 rounded-xl border border-border/60 bg-card p-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold tabular-nums">
                    {i + 1}
                  </span>
                  <div className="flex flex-col gap-0.5 pt-0.5">
                    <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* ── About / SEO prose ── */}
        <section className="mt-20" aria-labelledby="about-heading">
          <Reveal>
            <h2 id="about-heading" className="text-lg font-semibold text-foreground mb-4">
              {t.home.aboutTitle}
            </h2>
            <div className="flex flex-col gap-4">
              {t.home.aboutParagraphs.map((p, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ── FAQ section ── */}
        <section className="mt-20" aria-labelledby="faq-heading">
          <Reveal>
            <h2 id="faq-heading" className="text-lg font-semibold text-foreground mb-1">
              {t.home.faqTitle}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">{t.home.faqSubtitle}</p>
          </Reveal>
          <Reveal>
            <div className="rounded-lg border border-border/60 px-4">
              {faqsData[language].map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </Reveal>
        </section>

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
