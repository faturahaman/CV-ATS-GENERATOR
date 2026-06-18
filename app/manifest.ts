import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CV Maker ATS Gratis',
    short_name: 'CV Maker ATS',
    description:
      'CV Maker ATS Gratis untuk membuat CV profesional yang ramah ATS. Buat CV online gratis dengan template modern, AI Resume Builder, dan download PDF secara instan.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/logos.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logos.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['productivity', 'utilities', 'business'],
    lang: 'id',
    dir: 'ltr',
  }
}
