import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: 'https://cv-maker.riffatur.site/sitemap.xml',
    host: 'https://cv-maker.riffatur.site',
  }
}
